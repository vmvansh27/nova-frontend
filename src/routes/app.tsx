import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useApp } from "@/lib/store";
import { Bell, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useApp();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/login" });
    if (!loading && user?.isAdmin) nav({ to: "/admin" });
  }, [loading, user, nav]);

  if (loading || !user) return null;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 border-b border-border glass flex items-center px-4 gap-3 sticky top-0 z-40">
            <SidebarTrigger />
            <div className="relative max-w-md flex-1 hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search markets, NFTs, transactions…"
                className="pl-9 bg-card/50"
              />
            </div>
            <div className="flex-1 md:hidden" />
            <button className="h-9 w-9 grid place-items-center rounded-lg border border-border hover:bg-accent">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs text-muted-foreground">{user.email}</div>
                <div className="text-xs text-muted-foreground font-mono">{user.walletAddress}</div>
              </div>
              <div className="h-9 w-9 rounded-full gradient-primary shadow-glow grid place-items-center text-sm font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
