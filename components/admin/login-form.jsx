"use client";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Chip, Highlight } from "@/components/site/typography";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";

export default function LoginForm({ notice = "", onSignedIn }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const login = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { ok, status } = await api("/api/auth/login", {
      method: "POST",
      body: { password },
    });
    setBusy(false);
    if (ok) onSignedIn();
    else
      setError(
        status === 0
          ? "Network error — please try again."
          : "That password did not work.",
      );
  };

  return (
    <main className="flex min-h-svh items-center justify-center bg-navy p-4 sm:p-6">
      <Card className="w-full max-w-[450px] bg-background py-7 [--card-spacing:--spacing(6)] sm:py-9 sm:[--card-spacing:--spacing(9)]">
        <CardContent className="flex flex-col">
          <img
            alt="COiN Lab"
            className="mb-7 h-12 w-44 object-contain object-left"
            height={48}
            src="/logo.svg"
            width={176}
          />
          <Chip dot>Content studio</Chip>
          <h1 className="my-3 text-[42px] leading-[0.95] font-extrabold tracking-[-0.07em] sm:text-5xl">
            Make the work
            <br />
            <Highlight>visible.</Highlight>
          </h1>
          <p className="mb-6 text-[13px] text-muted-foreground">
            Sign in to manage the COiN Lab website.
          </p>
          <form onSubmit={login}>
            <FieldGroup className="gap-4">
              {notice && (
                <Alert>
                  <AlertDescription>{notice}</AlertDescription>
                </Alert>
              )}
              <Field data-invalid={error ? true : undefined}>
                <FieldLabel htmlFor="admin-password">Admin password</FieldLabel>
                <Input
                  aria-describedby={error ? "admin-password-error" : undefined}
                  aria-invalid={error ? true : undefined}
                  autoComplete="current-password"
                  autoFocus
                  id="admin-password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  type="password"
                  value={password}
                />
                {error && (
                  <p
                    className="text-xs text-destructive"
                    id="admin-password-error"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </Field>
              <Button
                disabled={busy}
                size="xl"
                type="submit"
                variant="secondary"
              >
                {busy ? (
                  <>
                    <Spinner data-icon="inline-start" /> Signing in…
                  </>
                ) : (
                  <>
                    Open CMS <ChevronRight data-icon="inline-end" />
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
