"use client";
import { useState } from "react";
import { ArrowLeft, Mail, Reply, Trash2 } from "lucide-react";
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

// Contact-form inbox: list on the left, the open message on the right. On
// phones the two swap places like a mail app.
export default function MessagesView({ messages, setMessages }) {
  const [openId, setOpenId] = useState(null);
  const open = messages.find((message) => message._id === openId) || null;

  const openMessage = (message) => {
    setOpenId(message._id);
    if (message.read) return;
    setMessages((current) =>
      current.map((m) => (m._id === message._id ? { ...m, read: true } : m)),
    );
    api("/api/messages", {
      method: "POST",
      body: { id: message._id, read: true },
    });
  };

  const remove = async (id) => {
    const { ok, data } = await api("/api/messages", {
      method: "DELETE",
      body: { id },
    });
    if (!ok) {
      toast.error(data?.error || "Could not delete the message.");
      return;
    }
    setMessages((current) => current.filter((m) => m._id !== id));
    setOpenId(null);
    toast.success("Message deleted.");
  };

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(240px,340px)_minmax(0,1fr)]">
      <Card className={cn("gap-0 py-0", open && "max-lg:hidden")}>
        <CardHeader className="label-caps flex items-center justify-between border-b py-3.5 text-[0.5625rem] text-muted-foreground">
          <span>
            {messages.length} {messages.length === 1 ? "message" : "messages"}
          </span>
          <span>Select to read</span>
        </CardHeader>
        <CardContent className="max-h-[calc(100svh-15rem)] overflow-y-auto px-0">
          {messages.length ? (
            <ul>
              {messages.map((message) => (
                <li className="border-b last:border-b-0" key={message._id}>
                  <Item
                    asChild
                    className={cn(
                      "cursor-pointer border-0 px-3.5 py-3 text-left hover:bg-muted focus-visible:bg-muted focus-visible:ring-0",
                      openId === message._id && "bg-accent",
                    )}
                  >
                    <button
                      aria-current={openId === message._id || undefined}
                      onClick={() => openMessage(message)}
                      type="button"
                    >
                      <ItemMedia>
                        <span
                          aria-hidden="true"
                          className="flex size-9 items-center justify-center rounded-full bg-accent text-brand"
                        >
                          <Mail className="size-3.5" />
                        </span>
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-0.5">
                        <ItemTitle
                          className={cn(
                            "block w-full truncate",
                            message.read ? "font-medium" : "font-extrabold",
                          )}
                        >
                          {message.name}
                        </ItemTitle>
                        <ItemDescription
                          className={cn(
                            "line-clamp-1",
                            !message.read && "text-foreground",
                          )}
                        >
                          {message.subject || "(no subject)"}
                        </ItemDescription>
                        <time className="font-mono text-[0.5625rem] text-muted-foreground">
                          {formatDate(message.createdAt)}
                        </time>
                      </ItemContent>
                      {!message.read && (
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
                  <Mail />
                </EmptyMedia>
                <EmptyTitle>No messages yet</EmptyTitle>
                <EmptyDescription>
                  Contact-form submissions land here automatically.
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
              From {open.email}
            </CardDescription>
            <CardTitle className="text-xl font-bold tracking-[-0.03em]">
              {open.subject || "(no subject)"}
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
                <a
                  href={`mailto:${open.email}?subject=${encodeURIComponent(`Re: ${open.subject || "Your message"}`)}`}
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
                      Delete this message permanently?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      The message from {open.name} will be removed from the
                      inbox. This cannot be undone.
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
            <div className="flex flex-wrap justify-between gap-x-3 gap-y-1 border-b pb-3 text-[11px] text-muted-foreground">
              <span className="min-w-0 break-all">
                <b className="text-foreground">{open.name}</b> · {open.email}
              </span>
              <time>{formatDate(open.createdAt)}</time>
            </div>
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
                  <Mail />
                </EmptyMedia>
                <EmptyTitle>Select a message to read it</EmptyTitle>
                <EmptyDescription>
                  Opening a message marks it as read; the sidebar shows how many
                  are unread.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
