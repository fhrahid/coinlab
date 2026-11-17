"use client";
import { useEffect, useState } from "react";
import CmsShell from "@/components/admin/cms-shell";
import LoginForm from "@/components/admin/login-form";
import { Spinner } from "@/components/ui/spinner";
import { api } from "@/lib/api";

// Session gate for the CMS: restores a still-valid session after a reload,
// otherwise shows the sign-in form.
export default function AdminPage() {
  const [session, setSession] = useState("checking"); // checking | signed-out | signed-in
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    api("/api/auth/session").then(({ data }) => {
      if (active) setSession(data?.loggedIn ? "signed-in" : "signed-out");
    });
    return () => {
      active = false;
    };
  }, []);

  if (session === "checking") {
    return (
      <main className="flex min-h-svh items-center justify-center bg-navy text-sky">
        <Spinner className="size-6" />
        <span className="sr-only">Loading the CMS…</span>
      </main>
    );
  }
  if (session === "signed-out") {
    return (
      <LoginForm
        notice={notice}
        onSignedIn={() => {
          setNotice("");
          setSession("signed-in");
        }}
      />
    );
  }
  return (
    <CmsShell
      onSignedOut={(message = "") => {
        setNotice(message);
        setSession("signed-out");
      }}
    />
  );
}
