import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Check,
  DollarSign,
  LogOut,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, useApp } from "@/lib/store";

export const Route = createFileRoute("/admin")({ component: Admin });

interface Analytics {
  users: number;
  totalAccountsBalance: number;
  totalInvested: number;
  transactions: number;
  dailyDeposits: number;
  dailyWithdrawals: number;
  sevenDayDeposits: number;
  sevenDayWithdrawals: number;
  dailyFlow: Array<{ date: string; deposits: number; withdrawals: number }>;
}

interface AdminUser {
  _id: string;
  email: string;
  balance: number;
  invested: number;
  createdAt: string;
}

interface Settings {
  defaultRoi: number;
  referralBonusPercent: number;
  signupBonus: number;
}

interface Withdrawal {
  _id: string;
  amount: number;
  address: string;
  status: string;
  txHash?: string;
  user?: { email: string };
}

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
const compactCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
const flowChartConfig = {
  deposits: { label: "Deposits", color: "hsl(var(--success))" },
  withdrawals: { label: "Withdrawals", color: "hsl(var(--warning))" },
} satisfies ChartConfig;

function Admin() {
  const { user, loading, logout } = useApp();
  const nav = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [settings, setSettings] = useState<Settings>({
    defaultRoi: 1.5,
    referralBonusPercent: 5,
    signupBonus: 5,
  });

  const loadAdmin = useCallback(async () => {
    const [analyticsData, usersData, withdrawalsData, settingsData] = await Promise.all([
      apiFetch<Analytics>("/admin/analytics"),
      apiFetch<AdminUser[]>("/admin/users"),
      apiFetch<Withdrawal[]>("/admin/withdrawals"),
      apiFetch<Settings>("/admin/settings"),
    ]);
    setAnalytics(analyticsData);
    setUsers(usersData);
    setWithdrawals(withdrawalsData);
    setSettings(settingsData);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      nav({ to: "/login" });
      return;
    }
    if (!user.isAdmin) {
      nav({ to: "/app/home" });
      return;
    }
    loadAdmin().catch((error) => toast.error(error.message));
  }, [loadAdmin, loading, nav, user]);

  const saveSettings = async () => {
    try {
      const next = await apiFetch<Settings>("/admin/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(next);
      toast.success("Settings saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save settings");
    }
  };

  const reviewWithdrawal = async (id: string, action: "approve" | "reject") => {
    try {
      await apiFetch(`/admin/withdrawals/${id}/${action}`, { method: "POST" });
      await loadAdmin();
      toast.success(
        action === "approve" ? "Withdrawal approved" : "Withdrawal rejected and refunded",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review withdrawal");
    }
  };

  if (loading || !user?.isAdmin || !analytics) return null;
  const pending = withdrawals.filter((withdrawal) => withdrawal.status === "pending");
  const netFlow = analytics.sevenDayDeposits - analytics.sevenDayWithdrawals;
  const chartData = analytics.dailyFlow.map((day) => ({
    ...day,
    label: new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "short",
    }),
  }));

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin panel</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform activity and account controls
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              logout();
              nav({ to: "/login" });
            }}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total users" value={analytics.users.toLocaleString()} icon={Users} />
          <StatCard
            label="All accounts balance"
            value={formatCurrency(analytics.totalAccountsBalance)}
            icon={Wallet}
          />
          <StatCard
            label="Total invested"
            value={formatCurrency(analytics.totalInvested)}
            icon={TrendingUp}
          />
          <StatCard
            label="Transactions"
            value={analytics.transactions.toLocaleString()}
            icon={DollarSign}
          />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Deposits today"
            value={formatCurrency(analytics.dailyDeposits)}
            icon={ArrowDownToLine}
          />
          <StatCard
            label="Withdrawals today"
            value={formatCurrency(analytics.dailyWithdrawals)}
            icon={ArrowUpFromLine}
          />
          <StatCard
            label="Deposits (7 days)"
            value={formatCurrency(analytics.sevenDayDeposits)}
            icon={ArrowDownToLine}
          />
          <StatCard
            label="Withdrawals (7 days)"
            value={formatCurrency(analytics.sevenDayWithdrawals)}
            icon={ArrowUpFromLine}
          />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6">
          <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-primary" /> Cash flow
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Deposits and withdrawals over the last 7 days
                </p>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase text-muted-foreground">Net flow</div>
                <div
                  className={`text-xl font-bold ${netFlow >= 0 ? "text-success" : "text-warning"}`}
                >
                  {netFlow >= 0 ? "+" : ""}
                  {formatCurrency(netFlow)}
                </div>
              </div>
            </div>
            <ChartContainer config={flowChartConfig} className="mt-5 h-[280px] w-full aspect-auto">
              <BarChart data={chartData} margin={{ left: 0, right: 4, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={52}
                  tickFormatter={(value) => compactCurrency(Number(value))}
                />
                <ChartTooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => (
                        <div className="flex min-w-[150px] items-center justify-between gap-3">
                          <span className="text-muted-foreground">
                            {flowChartConfig[name as keyof typeof flowChartConfig]?.label}
                          </span>
                          <span className="font-mono font-medium">
                            {formatCurrency(Number(value))}
                          </span>
                        </div>
                      )}
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="deposits" fill="var(--color-deposits)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="withdrawals" fill="var(--color-withdrawals)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
              <div className="text-xs uppercase text-muted-foreground">7-day deposits</div>
              <div className="mt-2 text-2xl font-bold text-success">
                {formatCurrency(analytics.sevenDayDeposits)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Money added by users</div>
            </div>
            <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
              <div className="text-xs uppercase text-muted-foreground">7-day withdrawals</div>
              <div className="mt-2 text-2xl font-bold text-warning">
                {formatCurrency(analytics.sevenDayWithdrawals)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Requested outgoing funds</div>
            </div>
            <div className="gradient-card rounded-2xl border border-border p-5 shadow-card col-span-2 lg:col-span-1">
              <div className="text-xs uppercase text-muted-foreground">Pending approvals</div>
              <div className="mt-2 text-2xl font-bold">{pending.length.toLocaleString()}</div>
              <div className="mt-1 text-xs text-muted-foreground">Withdrawals awaiting review</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
            <h3 className="font-semibold">Platform settings</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default ROI (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.defaultRoi}
                  onChange={(event) =>
                    setSettings({ ...settings, defaultRoi: +event.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Referral bonus (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={settings.referralBonusPercent}
                  onChange={(event) =>
                    setSettings({ ...settings, referralBonusPercent: +event.target.value })
                  }
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Signup bonus ($)</Label>
                <Input
                  type="number"
                  value={settings.signupBonus}
                  onChange={(event) =>
                    setSettings({ ...settings, signupBonus: +event.target.value })
                  }
                />
              </div>
            </div>
            <Button onClick={saveSettings} className="gradient-primary shadow-glow">
              Save changes
            </Button>
          </div>

          <div className="gradient-card rounded-2xl border border-border p-6 shadow-card">
            <h3 className="font-semibold mb-4">Pending withdrawals ({pending.length})</h3>
            <div className="space-y-3">
              {pending.length === 0 && (
                <p className="text-sm text-muted-foreground">No pending withdrawals.</p>
              )}
              {pending.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="rounded-lg border border-border bg-background/40 p-3 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold">{formatCurrency(withdrawal.amount)}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {withdrawal.user?.email}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {withdrawal.address}
                    </div>
                    {withdrawal.txHash && (
                      <div className="text-xs text-success font-mono truncate">
                        {withdrawal.txHash}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reviewWithdrawal(withdrawal._id, "reject")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-primary"
                      onClick={() => reviewWithdrawal(withdrawal._id, "approve")}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border font-semibold">Users</div>
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Joined</th>
                <th className="text-right p-3">Balance</th>
                <th className="text-right p-3">Invested</th>
              </tr>
            </thead>
            <tbody>
              {users.map((account) => (
                <tr key={account._id} className="border-t border-border">
                  <td className="p-3">{account.email}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(account.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">{formatCurrency(account.balance)}</td>
                  <td className="p-3 text-right">{formatCurrency(account.invested)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
