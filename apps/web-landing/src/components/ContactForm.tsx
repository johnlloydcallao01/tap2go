"use client";

import { useState } from "react";

type FormValues = {
  name: string;
  email: string;
  topic: string;
  message: string;
  website: string;
};

const initialValues: FormValues = {
  name: "",
  email: "",
  topic: "general",
  message: "",
  website: "",
};

export function ContactForm(): React.JSX.Element {
  const [values, setValues] = useState(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  function updateField(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submitForm(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result: { message?: string; error?: string } = await response.json();

      if (!response.ok) {
        setStatus({
          type: "error",
          message: result.error || "We could not send your message. Please try again.",
        });
        return;
      }

      setValues(initialValues);
      setStatus({
        type: "success",
        message: result.message || "Your message has been sent.",
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
    <form onSubmit={submitForm} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-orange-700">Send a message</p>
        <h2 className="heading-secondary mt-2 text-2xl text-stone-950">How can we help?</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Share a few details and our team will get back to you.
        </p>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-semibold text-stone-800">
            Your name
          </label>
          <input
            id="contact-name"
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
          <label htmlFor="contact-email" className="text-sm font-semibold text-stone-800">
            Email address
          </label>
          <input
            id="contact-email"
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
        <label htmlFor="contact-topic" className="text-sm font-semibold text-stone-800">
          What is this about?
        </label>
        <select
          id="contact-topic"
          name="topic"
          value={values.topic}
          onChange={updateField}
          className={inputClassName}
          required
        >
          <option value="general">General question</option>
          <option value="order">Order support</option>
          <option value="restaurant">Restaurant partnership</option>
          <option value="partnership">Business partnership</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="text-sm font-semibold text-stone-800">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={values.message}
          onChange={updateField}
          className={`${inputClassName} min-h-36 resize-y`}
          minLength={10}
          maxLength={5000}
          required
        />
        <p className="mt-2 text-right text-xs text-stone-500">{values.message.length}/5000</p>
      </div>

      <div
        className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"
        aria-hidden="true"
      >
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
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
            status.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
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
        {isSubmitting ? "Sending message..." : "Send message"}
        <i
          aria-hidden="true"
          className={`fas ${isSubmitting ? "fa-spinner fa-spin" : "fa-paper-plane"} ml-2 text-sm`}
        />
      </button>
      <p className="mt-4 text-xs leading-5 text-stone-500">
        Please don&apos;t include passwords or payment details in your message.
      </p>
    </form>
  );
}
