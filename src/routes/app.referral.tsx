import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Gift, Link as LinkIcon, Users } from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { apiFetch, useApp } from "@/lib/store";

export const Route = createFileRoute("/app/referral")({ component: Referral });

interface ReferralData {
  code: string;
  earnings: number;
  referrals: Array<{
    _id: string;
    reward: number;
    referred: { email: string; createdAt: string };
  }>;
}

function Referral() {
  const { user } = useApp();
  const [data, setData] = useState<ReferralData>({ code: "", earnings: 0, referrals: [] });

  useEffect(() => {
    apiFetch<ReferralData>("/referral/mine")
      .then(setData)
      .catch((error) => toast.error(error.message));
  }, []);

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/login?ref=${data.code || user?.referralCode}`
      : `/login?ref=${data.code || user?.referralCode}`;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Referrals</h1>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Total earned" value={`$${data.earnings.toFixed(2)}`} icon={Gift} />
        <StatCard label="Referrals" value={data.referrals.length.toString()} icon={Users} />
        <StatCard label="Reward source" value="Signup" icon={LinkIcon} />
      </div>

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
        <div>
          <div className="text-xs uppercase text-muted-foreground">Your referral code</div>
          <div className="text-3xl font-bold text-gradient mt-1">
            {data.code || user?.referralCode}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[200px] px-3 py-2 rounded-lg border border-border bg-background/50 font-mono text-xs truncate">
            {link}
          </div>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(link);
              toast.success("Link copied");
            }}
          >
            <Copy className="h-4 w-4 mr-2" /> Copy
          </Button>
        </div>
      </div>

      <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Referred users</div>
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left p-3">User</th>
              <th className="text-left p-3">Joined</th>
              <th className="text-right p-3">Earned</th>
            </tr>
          </thead>
          <tbody>
            {data.referrals.length === 0 && (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  No referred users yet.
                </td>
              </tr>
            )}
            {data.referrals.map((referral) => (
              <tr key={referral._id} className="border-t border-border">
                <td className="p-3">{referral.referred.email}</td>
                <td className="p-3 text-muted-foreground">
                  {new Date(referral.referred.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 text-right text-success">+${referral.reward.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
