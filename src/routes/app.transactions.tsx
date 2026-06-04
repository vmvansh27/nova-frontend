import { createFileRoute } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useState } from "react";

export const Route = createFileRoute("/app/transactions")({ component: Transactions });

const filters = ["all", "deposit", "withdraw", "investment", "profit", "referral"] as const;

function Transactions() {
  const { transactions } = useApp();
  const [f, setF] = useState<(typeof filters)[number]>("all");
  const list = f === "all" ? transactions : transactions.filter((t) => t.type === f);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Transaction history</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((x) => (
          <button key={x} onClick={() => setF(x)} className={`px-3 py-1.5 text-sm rounded-lg capitalize ${
            f === x ? "gradient-primary shadow-glow" : "border border-border bg-card/40"
          }`}>{x}</button>
        ))}
      </div>

      <div className="gradient-card rounded-2xl border border-border shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-card/60 text-muted-foreground text-xs uppercase">
            <tr>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Note / Hash</th>
              <th className="text-right p-3">Amount</th>
              <th className="text-right p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t border-border">
                <td className="p-3 capitalize">{t.type.replace("_", " ")}</td>
                <td className="p-3 text-muted-foreground">{new Date(t.date).toLocaleString()}</td>
                <td className="p-3 font-mono text-xs truncate max-w-[240px]">{t.hash || t.note || "-"}</td>
                <td className={`p-3 text-right ${
                  t.type === "withdraw" || t.type === "investment" ? "" : "text-success"
                }`}>
                  {t.type === "withdraw" || t.type === "investment" ? "-" : "+"}${t.amount.toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  <span className={`text-xs px-2 py-1 rounded-full border ${
                    t.status === "completed" ? "border-success text-success" :
                    t.status === "rejected" ? "border-destructive text-destructive" :
                    t.status === "active" ? "border-primary text-primary" :
                    "border-warning text-warning"
                  }`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}