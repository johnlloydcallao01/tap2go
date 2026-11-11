"use client";

import { useState } from "react";

type FormValues = {
  name: string;
  email: string;
  accountRole: string;
  message: string;
  confirmedDeletion: boolean;
  website: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  accountRole: "customer",
  message: "",
  confirmedDeletion: false,
  website: "",
};

export function AccountDeletionForm() {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function updateField(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = event.target;
    const fieldValue = type === "checkbox" && event.target instanceof HTMLInputElement
      ? event.target.checked
      : value;
    setValues((current) => ({ ...current, [name]: fieldValue }));
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          topic: "account_deletion",
        }),
      });
      const result: { message?: string; error?: string } = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          message: result.error || "We could not submit your request. Please try again.",
        });
        return;
      }

      setValues(initialValues);
      setStatus({
        type: "success",
        message: "Your account deletion request has been submitted for review.",
      });
    } catch {
      setStatus({
        type: "error",
        message: "We could not connect right now. Please try again in a moment.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClassName =
    "mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-900 outline-none transition focus:border-orange-500 focus:ring-4 focus:ring-orange-100";

  return (
    <form
      onSubmit={submitForm}
      className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">Account request</p>
        <h2 className="heading-secondary mt-2 text-2xl text-stone-950">Request account deletion</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Tell us which account you want reviewed. We&apos;ll use the email address to follow up and verify
          your request.
        </p>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="deletion-name" className="text-sm font-semibold text-stone-800">
            Name on the account
          </label>
          <input
            id="deletion-name"
            name="name"
            value={values.name}
            onChange={updateField}
            className={inputClassName}
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
          />
        </div>
        <div>
          <label htmlFor="deletion-email" className="text-sm font-semibold text-stone-800">
            Account email address
          </label>
          <input
            id="deletion-email"
            name="email"
            type="email"
            value={values.email}
            onChange={updateField}
            className={inputClassName}
            autoComplete="email"
            maxLength={254}
            required
          />
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="deletion-role" className="text-sm font-semibold text-stone-800">
          Account type
        </label>
        <select
          id="deletion-role"
          name="accountRole"
          value={values.accountRole}
          onChange={updateField}
          className={inputClassName}
          required
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor / restaurant</option>
          <option value="driver">Driver / rider</option>
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="deletion-message" className="text-sm font-semibold text-stone-800">
          Additional information <span className="font-normal text-stone-500">(optional)</span>
        </label>
        <textarea
          id="deletion-message"
          name="message"
          value={values.message}
          onChange={updateField}
          className={`${inputClassName} min-h-32 resize-y`}
          maxLength={5000}
          placeholder="Add context that will help us review your request. Please don’t include passwords or payment details."
        />
      </div>

      <div className="mt-6 rounded-2xl bg-orange-50 p-4">
        <label htmlFor="deletion-confirmation" className="flex items-start gap-3 text-sm leading-6 text-stone-700">
          <input
            id="deletion-confirmation"
            name="confirmedDeletion"
            type="checkbox"
            checked={values.confirmedDeletion}
            onChange={updateField}
            className="mt-1 h-4 w-4 shrink-0 rounded border-stone-300 text-orange-600 focus:ring-orange-500"
            required
          />
          <span>
            I confirm that I am requesting the deletion of the account identified above and understand
            Tap2Go may contact me to verify my identity.
          </span>
        </label>
      </div>

      <div className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="deletion-website">Leave this field empty</label>
        <input
          id="deletion-website"
          name="website"
          value={values.website}
          onChange={updateField}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      {status && (
        <p
          className={`mt-5 rounded-xl px-4 py-3 text-sm ${
            status.type === "success" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
          role={status.type === "success" ? "status" : "alert"}
        >
          {status.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="btn-primary mt-6 w-full justify-center py-4 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Submitting request..." : "Submit deletion request"}
        <i
          aria-hidden="true"
          className={`fas ${isSubmitting ? "fa-spinner fa-spin" : "fa-paper-plane"} ml-2 text-sm`}
        />
      </button>
      <p className="mt-4 text-xs leading-5 text-stone-500">
        Submitting this form starts a review; it does not immediately delete your account. Some order,
        business, or legal records may need to be retained. Do not send passwords, ID documents, or
        payment details through this form.
      </p>
    </form>
  );
}
