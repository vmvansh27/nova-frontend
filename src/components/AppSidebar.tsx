import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wallet,
  ArrowDownToLine,
  ArrowUpFromLine,
  TrendingUp,
  LineChart,
  Image as ImageIcon,
  Users,
  Receipt,
  LogOut,
  Sparkles,
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
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useApp } from "@/lib/store";
import { useNavigate } from "@tanstack/react-router";

const items = [
  { title: "Home", url: "/app/home", icon: LayoutDashboard },
  { title: "Market", url: "/app/market", icon: LineChart },
  { title: "Invest", url: "/app/invest", icon: TrendingUp },
  { title: "Wallet", url: "/app/wallet", icon: Wallet },
  { title: "Deposit", url: "/app/deposit", icon: ArrowDownToLine },
  { title: "Withdraw", url: "/app/withdraw", icon: ArrowUpFromLine },
  { title: "NFTs", url: "/app/nft", icon: ImageIcon },
  { title: "Referral", url: "/app/referral", icon: Users },
  { title: "Transactions", url: "/app/transactions", icon: Receipt },
];

export function AppSidebar() {
  const path = useRouterState({ select: (r) => r.location.pathname });
  const { logout } = useApp();
  const navigate = useNavigate();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/app/home" className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <div className="text-sm font-bold text-gradient">NOVA</div>
            <div className="text-[10px] text-muted-foreground">Crypto Invest</div>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={path === it.url}>
                    <Link to={it.url}>
                      <it.icon className="h-4 w-4" />
                      <span>{it.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
