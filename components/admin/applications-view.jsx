"use client";
import { useState } from "react";
import { ArrowLeft, ExternalLink, FileUser, Reply, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

// Job-application inbox: list on the left, the open application on the right.
export default function ApplicationsView({ applications, setApplications }) {
  const [openId, setOpenId] = useState(null);
  const open = applications.find((item) => item._id === openId) || null;

  const openApplication = (application) => {
    setOpenId(application._id);
    if (application.read) return;
    setApplications((current) =>
      current.map((item) =>
        item._id === application._id ? { ...item, read: true } : item,
      ),
    );
    api("/api/applications", {
      method: "PUT",
      body: { id: application._id, read: true },
    });
  };

  const remove = async (id) => {
    const { ok, data } = await api("/api/applications", {
      method: "DELETE",
      body: { id },
    });
    if (!ok) {
      toast.error(data?.error || "Could not delete the application.");
      return;
    }
    setApplications((current) => current.filter((item) => item._id !== id));
    setOpenId(null);
    toast.success("Application deleted.");
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
      <Card className={cn("gap-0 py-0", open && "max-lg:hidden")}>
        <CardHeader className="label-caps flex items-center justify-between border-b py-3.5 text-[0.5625rem] text-muted-foreground">
          <span>
            {applications.length}{" "}
            {applications.length === 1 ? "application" : "applications"}
          </span>
          <span>Select to read</span>
        </CardHeader>
        <CardContent className="max-h-[calc(100svh-15rem)] overflow-y-auto px-0">
          {applications.length ? (
            <ul>
              {applications.map((application) => (
                <li className="border-b last:border-b-0" key={application._id}>
                  <Item
                    asChild
                    className={cn(
                      "cursor-pointer border-0 px-3.5 py-3 text-left hover:bg-muted focus-visible:bg-muted focus-visible:ring-0",
                      openId === application._id && "bg-accent",
                    )}
                  >
                    <button
                      aria-current={openId === application._id || undefined}
                      onClick={() => openApplication(application)}
                      type="button"
                    >
                      <ItemMedia>
                        <span
                          aria-hidden="true"
                          className="flex size-9 items-center justify-center rounded-full bg-accent text-brand"
                        >
                          <FileUser className="size-3.5" />
                        </span>
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0.5">
                        <ItemTitle
                          className={cn(
                            "block w-full truncate",
                            application.read ? "font-medium" : "font-extrabold",
                          )}
                        >
                          {application.name}
                        </ItemTitle>
                        <ItemDescription
                          className={cn(
                            "line-clamp-1",
                            !application.read && "text-foreground",
                          )}
                        >
                          {application.jobTitle}
                        </ItemDescription>
                        <time className="font-mono text-[0.5625rem] text-muted-foreground">
                          {formatDate(application.createdAt)}
                        </time>
                      </ItemContent>
                      {!application.read && (
                        <ItemActions>
                          <span className="size-2 rounded-full bg-destructive">
                            <span className="sr-only">Unread</span>
                          </span>
                        </ItemActions>
                      )}
                    </button>
                  </Item>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileUser />
                </EmptyMedia>
                <EmptyTitle>No applications yet</EmptyTitle>
                <EmptyDescription>
                  Applications submitted from the job postings land here.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </CardContent>
      </Card>

      {open ? (
        <Card className="[--card-spacing:--spacing(4)] sm:[--card-spacing:--spacing(5)]">
          <CardHeader className="border-b">
            <CardDescription className="label-caps truncate text-[0.5625rem]">
              Applied for {open.jobTitle}
            </CardDescription>
            <CardTitle className="text-xl font-bold tracking-[-0.03em]">
              {open.name}
            </CardTitle>
            <CardAction className="flex gap-2 max-sm:col-start-1 max-sm:row-start-3 max-sm:mt-2 max-sm:justify-self-start">
              <Button
                className="lg:hidden"
                onClick={() => setOpenId(null)}
                size="lg"
                type="button"
                variant="outline"
              >
                <ArrowLeft data-icon="inline-start" /> Inbox
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={`/jobs/${open.jobSlug}`} target="_blank">
                  <ExternalLink data-icon="inline-start" /> Posting
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a
                  href={`mailto:${open.email}?subject=${encodeURIComponent(
                    `Your application: ${open.jobTitle} — COiN Lab`,
                  )}`}
                >
                  <Reply data-icon="inline-start" /> Reply
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="lg" type="button" variant="destructive">
                    <Trash2 data-icon="inline-start" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete this application permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      The application from {open.name} for {open.jobTitle} will
                      be removed from the inbox. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => remove(open._id)}
                      variant="destructive"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 border-b pb-3 text-[11px] text-muted-foreground">
              <span className="min-w-0 break-all">
                <b className="text-foreground">{open.name}</b> · {open.email}
                {open.phone && <> · {open.phone}</>}
              </span>
              <time className="ml-auto">{formatDate(open.createdAt)}</time>
            </div>
            {open.link && (
              <p className="text-xs">
                <span className="text-muted-foreground">CV / portfolio:</span>{" "}
                <a
                  className="break-all font-semibold text-brand hover:underline"
                  href={open.link}
                  rel="noreferrer nofollow"
                  target="_blank"
                >
                  {open.link}
                </a>
              </p>
            )}
            <p className="text-sm leading-[1.9] break-words whitespace-pre-wrap">
              {open.message}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="max-lg:hidden">
          <CardContent>
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileUser />
                </EmptyMedia>
                <EmptyTitle>Select an application to read it</EmptyTitle>
                <EmptyDescription>
                  Opening an application marks it as read; the sidebar shows how
                  many are unread.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
