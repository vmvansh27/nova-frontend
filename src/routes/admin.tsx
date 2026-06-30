import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  Bell,
  Check,
  DollarSign,
  FileCheck,
  ImagePlus,
  LayoutTemplate,
  LogOut,
  Plus,
  Search,
  ShieldCheck,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  kycStatus?: string;
}

interface Settings {
  defaultRoi: number;
  referralBonusPercent: number;
  signupBonus: number;
  investmentMinAmount?: number;
}

interface Withdrawal {
  _id: string;
  amount: number;
  address: string;
  status: string;
  txHash?: string;
  user?: { email: string };
}

interface NFTItem {
  _id?: string;
  name: string;
  artist?: string;
  description?: string;
  image?: string;
  price: number;
  currency: string;
  listed: boolean;
  tokenId?: string;
  contractAddress?: string;
}

interface PostItem {
  _id?: string;
  title: string;
  body: string;
  image?: string;
  published: boolean;
  createdAt?: string;
}

interface NotificationItem {
  _id?: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  active: boolean;
}

interface KycItem {
  _id: string;
  fullName: string;
  phone: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  updatedAt: string;
  user?: { email: string; kycStatus?: string };
}

interface InvestmentPlan {
  _id?: string;
  name: string;
  amount: number;
  roi: number;
  active: boolean;
  order?: number;
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

const emptyNft: NFTItem = {
  name: "",
  artist: "",
  description: "",
  image: "",
  price: 0,
  currency: "USDT",
  listed: true,
  tokenId: "",
  contractAddress: "",
};

const emptyPost: PostItem = { title: "", body: "", image: "", published: true };
const emptyNotification: NotificationItem = {
  title: "",
  message: "",
  type: "info",
  active: true,
};
const emptyPlan: InvestmentPlan = { name: "", amount: 0, roi: 0, active: true, order: 0 };

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
    investmentMinAmount: 10,
  });
  const [nfts, setNfts] = useState<NFTItem[]>([]);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [kycItems, setKycItems] = useState<KycItem[]>([]);
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [nftForm, setNftForm] = useState<NFTItem>(emptyNft);
  const [postForm, setPostForm] = useState<PostItem>(emptyPost);
  const [notificationForm, setNotificationForm] = useState<NotificationItem>(emptyNotification);
  const [planForm, setPlanForm] = useState<InvestmentPlan>(emptyPlan);
  const [editingNftId, setEditingNftId] = useState<string | null>(null);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editingNotificationId, setEditingNotificationId] = useState<string | null>(null);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<Record<string, string>>({});
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("Admin balance adjustment");

  const loadAdmin = useCallback(async () => {
    const [
      analyticsData,
      usersData,
      withdrawalsData,
      settingsData,
      nftData,
      postData,
      notificationData,
      kycData,
      planData,
    ] = await Promise.all([
      apiFetch<Analytics>("/admin/analytics"),
      apiFetch<AdminUser[]>("/admin/users"),
      apiFetch<Withdrawal[]>("/admin/withdrawals"),
      apiFetch<Settings>("/admin/settings"),
      apiFetch<NFTItem[]>("/admin/nfts"),
      apiFetch<PostItem[]>("/admin/posts"),
      apiFetch<NotificationItem[]>("/admin/notifications"),
      apiFetch<KycItem[]>("/admin/kyc"),
      apiFetch<InvestmentPlan[]>("/admin/investment-plans"),
    ]);
    setAnalytics(analyticsData);
    setUsers(usersData);
    setWithdrawals(withdrawalsData);
    setSettings(settingsData);
    setNfts(nftData);
    setPosts(postData);
    setNotifications(notificationData);
    setKycItems(kycData);
    setPlans(planData);
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) return void nav({ to: "/login" });
    if (!user.isAdmin) return void nav({ to: "/app/home" });
    loadAdmin().catch((error) => toast.error(error.message));
  }, [loadAdmin, loading, nav, user]);

  const filteredUsers = useMemo(() => {
    const search = userSearch.trim().toLowerCase();
    if (!search) return users;
    return users.filter((account) => account.email.toLowerCase().includes(search));
  }, [userSearch, users]);

  const selectedUser = users.find((account) => account._id === selectedUserId) || filteredUsers[0];

  useEffect(() => {
    if (!selectedUserId && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0]._id);
    }
    if (selectedUserId && !filteredUsers.some((account) => account._id === selectedUserId) && filteredUsers.length > 0) {
      setSelectedUserId(filteredUsers[0]._id);
    }
  }, [filteredUsers, selectedUserId]);

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
      toast.success(action === "approve" ? "Withdrawal approved" : "Withdrawal rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review withdrawal");
    }
  };

  const adjustBalance = async () => {
    const amount = Number(adjustAmount);
    const targetId = selectedUser?._id;
    if (!targetId) return toast.error("Select a user first");
    if (!Number.isFinite(amount) || amount === 0) return toast.error("Enter a non-zero amount");
    try {
      await apiFetch(`/admin/users/${targetId}/adjust-balance`, {
        method: "POST",
        body: JSON.stringify({ amount, reason: adjustReason }),
      });
      setAdjustAmount("");
      await loadAdmin();
      toast.success("Balance updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not adjust balance");
    }
  };

  const savePlan = async () => {
    try {
      if (editingPlanId) {
        await apiFetch(`/admin/investment-plans/${editingPlanId}`, {
          method: "PUT",
          body: JSON.stringify(planForm),
        });
      } else {
        await apiFetch("/admin/investment-plans", { method: "POST", body: JSON.stringify(planForm) });
      }
      setPlanForm(emptyPlan);
      setEditingPlanId(null);
      await loadAdmin();
      toast.success(editingPlanId ? "Plan updated" : "Plan created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save plan");
    }
  };

  const saveNft = async () => {
    try {
      if (editingNftId) {
        await apiFetch(`/admin/nfts/${editingNftId}`, { method: "PUT", body: JSON.stringify(nftForm) });
      } else {
        await apiFetch("/admin/nfts", { method: "POST", body: JSON.stringify(nftForm) });
      }
      setNftForm(emptyNft);
      setEditingNftId(null);
      await loadAdmin();
      toast.success(editingNftId ? "NFT updated" : "NFT added");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save NFT");
    }
  };

  const savePost = async () => {
    try {
      if (editingPostId) {
        await apiFetch(`/admin/posts/${editingPostId}`, { method: "PUT", body: JSON.stringify(postForm) });
      } else {
        await apiFetch("/admin/posts", { method: "POST", body: JSON.stringify(postForm) });
      }
      setPostForm(emptyPost);
      setEditingPostId(null);
      await loadAdmin();
      toast.success(editingPostId ? "Post updated" : "Post published");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save post");
    }
  };

  const saveNotification = async () => {
    try {
      if (editingNotificationId) {
        await apiFetch(`/admin/notifications/${editingNotificationId}`, {
          method: "PUT",
          body: JSON.stringify(notificationForm),
        });
      } else {
        await apiFetch("/admin/notifications", {
          method: "POST",
          body: JSON.stringify(notificationForm),
        });
      }
      setNotificationForm(emptyNotification);
      setEditingNotificationId(null);
      await loadAdmin();
      toast.success(editingNotificationId ? "Notification updated" : "Notification created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save notification");
    }
  };

  const removeResource = async (path: string, label: string) => {
    try {
      await apiFetch(path, { method: "DELETE" });
      await loadAdmin();
      toast.success(`${label} deleted`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Could not delete ${label.toLowerCase()}`);
    }
  };

  const reviewKyc = async (id: string, action: "approve" | "reject") => {
    try {
      await apiFetch(`/admin/kyc/${id}/${action}`, {
        method: "POST",
        body: JSON.stringify({ reason: rejectReason[id] }),
      });
      await loadAdmin();
      toast.success(action === "approve" ? "KYC approved" : "KYC rejected");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not review KYC");
    }
  };

  if (loading || !user?.isAdmin || !analytics) return null;

  const pendingWithdrawals = withdrawals.filter((withdrawal) => withdrawal.status === "pending");
  const pendingKyc = kycItems.filter((item) => item.status === "pending");
  const chartData = analytics.dailyFlow.map((day) => ({
    ...day,
    label: new Date(`${day.date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" }),
  }));
  const netFlow = analytics.sevenDayDeposits - analytics.sevenDayWithdrawals;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Admin panel</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Platform activity, account adjustments, editable investment plans, content, and review tools
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
          <StatCard label="All accounts balance" value={formatCurrency(analytics.totalAccountsBalance)} icon={Wallet} />
          <StatCard label="Total invested" value={formatCurrency(analytics.totalInvested)} icon={TrendingUp} />
          <StatCard label="Transactions" value={analytics.transactions.toLocaleString()} icon={DollarSign} />
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex h-auto flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="accounts">Accounts</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="nfts">NFTs</TabsTrigger>
            <TabsTrigger value="kyc">KYC</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Deposits today" value={formatCurrency(analytics.dailyDeposits)} icon={ArrowDownToLine} />
              <StatCard label="Withdrawals today" value={formatCurrency(analytics.dailyWithdrawals)} icon={ArrowUpFromLine} />
              <StatCard label="Deposits (7 days)" value={formatCurrency(analytics.sevenDayDeposits)} icon={ArrowDownToLine} />
              <StatCard label="Withdrawals (7 days)" value={formatCurrency(analytics.sevenDayWithdrawals)} icon={ArrowUpFromLine} />
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
                    <div className={`text-xl font-bold ${netFlow >= 0 ? "text-success" : "text-warning"}`}>
                      {netFlow >= 0 ? "+" : ""}
                      {formatCurrency(netFlow)}
                    </div>
                  </div>
                </div>
                <ChartContainer config={flowChartConfig} className="mt-5 h-[280px] w-full aspect-auto">
                  <BarChart data={chartData} margin={{ left: 0, right: 4, top: 8 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={52} tickFormatter={(value) => compactCurrency(Number(value))} />
                    <ChartTooltip
                      cursor={{ fill: "hsl(var(--muted) / 0.35)" }}
                      content={
                        <ChartTooltipContent
                          formatter={(value, name) => (
                            <div className="flex min-w-[150px] items-center justify-between gap-3">
                              <span className="text-muted-foreground">
                                {flowChartConfig[name as keyof typeof flowChartConfig]?.label}
                              </span>
                              <span className="font-mono font-medium">{formatCurrency(Number(value))}</span>
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
                  <div className="text-xs uppercase text-muted-foreground">Pending withdrawals</div>
                  <div className="mt-2 text-2xl font-bold">{pendingWithdrawals.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Requests waiting for payout review</div>
                </div>
                <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="text-xs uppercase text-muted-foreground">Pending KYC</div>
                  <div className="mt-2 text-2xl font-bold">{pendingKyc.length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">User verifications waiting for decision</div>
                </div>
                <div className="gradient-card rounded-2xl border border-border p-5 shadow-card col-span-2 lg:col-span-1">
                  <div className="text-xs uppercase text-muted-foreground">Live notifications</div>
                  <div className="mt-2 text-2xl font-bold">{notifications.filter((item) => item.active).length}</div>
                  <div className="mt-1 text-xs text-muted-foreground">Announcements visible to clients</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
              <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-primary" /> Direct balance adjustment
                </h3>
                <div className="space-y-2">
                  <Label>Search account</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} className="pl-9" placeholder="Search by email" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/40 max-h-72 overflow-auto">
                  {filteredUsers.map((account) => (
                    <button
                      key={account._id}
                      onClick={() => setSelectedUserId(account._id)}
                      className={`w-full border-b border-border px-4 py-3 text-left last:border-b-0 ${selectedUser?._id === account._id ? "bg-accent" : ""}`}
                    >
                      <div className="font-medium">{account.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(account.balance)} balance • {formatCurrency(account.invested)} invested
                      </div>
                    </button>
                  ))}
                  {filteredUsers.length === 0 && (
                    <div className="px-4 py-6 text-sm text-muted-foreground">No matching accounts found.</div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Adjustment amount</Label>
                  <Input value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} placeholder="Use +500 or -250" />
                </div>
                <div className="space-y-2">
                  <Label>Reason</Label>
                  <Textarea value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
                </div>
                <Button onClick={adjustBalance} className="gradient-primary shadow-glow">
                  Update account balance
                </Button>
              </div>

              <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
                <div className="p-4 border-b border-border font-semibold">Accounts</div>
                <table className="w-full text-sm">
                  <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
                    <tr>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Joined</th>
                      <th className="text-left p-3">KYC</th>
                      <th className="text-right p-3">Balance</th>
                      <th className="text-right p-3">Invested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((account) => (
                      <tr key={account._id} className="border-t border-border">
                        <td className="p-3">{account.email}</td>
                        <td className="p-3 text-muted-foreground">{new Date(account.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 capitalize">{account.kycStatus?.replace("_", " ") || "not started"}</td>
                        <td className="p-3 text-right">{formatCurrency(account.balance)}</td>
                        <td className="p-3 text-right">{formatCurrency(account.invested)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
              <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" /> Investment plans
                </h3>
                <div className="space-y-2">
                  <Label>Plan name</Label>
                  <Input value={planForm.name} onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input type="number" value={planForm.amount} onChange={(e) => setPlanForm({ ...planForm, amount: +e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>ROI %</Label>
                    <Input type="number" step="0.1" value={planForm.roi} onChange={(e) => setPlanForm({ ...planForm, roi: +e.target.value })} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Display order</Label>
                  <Input type="number" value={planForm.order || 0} onChange={(e) => setPlanForm({ ...planForm, order: +e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Minimum investment amount</Label>
                  <Input
                    type="number"
                    value={settings.investmentMinAmount || 10}
                    onChange={(e) => setSettings({ ...settings, investmentMinAmount: +e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePlan} className="gradient-primary shadow-glow">
                    <Plus className="mr-2 h-4 w-4" /> {editingPlanId ? "Update plan" : "Create plan"}
                  </Button>
                  <Button variant="outline" onClick={saveSettings}>Save global rules</Button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div key={plan._id} className="gradient-card rounded-2xl border border-border p-4 shadow-card">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="mt-2 text-2xl font-bold">${plan.amount}</div>
                    <div className="text-sm text-success">{plan.roi}% daily ROI</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Returns ${(plan.amount * (1 + plan.roi / 100)).toFixed(2)} by maturity
                    </div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingPlanId(plan._id || null); setPlanForm({ ...emptyPlan, ...plan }); }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeResource(`/admin/investment-plans/${plan._id}`, "Plan")}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {plans.length === 0 && <div className="text-sm text-muted-foreground">No investment plans configured yet.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts" className="space-y-6">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
              <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><LayoutTemplate className="h-4 w-4 text-primary" /> Home posts</h3>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Image URL</Label>
                  <Input value={postForm.image || ""} onChange={(e) => setPostForm({ ...postForm, image: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Body</Label>
                  <Textarea value={postForm.body} onChange={(e) => setPostForm({ ...postForm, body: e.target.value })} className="min-h-[160px]" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={savePost} className="gradient-primary shadow-glow">
                    <Plus className="mr-2 h-4 w-4" /> {editingPostId ? "Update post" : "Publish post"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingPostId(null); setPostForm(emptyPost); }}>Reset</Button>
                </div>
              </div>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post._id} className="gradient-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold">{post.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{post.body}</div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          {post.createdAt ? new Date(post.createdAt).toLocaleString() : ""}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingPostId(post._id || null); setPostForm({ title: post.title, body: post.body, image: post.image || "", published: post.published }); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeResource(`/admin/posts/${post._id}`, "Post")}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && <div className="text-sm text-muted-foreground">No posts published yet.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
              <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><Bell className="h-4 w-4 text-primary" /> Notification panel</h3>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={notificationForm.title} onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Input value={notificationForm.type} onChange={(e) => setNotificationForm({ ...notificationForm, type: (e.target.value || "info") as NotificationItem["type"] })} placeholder="info / success / warning" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} className="min-h-[160px]" />
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveNotification} className="gradient-primary shadow-glow">
                    <Plus className="mr-2 h-4 w-4" /> {editingNotificationId ? "Update notification" : "Create notification"}
                  </Button>
                  <Button variant="outline" onClick={() => { setEditingNotificationId(null); setNotificationForm(emptyNotification); }}>Reset</Button>
                </div>
              </div>
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div key={notification._id} className="gradient-card rounded-2xl border border-border p-5 shadow-card">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase text-muted-foreground">{notification.type}</div>
                        <div className="mt-1 font-semibold">{notification.title}</div>
                        <div className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{notification.message}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => { setEditingNotificationId(notification._id || null); setNotificationForm({ ...notification }); }}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => removeResource(`/admin/notifications/${notification._id}`, "Notification")}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && <div className="text-sm text-muted-foreground">No notifications created yet.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="nfts" className="space-y-6">
            <div className="grid lg:grid-cols-[360px_minmax(0,1fr)] gap-6">
              <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
                <h3 className="font-semibold flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /> Add NFT</h3>
                <div className="grid gap-3">
                  <div className="space-y-2"><Label>Name</Label><Input value={nftForm.name} onChange={(e) => setNftForm({ ...nftForm, name: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Artist</Label><Input value={nftForm.artist || ""} onChange={(e) => setNftForm({ ...nftForm, artist: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Image URL</Label><Input value={nftForm.image || ""} onChange={(e) => setNftForm({ ...nftForm, image: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Description</Label><Textarea value={nftForm.description || ""} onChange={(e) => setNftForm({ ...nftForm, description: e.target.value })} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Price</Label><Input type="number" value={nftForm.price} onChange={(e) => setNftForm({ ...nftForm, price: +e.target.value })} /></div>
                    <div className="space-y-2"><Label>Currency</Label><Input value={nftForm.currency} onChange={(e) => setNftForm({ ...nftForm, currency: e.target.value })} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Token ID</Label><Input value={nftForm.tokenId || ""} onChange={(e) => setNftForm({ ...nftForm, tokenId: e.target.value })} /></div>
                    <div className="space-y-2"><Label>Contract</Label><Input value={nftForm.contractAddress || ""} onChange={(e) => setNftForm({ ...nftForm, contractAddress: e.target.value })} /></div>
                  </div>
                </div>
                <Button onClick={saveNft} className="gradient-primary shadow-glow">
                  <Plus className="mr-2 h-4 w-4" /> {editingNftId ? "Update NFT" : "Add NFT"}
                </Button>
              </div>
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {nfts.map((nft) => (
                  <div key={nft._id} className="gradient-card rounded-2xl border border-border p-4 shadow-card">
                    <div className="font-semibold">{nft.name}</div>
                    <div className="text-xs text-muted-foreground">{nft.artist || "Nova"}</div>
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-3">{nft.description}</div>
                    <div className="mt-3 text-sm font-medium">{nft.price} {nft.currency}</div>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setEditingNftId(nft._id || null); setNftForm({ ...emptyNft, ...nft }); }}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeResource(`/admin/nfts/${nft._id}`, "NFT")}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                {nfts.length === 0 && <div className="text-sm text-muted-foreground">No NFTs listed yet.</div>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="kyc" className="space-y-6">
            <div className="grid gap-4">
              {kycItems.map((item) => (
                <div key={item._id} className="gradient-card rounded-2xl border border-border p-5 shadow-card">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-primary" /> {item.fullName}
                      </div>
                      <div className="text-sm text-muted-foreground">{item.user?.email}</div>
                      <div className="text-xs text-muted-foreground">
                        {item.documentType} • {item.documentNumber} • {item.country}
                      </div>
                      <div className="text-xs text-muted-foreground">Front: {item.documentFrontUrl}</div>
                      {item.documentBackUrl && <div className="text-xs text-muted-foreground">Back: {item.documentBackUrl}</div>}
                      {item.selfieUrl && <div className="text-xs text-muted-foreground">Selfie: {item.selfieUrl}</div>}
                      {item.rejectionReason && <div className="text-xs text-warning">Reason: {item.rejectionReason}</div>}
                    </div>
                    <div className="w-full max-w-sm space-y-3">
                      <div className="rounded-lg border border-border bg-background/40 px-3 py-2 text-xs uppercase text-muted-foreground">
                        Status: {item.status}
                      </div>
                      <Textarea
                        placeholder="Rejection reason"
                        value={rejectReason[item._id] || ""}
                        onChange={(e) => setRejectReason((current) => ({ ...current, [item._id]: e.target.value }))}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => reviewKyc(item._id, "reject")}>
                          <X className="mr-2 h-4 w-4" /> Reject
                        </Button>
                        <Button size="sm" className="gradient-primary" onClick={() => reviewKyc(item._id, "approve")}>
                          <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {kycItems.length === 0 && <div className="text-sm text-muted-foreground">No KYC submissions yet.</div>}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
