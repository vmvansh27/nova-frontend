import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/invest")({ component: Invest });

const plans = [
  { amount: 10, roi: 1.5 },
  { amount: 20, roi: 1.5 },
  { amount: 50, roi: 1.8 },
  { amount: 100, roi: 2.0 },
  { amount: 250, roi: 2.3 },
  { amount: 500, roi: 2.6 },
  { amount: 1000, roi: 3.0 },
];

function eligible() {
  const h = new Date().getHours();
  return h < 12 || h >= 17;
}

function Invest() {
  const { invest, balance, investments } = useApp();
  const [active, setActive] = useState(0);
  const ok = eligible();

  const place = async (amount: number, roi: number) => {
    if (!ok) return toast.error("Investments allowed before 12 PM or after 5 PM only");
    if (amount > balance) return toast.error("Insufficient balance — deposit first");
    try {
      await invest(amount);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Investment failed");
      return;
    }
    toast.success(`Invested $${amount} @ ${roi}% — matures by 6 AM`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Investment plans</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Daily ROI plans — profits mature at 6 AM the following day.
          </p>
        </div>
        <div
          className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${ok ? "border-success text-success" : "border-warning text-warning"}`}
        >
          <Clock className="h-3.5 w-3.5" /> {ok ? "Window open" : "Window closed (12 PM – 5 PM)"}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All plans", "Active investments"].map((t, i) => (
          <button
            key={t}
            onClick={() => setActive(i)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap ${active === i ? "gradient-primary shadow-glow" : "bg-card/40 border border-border"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {active === 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.amount}
              className="gradient-card rounded-2xl border border-border p-6 shadow-card hover:shadow-glow transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">${p.amount}</div>
                <div className="h-10 w-10 rounded-xl bg-success/10 border border-success/30 grid place-items-center">
                  <TrendingUp className="h-5 w-5 text-success" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">Daily ROI</div>
              <div className="text-2xl font-semibold text-success">{p.roi}%</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Returns ${(p.amount * (1 + p.roi / 100)).toFixed(2)} by 6 AM
              </div>
              <Button
                onClick={() => place(p.amount, p.roi)}
                className="mt-5 w-full gradient-primary shadow-glow"
              >
                Invest now
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
              <tr>
                <th className="text-left p-3">Amount</th>
                <th className="text-left p-3">ROI</th>
                <th className="text-left p-3">Expected return</th>
                <th className="text-left p-3">Matures</th>
                <th className="text-right p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No active investments.
                  </td>
                </tr>
              )}
              {investments.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="p-3">${i.amount}</td>
                  <td className="p-3">{i.roi}%</td>
                  <td className="p-3 text-success">${i.expectedReturn.toFixed(2)}</td>
                  <td className="p-3">{new Date(i.maturesAt).toLocaleString()}</td>
                  <td className="p-3 text-right">
                    <span className="text-xs px-2 py-1 rounded-full border border-success text-success">
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
