"use client";

import { FormEvent, useState } from "react";

const initialForm = { name: "", email: "", subject: "", message: "" };

export default function ContactForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [feedback, setFeedback] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message = typeof payload === "object" && payload && "message" in payload && typeof payload.message === "string"
          ? payload.message
          : "We could not send your message. Please try again.";
        throw new Error(message);
      }
      setStatus("success");
      setFeedback("Thank you. Your message has been sent to Neomeditech.");
      setForm(initialForm);
    } catch (error: unknown) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "We could not send your message. Please try again.");
    }
  }

  return (
    <form className="space-y-6" onSubmit={submit}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <label className="block text-sm font-bold text-brand-navy">Name
          <input required minLength={2} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/50" placeholder="Your name" />
        </label>
        <label className="block text-sm font-bold text-brand-navy">Email
          <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/50" placeholder="you@example.com" />
        </label>
      </div>
      <label className="block text-sm font-bold text-brand-navy">Subject
        <input required minLength={3} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/50" placeholder="How can we help?" />
      </label>
      <label className="block text-sm font-bold text-brand-navy">Message
        <textarea required minLength={10} rows={5} value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="mt-2 w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 shadow-sm transition-colors focus:border-brand-blue focus:outline-none focus:ring-2 focus:ring-brand-blue/50" placeholder="Tell us what you need." />
      </label>
      {feedback && <p className={status === "success" ? "text-sm text-green-700" : "text-sm text-red-600"} role="status">{feedback}</p>}
      <button type="submit" disabled={status === "sending"} className="w-full rounded-xl bg-gradient-to-r from-brand-blue to-brand-green px-8 py-4 font-bold text-white shadow-md transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
