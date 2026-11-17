"use client";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";

function Row({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-dashed py-2 text-xs last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right font-semibold break-words">
        {children}
      </dd>
    </div>
  );
}

const Status = ({ ok, children }) => (
  <Badge
    className={ok ? "bg-success/12 text-success" : undefined}
    variant={ok ? "secondary" : "outline"}
  >
    {children}
  </Badge>
);

function Connections({ settings }) {
  if (settings === undefined)
    return (
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
        <Skeleton className="h-5" />
      </div>
    );
  if (settings === null)
    return (
      <p className="text-xs text-destructive">
        Could not load the connection status.
      </p>
    );
  const counts = settings.counts || {};
  const total = Object.values(counts).reduce(
    (sum, n) => sum + (Number(n) || 0),
    0,
  );
  const usage = settings.cloudinary?.usage;
  return (
    <dl>
      <Row label="MongoDB">
        <Status ok={settings.mongo?.connected}>
          {settings.mongo?.connected
            ? `connected · ${settings.mongo.database}`
            : "not connected"}
        </Status>
      </Row>
      <Row label="Cloudinary">
        <Status ok={Boolean(settings.cloudinary?.cloudName)}>
          {settings.cloudinary?.cloudName || "not configured"}
        </Status>
      </Row>
      <Row label="CMS records">
        {total} across {Object.keys(counts).length} collections
      </Row>
      {usage && (
        <Row label="Media files">
          {usage.objects ?? 0}
          {usage.storage ? ` · ${(usage.storage / 1048576).toFixed(1)} MB` : ""}
        </Row>
      )}
    </dl>
  );
}

const passwordSources = {
  database: "set in Settings",
  environment: "from .env (ADMIN_PASSWORD)",
};

export default function SettingsDialog({
  open,
  onOpenChange,
  onPasswordChanged,
}) {
  const [settings, setSettings] = useState(undefined); // undefined = loading, null = failed
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setSettings(undefined);
    setCurrent("");
    setNext("");
    setError("");
    api("/api/settings").then(({ ok, data }) => {
      if (active) setSettings(ok ? data : null);
    });
    return () => {
      active = false;
    };
  }, [open]);

  const changePassword = async (e) => {
    e.preventDefault();
    if (!current || !next) {
      setError("Fill in both password fields.");
      return;
    }
    setBusy(true);
    setError("");
    const { ok, data } = await api("/api/settings", {
      method: "POST",
      body: { currentPassword: current, newPassword: next },
    });
    setBusy(false);
    if (ok) onPasswordChanged();
    else setError(data?.error || "Could not update the password.");
  };

  const cloudName = settings?.cloudinary?.cloudName;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto bg-background sm:max-w-3xl sm:p-6">
        <DialogHeader>
          <DialogDescription className="label-caps text-[0.5625rem]">
            Workspace
          </DialogDescription>
          <DialogTitle className="text-2xl font-extrabold tracking-[-0.04em]">
            Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3.5 md:grid-cols-2">
          <Card size="sm">
            <CardHeader>
              <CardTitle>Connections</CardTitle>
            </CardHeader>
            <CardContent>
              <Connections settings={settings} />
            </CardContent>
          </Card>
          <Card size="sm">
            <CardHeader>
              <CardTitle>Media library</CardTitle>
              <CardDescription>
                Every CMS upload lands in the <b>coinlab/</b> folder of the
                Cloudinary account. Deleting a record in the CMS removes its
                file too — the console is only needed for orphaned files.
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline">
                <a
                  href={`https://console.cloudinary.com/console/media_library${cloudName ? `?cloud_name=${cloudName}` : ""}`}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open Cloudinary Media Library{" "}
                  <ExternalLink data-icon="inline-end" />
                </a>
              </Button>
            </CardFooter>
          </Card>
          <Card className="md:col-span-2" size="sm">
            <CardHeader>
              <CardTitle>CMS password</CardTitle>
              <CardDescription>
                Active password:{" "}
                <b>
                  {settings
                    ? passwordSources[settings.passwordSource] || "not set"
                    : "…"}
                </b>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword}>
                <FieldGroup className="grid gap-4 sm:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="settings-current">
                      Current password
                    </FieldLabel>
                    <Input
                      autoComplete="current-password"
                      id="settings-current"
                      onChange={(e) => setCurrent(e.target.value)}
                      type="password"
                      value={current}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="settings-next">
                      New password
                    </FieldLabel>
                    <Input
                      autoComplete="new-password"
                      id="settings-next"
                      minLength={8}
                      onChange={(e) => setNext(e.target.value)}
                      type="password"
                      value={next}
                    />
                    <FieldDescription>Minimum 8 characters.</FieldDescription>
                  </Field>
                  {error && (
                    <FieldError className="sm:col-span-2">{error}</FieldError>
                  )}
                  <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
                    <Button disabled={busy} size="lg" type="submit">
                      {busy && <Spinner data-icon="inline-start" />}
                      {busy ? "Updating…" : "Update password"}
                    </Button>
                    <p className="text-[11px] leading-[1.6] text-muted-foreground">
                      Stored salted-hashed in MongoDB. Changing it signs out
                      every active session — including this one.
                    </p>
                  </div>
                </FieldGroup>
              </form>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
