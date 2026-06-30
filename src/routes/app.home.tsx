import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wallet, TrendingUp, DollarSign, Coins, Users, ArrowRight } from "lucide-react";
import { useApp } from "@/lib/store";
import { StatCard } from "@/components/StatCard";
import { TradingViewChart } from "@/components/TradingViewChart";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/app/home")({
  component: Dashboard,
});

function Dashboard() {
  const { balance, invested, profit, referralEarnings, investments, transactions, user } = useApp();
  const [posts, setPosts] = useState<Array<{ _id: string; title: string; body: string; image?: string; createdAt: string }>>([]);
  const [notifications, setNotifications] = useState<Array<{ _id: string; title: string; message: string; type: string }>>([]);

  useEffect(() => {
    apiFetch<{ posts: Array<{ _id: string; title: string; body: string; image?: string; createdAt: string }>; notifications: Array<{ _id: string; title: string; message: string; type: string }> }>("/user/home-feed")
      .then((data) => {
        setPosts(data.posts);
        setNotifications(data.notifications);
      })
      .catch((error) => toast.error(error.message));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Here's how your portfolio is doing today.
          </p>
        </div>
        <Link to="/app/invest">
          <Button className="gradient-primary shadow-glow">
            New investment <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Balance"
          value={`$${balance.toFixed(2)}`}
          icon={Wallet}
          delta="+12.4% this week"
        />
        <StatCard
          label="Total Invested"
          value={`$${invested.toFixed(2)}`}
          icon={DollarSign}
          delta="Active plan"
        />
        <StatCard
          label="Profit Earned"
          value={`$${profit.toFixed(2)}`}
          icon={TrendingUp}
          delta="+1.5% today"
        />
        <StatCard
          label="Referral Earnings"
          value={`$${referralEarnings.toFixed(2)}`}
          icon={Users}
          delta="3 referred"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {notifications.length > 0 && (
            <div className="space-y-3">
              {notifications.slice(0, 2).map((notification) => (
                <div key={notification._id} className="rounded-xl border border-border bg-card/70 p-4">
                  <div className="text-xs uppercase text-muted-foreground">{notification.type}</div>
                  <div className="mt-1 font-semibold">{notification.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground">{notification.message}</div>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">BTC / USDT</h2>
            <Link to="/app/market" className="text-xs text-primary hover:underline">
              Open market →
            </Link>
          </div>
          <TradingViewChart height={420} />
        </div>

        <div className="space-y-6">
          <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Latest posts</h3>
              <span className="text-xs text-muted-foreground">{posts.length} live</span>
            </div>
            <div className="space-y-4">
              {posts.length === 0 && (
                <p className="text-sm text-muted-foreground">No admin posts published yet.</p>
              )}
              {posts.slice(0, 3).map((post) => (
                <div key={post._id} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="font-semibold">{post.title}</div>
                  <div className="mt-1 text-sm text-muted-foreground line-clamp-3">{post.body}</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {new Date(post.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" /> Active investments
              </h3>
              <span className="text-xs text-muted-foreground">{investments.length} active</span>
            </div>
            <div className="space-y-3">
              {investments.length === 0 && (
                <p className="text-sm text-muted-foreground">No active investments yet.</p>
              )}
              {investments.map((inv) => (
                <div key={inv.id} className="rounded-lg border border-border bg-background/40 p-3">
                  <div className="flex justify-between text-sm">
                    <span>
                      ${inv.amount} @ {inv.roi}%
                    </span>
                    <span className="text-success">
                      +${(inv.expectedReturn - inv.amount).toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Matures {new Date(inv.maturesAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="gradient-card rounded-2xl border border-border p-5 shadow-card">
            <h3 className="font-semibold mb-4">Recent activity</h3>
            <div className="space-y-3">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between text-sm">
                  <div>
                    <div className="capitalize">{tx.type.replace("_", " ")}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div
                    className={
                      tx.type === "withdraw" || tx.type === "investment"
                        ? "text-foreground"
                        : "text-success"
                    }
                  >
                    {tx.type === "withdraw" || tx.type === "investment" ? "-" : "+"}$
                    {tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
