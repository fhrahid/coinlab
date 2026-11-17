"use client";
import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Handshake,
  Images,
  LogOut,
  Mail,
  Settings2,
  Users,
  Wand2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { collectionKeys, collections } from "@/lib/collections";

const icons = {
  wings: Wand2,
  people: Users,
  papers: FileText,
  partners: Handshake,
  slides: Images,
};
const badgeClass =
  "font-mono text-[0.625rem] peer-data-active/menu-button:text-sidebar-accent-foreground";

export default function AppSidebar({
  view,
  counts,
  unread,
  onSelect,
  onOpenSettings,
  onSignOut,
}) {
  const { setOpenMobile } = useSidebar();
  // On phones the sidebar is a drawer: close it after every choice.
  const run = (action) => () => {
    setOpenMobile(false);
    action();
  };

  return (
    <Sidebar>
      <SidebarHeader className="px-4 pt-5 pb-3">
        <div className="flex items-center gap-2.5 text-white">
          <img
            alt="COiN Lab"
            className="h-9 w-32 shrink-0 rounded bg-white p-1 object-contain object-left"
            height={36}
            src="/logo.svg"
            width={128}
          />
          <strong className="text-sm tracking-[0.04em]">COiN CMS</strong>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="label-caps text-[0.5625rem]">
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {collectionKeys.map((key) => {
                const Icon = icons[key];
                return (
                  <SidebarMenuItem key={key}>
                    <SidebarMenuButton
                      className="h-10"
                      isActive={view === key}
                      onClick={run(() => onSelect(key))}
                    >
                      <Icon />
                      <span>{collections[key].label}</span>
                    </SidebarMenuButton>
                    {view === key && counts > 0 && (
                      <SidebarMenuBadge className={`top-2.5! ${badgeClass}`}>
                        {counts}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-10"
                  isActive={view === "messages"}
                  onClick={run(() => onSelect("messages"))}
                >
                  <Mail />
                  <span>Messages</span>
                </SidebarMenuButton>
                {unread > 0 && (
                  <SidebarMenuBadge className={`top-2.5! ${badgeClass}`}>
                    {unread}
                    <span className="sr-only"> unread</span>
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="label-caps text-[0.5625rem]">
            Workspace
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className="h-10"
                  onClick={run(onOpenSettings)}
                >
                  <Settings2 />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild className="h-10">
                  <Link href="/" target="_blank">
                    <ExternalLink />
                    <span>View website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="h-10" onClick={run(onSignOut)}>
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
