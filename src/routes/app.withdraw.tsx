import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import { Clock } from "lucide-react";

export const Route = createFileRoute("/app/withdraw")({ component: Withdraw });

function Withdraw() {
  const { balance, withdraw, transactions } = useApp();
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");

  const submit = async () => {
    const a = parseFloat(amount);
    if (!a || a <= 0) return toast.error("Enter a valid amount");
    if (a > balance) return toast.error("Insufficient balance");
    if (!address.startsWith("0x") || address.length < 10)
      return toast.error("Invalid BEP20 address");
    try {
      await withdraw(a, address);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Withdrawal failed");
      return;
    }
    setAmount("");
    setAddress("");
    toast.success("Withdrawal request submitted — pending admin approval");
  };

  const history = transactions.filter((t) => t.type === "withdraw");

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-bold">Withdraw</h1>

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
        <div className="text-sm text-muted-foreground">
          Available: <span className="text-foreground font-semibold">${balance.toFixed(2)}</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Amount (USD)</Label>
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50" />
          </div>
          <div className="space-y-2">
            <Label>BEP20 wallet address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>
        </div>
        <Button onClick={submit} className="gradient-primary shadow-glow">
          Request withdrawal
        </Button>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="h-3 w-3" /> Approval usually within a few hours.
        </div>
      </div>

      <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
        <div className="p-4 border-b border-border font-semibold">Withdrawal history</div>
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Address</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-muted-foreground">
                  No withdrawals yet.
                </td>
              </tr>
            )}
            {history.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="p-3">{new Date(t.date).toLocaleString()}</td>
                <td className="p-3 font-mono text-xs truncate max-w-[200px]">{t.note}</td>
                <td className="p-3 text-right">${t.amount.toFixed(2)}</td>
                <td className="p-3 text-right capitalize">
                  <span
                    className={`text-xs px-2 py-1 rounded-full border ${
                      t.status === "completed"
                        ? "border-success text-success"
                        : t.status === "rejected"
                          ? "border-destructive text-destructive"
                          : "border-warning text-warning"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
