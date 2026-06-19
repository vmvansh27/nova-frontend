import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownToLine, ArrowUpFromLine, Copy, Wallet as WalletIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/app/wallet")({ component: WalletPage });

function WalletPage() {
  const { user, balance } = useApp();
  const walletAddress = user?.platformWalletAddress || user?.walletAddress || "";
  const copy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Wallet address copied");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Wallet</h1>

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <WalletIcon className="h-4 w-4" /> Total balance
            </div>
            <div className="text-4xl font-bold mt-1">${balance.toFixed(2)}</div>
            <div className="mt-3 text-xs text-muted-foreground font-mono flex items-center gap-2">
              Platform wallet: {walletAddress}
              <button onClick={copy} className="text-primary hover:text-primary-glow">
                <Copy className="h-3 w-3" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/app/deposit">
              <Button className="gradient-primary shadow-glow">
                <ArrowDownToLine className="h-4 w-4 mr-2" /> Deposit
              </Button>
            </Link>
            <Link to="/app/withdraw">
              <Button variant="outline">
                <ArrowUpFromLine className="h-4 w-4 mr-2" /> Withdraw
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left p-4">Asset</th>
              <th className="text-left p-4">Network</th>
              <th className="text-right p-4">Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="p-4">
                <div className="font-semibold">USDT</div>
                <div className="text-xs text-muted-foreground">Tether</div>
              </td>
              <td className="p-4 text-muted-foreground">BEP20</td>
              <td className="p-4 text-right">${balance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
