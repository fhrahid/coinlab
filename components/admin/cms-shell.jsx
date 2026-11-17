"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import AppSidebar from "@/components/admin/app-sidebar";
import ApplicationsView from "@/components/admin/applications-view";
import MessagesView from "@/components/admin/messages-view";
import RecordForm from "@/components/admin/record-form";
import RecordList from "@/components/admin/record-list";
import SettingsDialog from "@/components/admin/settings-dialog";
import ThemeToggle from "@/components/site/theme-toggle";
import { Chip } from "@/components/site/typography";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { collections } from "@/lib/collections";

// The signed-in CMS: owns which collection is open, its records and the inbox.
export default function CmsShell({ onSignedOut }) {
  const [view, setView] = useState("wings"); // a collection key or 'messages'
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [wingOptions, setWingOptions] = useState([]);
  const [roleOptions, setRoleOptions] = useState([]);
  const [messages, setMessages] = useState([]);
  const [applications, setApplications] = useState([]);
  const [editing, setEditing] = useState(null);
  const [formKey, setFormKey] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const loadSeq = useRef(0);
  const formRef = useRef(null);

  const loadMessages = useCallback(async () => {
    const { ok, data } = await api("/api/messages");
    if (ok && Array.isArray(data)) setMessages(data);
  }, []);

  const loadApplications = useCallback(async () => {
    const { ok, data } = await api("/api/applications");
    if (ok && Array.isArray(data)) setApplications(data);
  }, []);

  const loadRoleOptions = useCallback(async () => {
    const { ok, data } = await api("/api/content?collection=roles");
    if (ok && Array.isArray(data)) setRoleOptions(data);
  }, []);

  const loadWingOptions = useCallback(async () => {
    const { ok, data } = await api("/api/content?collection=wings");
    if (ok && Array.isArray(data)) setWingOptions(data);
  }, []);

  // Each load takes a sequence number so a slow response for a previously
  // selected collection can never overwrite the list of the current one.
  const loadItems = useCallback(async (collection) => {
    const seq = ++loadSeq.current;
    setLoading(true);
    setItems([]);
    const { ok, status, data } = await api(
      `/api/content?collection=${collection}`,
    );
    if (seq !== loadSeq.current) return;
    setLoading(false);
    if (ok && Array.isArray(data)) setItems(data);
    else
      toast.error(
        status === 0
          ? "Network error while loading records."
          : data?.error || "Could not load records.",
      );
  }, []);

  useEffect(() => {
    loadItems("wings");
    loadWingOptions();
    loadRoleOptions();
    loadMessages();
    loadApplications();
  }, [
    loadItems,
    loadWingOptions,
    loadRoleOptions,
    loadMessages,
    loadApplications,
  ]);

  const startNew = () => {
    setEditing(null);
    setFormKey((key) => key + 1);
  };

  const switchView = (next) => {
    setView(next);
    startNew();
    if (next === "messages") {
      loadSeq.current += 1;
      setItems([]);
      loadMessages();
    } else if (next === "applications") {
      loadSeq.current += 1;
      setItems([]);
      loadApplications();
    } else loadItems(next);
  };

  const selectRecord = (item) => {
    setEditing(item);
    setFormKey((key) => key + 1);
    // On small screens the form sits above the list; bring it into view.
    if (window.matchMedia("(max-width: 1023px)").matches)
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const refresh = async () => {
    startNew();
    await loadItems(view);
    if (view === "wings") loadWingOptions();
    // People pick their role from this list, so keep it current.
    if (view === "roles") loadRoleOptions();
  };

  const signOut = async (message) => {
    await api("/api/auth/logout", { method: "POST" });
    setSettingsOpen(false);
    onSignedOut(message);
  };

  const isMessages = view === "messages";
  const isApplications = view === "applications";
  const isInbox = isMessages || isApplications;
  const title = isMessages
    ? "Messages"
    : isApplications
      ? "Applications"
      : collections[view].label;

  return (
    <SidebarProvider>
      <AppSidebar
        counts={items.length}
        onOpenSettings={() => setSettingsOpen(true)}
        onSelect={switchView}
        onSignOut={() => signOut()}
        unread={messages.filter((message) => !message.read).length}
        unreadApplications={applications.filter((a) => !a.read).length}
        view={view}
      />
      <SidebarInset className="min-w-0 bg-muted/40">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/95 px-3 backdrop-blur-sm sm:px-5">
          <SidebarTrigger className="size-10" />
          <Separator className="mr-1 h-5!" orientation="vertical" />
          <span className="mr-auto truncate text-sm font-bold">{title}</span>
          <ThemeToggle />
          {!isInbox && (
            <Button
              onClick={startNew}
              size="lg"
              variant="secondary"
            >
              <Plus data-icon="inline-start" /> New {collections[view].singular}
            </Button>
          )}
        </header>
        <div className="flex-1 px-3 py-5 sm:px-5 md:py-8 lg:px-10">
          <div className="mb-5 md:mb-6">
            <Chip dot>Content studio</Chip>
            <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.06em] md:text-4xl">
              {title}
            </h1>
          </div>
          {isMessages ? (
            <MessagesView messages={messages} setMessages={setMessages} />
          ) : isApplications ? (
            <ApplicationsView
              applications={applications}
              setApplications={setApplications}
            />
          ) : (
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(220px,300px)_minmax(0,1fr)]">
              <RecordList
                className="order-2 lg:order-1"
                collection={view}
                items={items}
                loading={loading}
                onSelect={selectRecord}
                selectedSlug={editing?.slug}
              />
              <div
                className="order-1 min-w-0 scroll-mt-16 lg:order-2"
                ref={formRef}
              >
                <RecordForm
                  collection={view}
                  key={`${view}-${formKey}`}
                  onChanged={refresh}
                  record={editing}
                  roleOptions={roleOptions}
                  wingOptions={wingOptions}
                />
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
      <SettingsDialog
        onOpenChange={setSettingsOpen}
        onPasswordChanged={() =>
          signOut("Password updated. Sign in with your new password.")
        }
        open={settingsOpen}
      />
    </SidebarProvider>
  );
}
