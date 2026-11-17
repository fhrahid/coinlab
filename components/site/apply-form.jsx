"use client";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// Application form on a job posting. Submissions land in the CMS
// "Applications" inbox. The hidden "website" field is a honeypot for bots.
export default function ApplyForm({ jobSlug }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    link: "",
    message: "",
    website: "",
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const set = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const response = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jobSlug }),
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) setStatus("sent");
    else {
      setStatus("idle");
      setError(data?.error || "Could not send your application.");
    }
  };

  if (status === "sent")
    return (
      <div className="flex items-start gap-3 rounded-2xl border bg-accent p-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-brand">
          <Check size={20} />
        </span>
        <div>
          <p className="font-bold">Application received.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Thank you, {form.name.split(" ")[0]}. The COiN Lab team will review
            your application and reply to <b>{form.email}</b>.
          </p>
        </div>
      </div>
    );

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={submit}
    >
      <div className="grid gap-3.5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-name">Full name *</Label>
          <Input
            id="apply-name"
            onChange={set("name")}
            placeholder="Your full name"
            required
            value={form.name}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-email">Email *</Label>
          <Input
            id="apply-email"
            onChange={set("email")}
            placeholder="you@university.edu"
            required
            type="email"
            value={form.email}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-phone">Phone (optional)</Label>
          <Input
            id="apply-phone"
            onChange={set("phone")}
            placeholder="+880 …"
            value={form.phone}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="apply-link">CV / portfolio link (optional)</Label>
          <Input
            id="apply-link"
            onChange={set("link")}
            placeholder="https://drive.google.com/…"
            type="url"
            value={form.link}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="apply-message">Why you? *</Label>
        <Textarea
          id="apply-message"
          onChange={set("message")}
          placeholder="A short note about your background and why this role fits."
          required
          rows={4}
          value={form.message}
        />
      </div>
      <input
        aria-hidden="true"
        autoComplete="off"
        name="website"
        onChange={set("website")}
        style={{ position: "absolute", left: "-5000px" }}
        tabIndex={-1}
        type="text"
        value={form.website}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button disabled={status === "sending"} size="xl" type="submit" variant="glow">
        {status === "sending" ? (
          "Sending…"
        ) : (
          <>
            Submit application <ArrowUpRight data-icon="inline-end" />
          </>
        )}
      </Button>
      <p className="text-[0.6875rem] text-muted-foreground">
        Your application goes straight to the COiN Lab hiring inbox.
      </p>
    </form>
  );
}
