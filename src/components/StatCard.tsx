import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  icon: Icon,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: string;
  positive?: boolean;
}) {
  return (
    <div className="gradient-card rounded-2xl border border-border p-5 shadow-card hover:shadow-glow transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-bold">{value}</div>
          {delta && (
            <div className={`mt-1 text-xs ${positive ? "text-success" : "text-destructive"}`}>{delta}</div>
          )}
        </div>
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/30 grid place-items-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </div>
  );
}