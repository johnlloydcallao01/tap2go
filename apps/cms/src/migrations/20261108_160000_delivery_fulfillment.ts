import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  const { rows } = await db.execute(sql`
    SELECT
      to_regclass('public.delivery_fulfillment_outbox') IS NOT NULL
      AND to_regclass('public.delivery_fulfillment_attempts') IS NOT NULL
      AND to_regtype('public.enum_delivery_fulfillment_outbox_status') IS NOT NULL
      AND to_regtype('public.enum_delivery_fulfillment_attempts_status') IS NOT NULL
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'delivery_bookings'
          AND column_name = 'last_reconciled_at'
      )
      AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'payload_locked_documents_rels'
          AND column_name = 'delivery_fulfillment_attempts_id'
      ) AS schema_already_present
  `)

  if (rows[0]?.schema_already_present) {
    await db.execute(sql`
      INSERT INTO delivery_fulfillment_outbox (
        order_id,
        status,
        lalamove_order_id,
        manual_intervention_required,
        reconciliation_note
      )
      SELECT DISTINCT ON (o.id)
        o.id,
        CASE
          WHEN b.id IS NOT NULL THEN 'booked'::enum_delivery_fulfillment_outbox_status
          ELSE 'reconciliation_required'::enum_delivery_fulfillment_outbox_status
        END,
        COALESCE(b.lalamove_order_id, o.lalamove_order_id),
        b.id IS NULL AND COALESCE(b.lalamove_order_id, o.lalamove_order_id) IS NULL,
        CASE
          WHEN b.id IS NULL
            THEN 'Legacy paid delivery order: check Lalamove before creating a new booking.'
          ELSE NULL
        END
      FROM orders o
      JOIN transactions t ON t.order_id = o.id
      LEFT JOIN delivery_bookings b ON b.order_id = o.id
      WHERE o.fulfillment_type = 'delivery'
        AND t.status = 'paid'
        AND COALESCE(t.transaction_type, 'order') <> 'priority_fee'
      ORDER BY o.id, t.created_at DESC
      ON CONFLICT (order_id) DO NOTHING;
    `)
    return
  }

  await db.execute(sql`
    CREATE TYPE enum_delivery_fulfillment_outbox_status AS ENUM (
      'pending',
      'submitting',
      'booked',
      'retryable',
      'unknown',
      'reconciliation_required',
      'failed'
    );

    CREATE TYPE enum_delivery_fulfillment_attempts_status AS ENUM (
      'started',
      'booked',
      'retryable',
      'unknown',
      'failed'
    );

    CREATE TABLE delivery_fulfillment_outbox (
      id serial PRIMARY KEY,
      order_id integer NOT NULL UNIQUE,
      status enum_delivery_fulfillment_outbox_status NOT NULL DEFAULT 'pending',
      attempt_count numeric NOT NULL DEFAULT 0,
      next_attempt_at timestamptz,
      lease_expires_at timestamptz,
      last_attempt_at timestamptz,
      lalamove_order_id varchar,
      last_request_id varchar,
      last_error varchar,
      manual_intervention_required boolean NOT NULL DEFAULT false,
      manual_alerted_at timestamptz,
      reconciliation_note varchar,
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    );

    CREATE INDEX delivery_fulfillment_outbox_status_next_attempt_idx
      ON delivery_fulfillment_outbox(status, next_attempt_at);
    CREATE INDEX delivery_fulfillment_outbox_status_lease_expires_idx
      ON delivery_fulfillment_outbox(status, lease_expires_at);
    CREATE INDEX delivery_fulfillment_outbox_lalamove_order_id_idx
      ON delivery_fulfillment_outbox(lalamove_order_id);
    CREATE INDEX delivery_fulfillment_outbox_status_manual_intervention_idx
      ON delivery_fulfillment_outbox(status, manual_intervention_required);
    CREATE INDEX delivery_fulfillment_outbox_manual_alerted_at_idx
      ON delivery_fulfillment_outbox(manual_alerted_at);

    CREATE TABLE delivery_fulfillment_attempts (
      id serial PRIMARY KEY,
      outbox_id integer NOT NULL,
      attempt_number numeric NOT NULL,
      status enum_delivery_fulfillment_attempts_status NOT NULL DEFAULT 'started',
      request_id varchar NOT NULL UNIQUE,
      lalamove_order_id varchar,
      http_status numeric,
      error varchar,
      started_at timestamptz NOT NULL,
      completed_at timestamptz,
      updated_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    );

    ALTER TABLE delivery_fulfillment_attempts
      ADD CONSTRAINT delivery_fulfillment_attempts_outbox_id_fk
      FOREIGN KEY (outbox_id) REFERENCES delivery_fulfillment_outbox(id) ON DELETE SET NULL;
    ALTER TABLE delivery_fulfillment_outbox
      ADD CONSTRAINT delivery_fulfillment_outbox_order_id_fk
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL;

    ALTER TABLE payload_locked_documents_rels
      ADD COLUMN delivery_fulfillment_outbox_id integer,
      ADD COLUMN delivery_fulfillment_attempts_id integer;
    ALTER TABLE payload_locked_documents_rels
      ADD CONSTRAINT payload_locked_documents_rels_delivery_fulfillment_outbox_fk
      FOREIGN KEY (delivery_fulfillment_outbox_id)
      REFERENCES delivery_fulfillment_outbox(id) ON DELETE CASCADE,
      ADD CONSTRAINT payload_locked_documents_rels_delivery_fulfillment_attempts_fk
      FOREIGN KEY (delivery_fulfillment_attempts_id)
      REFERENCES delivery_fulfillment_attempts(id) ON DELETE CASCADE;

    CREATE INDEX delivery_fulfillment_outbox_order_idx
      ON delivery_fulfillment_outbox(order_id);
    CREATE INDEX delivery_fulfillment_outbox_updated_at_idx
      ON delivery_fulfillment_outbox(updated_at);
    CREATE INDEX delivery_fulfillment_outbox_created_at_idx
      ON delivery_fulfillment_outbox(created_at);
    CREATE INDEX delivery_fulfillment_attempts_outbox_idx
      ON delivery_fulfillment_attempts(outbox_id);
    CREATE INDEX delivery_fulfillment_attempts_updated_at_idx
      ON delivery_fulfillment_attempts(updated_at);
    CREATE INDEX delivery_fulfillment_attempts_created_at_idx
      ON delivery_fulfillment_attempts(created_at);
    CREATE INDEX payload_locked_documents_rels_delivery_fulfillment_outbox_idx
      ON payload_locked_documents_rels(delivery_fulfillment_outbox_id);
    CREATE INDEX payload_locked_documents_rels_delivery_fulfillment_attempts_idx
      ON payload_locked_documents_rels(delivery_fulfillment_attempts_id);
    CREATE INDEX delivery_fulfillment_attempts_outbox_attempt_idx
      ON delivery_fulfillment_attempts(outbox_id, attempt_number);

    ALTER TABLE delivery_bookings
      ADD COLUMN last_reconciled_at timestamptz,
      ADD COLUMN last_reconciliation_error varchar;
    CREATE INDEX delivery_bookings_status_last_reconciled_idx
      ON delivery_bookings(status, last_reconciled_at);

    INSERT INTO delivery_fulfillment_outbox (
      order_id,
      status,
      lalamove_order_id,
      manual_intervention_required,
      reconciliation_note
    )
    SELECT DISTINCT ON (o.id)
      o.id,
      CASE
        WHEN b.id IS NOT NULL THEN 'booked'::enum_delivery_fulfillment_outbox_status
        ELSE 'reconciliation_required'::enum_delivery_fulfillment_outbox_status
      END,
      COALESCE(b.lalamove_order_id, o.lalamove_order_id),
      b.id IS NULL AND COALESCE(b.lalamove_order_id, o.lalamove_order_id) IS NULL,
      CASE
        WHEN b.id IS NULL
          THEN 'Legacy paid delivery order: check Lalamove before creating a new booking.'
        ELSE NULL
      END
    FROM orders o
    JOIN transactions t ON t.order_id = o.id
    LEFT JOIN delivery_bookings b ON b.order_id = o.id
    WHERE o.fulfillment_type = 'delivery'
      AND t.status = 'paid'
      AND COALESCE(t.transaction_type, 'order') <> 'priority_fee'
    ORDER BY o.id, t.created_at DESC
    ON CONFLICT (order_id) DO NOTHING;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE payload_locked_documents_rels
      DROP COLUMN IF EXISTS delivery_fulfillment_attempts_id,
      DROP COLUMN IF EXISTS delivery_fulfillment_outbox_id;
    DROP TABLE IF EXISTS delivery_fulfillment_attempts;
    DROP TABLE IF EXISTS delivery_fulfillment_outbox;
    DROP INDEX IF EXISTS delivery_bookings_status_last_reconciled_idx;
    ALTER TABLE delivery_bookings
      DROP COLUMN IF EXISTS last_reconciliation_error,
      DROP COLUMN IF EXISTS last_reconciled_at;
    DROP TYPE IF EXISTS enum_delivery_fulfillment_attempts_status;
    DROP TYPE IF EXISTS enum_delivery_fulfillment_outbox_status;
  `)
}
