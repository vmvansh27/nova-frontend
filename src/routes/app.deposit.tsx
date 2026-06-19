import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, QrCode, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/app/deposit")({ component: Deposit });

function Deposit() {
  const { user, deposit } = useApp();
  const [amount, setAmount] = useState("");
  const [hash, setHash] = useState("");
  const assetMode = user?.assetMode || "native";
  const assetLabel = assetMode === "native" ? "BNB" : "BEP20 token";
  const networkLabel = assetMode === "native" ? "BNB Smart Chain" : "BEP20";
  const walletAddress = user?.platformWalletAddress || user?.walletAddress || "";

  const submit = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return toast.error("Enter a valid amount");
    if (!hash) return toast.error("Paste your transaction hash");
    try {
      await deposit(a, hash);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Deposit failed");
      return;
    }
    setAmount("");
    setHash("");
    toast.success("Deposit detected — balance updated");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold">Deposit {assetLabel}</h1>
      <p className="text-sm text-muted-foreground">
        Send only the configured {assetLabel} asset to the platform wallet below, then paste the
        transaction hash to credit your balance.
      </p>

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card">
        <div className="flex items-start gap-6 flex-wrap">
          <div className="h-40 w-40 rounded-xl bg-background grid place-items-center border border-border">
            <QrCode className="h-24 w-24 text-primary" />
          </div>
          <div className="flex-1 min-w-[220px] space-y-3">
            <div>
              <div className="text-xs text-muted-foreground">
                Platform deposit wallet ({networkLabel})
              </div>
              <div className="font-mono text-sm break-all mt-1">{walletAddress}</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(walletAddress);
                toast.success("Copied");
              }}
            >
              <Copy className="h-4 w-4 mr-2" /> Copy address
            </Button>
            <div className="text-xs text-warning flex gap-2">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              Only send {assetLabel} on {networkLabel} to this address. Other networks may result
              in loss of funds.
            </div>
          </div>
        </div>
      </div>

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
        <h3 className="font-semibold">Confirm deposit</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="100" />
          </div>
          <div className="space-y-2">
            <Label>Transaction hash</Label>
            <Input value={hash} onChange={(e) => setHash(e.target.value)} placeholder="0x..." />
          </div>
        </div>
        <Button onClick={submit} className="gradient-primary shadow-glow">
          Confirm deposit
        </Button>
      </div>
    </div>
  );
}
