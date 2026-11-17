"use client";
import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/lib/api";

const blank = { name: "", email: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(blank);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const set = (key) => (e) =>
    setForm((current) => ({ ...current, [key]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const {
      ok,
      status: code,
      data,
    } = await api("/api/contact", { method: "POST", body: form });
    if (ok) {
      setStatus("sent");
      return;
    }
    setStatus("idle");
    setError(
      code === 0
        ? "Network error — please check your connection and try again."
        : data?.error || "Could not send your message.",
    );
  };

  if (status === "sent") {
    return (
      <Card className="w-full" role="status">
        <CardContent className="flex flex-col items-start gap-3 py-4">
          <span className="flex size-11 items-center justify-center rounded-full bg-success/12 text-success">
            <Check aria-hidden="true" className="size-5" />
          </span>
          <strong className="text-base font-bold">Message received.</strong>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Thank you, {form.name.split(" ")[0]}. The COiN Lab team will reply
            to <b className="text-foreground">{form.email}</b> soon.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent>
        <form onSubmit={submit}>
          <FieldGroup className="gap-4">
            <Field>
              <FieldLabel htmlFor="contact-name">Name</FieldLabel>
              <Input
                autoComplete="name"
                id="contact-name"
                onChange={set("name")}
                placeholder="Your full name"
                required
                type="text"
                value={form.name}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-email">Email</FieldLabel>
              <Input
                autoComplete="email"
                id="contact-email"
                onChange={set("email")}
                placeholder="you@university.edu"
                required
                type="email"
                value={form.email}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-subject">Subject</FieldLabel>
              <Input
                id="contact-subject"
                onChange={set("subject")}
                placeholder="Collaboration, research, visit…"
                type="text"
                value={form.subject}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="contact-message">Message</FieldLabel>
              <Textarea
                className="min-h-28"
                id="contact-message"
                onChange={set("message")}
                placeholder="Tell us what you are thinking about."
                required
                rows={5}
                value={form.message}
              />
            </Field>
            {/* Honeypot: hidden from people, filled in by bots. */}
            <input
              aria-hidden="true"
              autoComplete="off"
              className="absolute -left-[5000px]"
              name="website"
              onChange={set("website")}
              tabIndex={-1}
              type="text"
              value={form.website}
            />
            {error && <FieldError>{error}</FieldError>}
            <Button
              className="w-full"
              disabled={status === "sending"}
              size="xl"
              type="submit"
              variant="glow"
            >
              {status === "sending" ? (
                <>
                  <Spinner data-icon="inline-start" /> Sending…
                </>
              ) : (
                <>
                  Send message <ArrowUpRight data-icon="inline-end" />
                </>
              )}
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
