const coins = [
  { s: "BTC", p: "67,432.10", c: "+2.41%" },
  { s: "ETH", p: "3,521.55", c: "+1.12%" },
  { s: "BNB", p: "612.30", c: "-0.45%" },
  { s: "SOL", p: "172.88", c: "+4.87%" },
  { s: "XRP", p: "0.5821", c: "+0.34%" },
  { s: "ADA", p: "0.4521", c: "-1.22%" },
  { s: "DOGE", p: "0.1623", c: "+3.10%" },
  { s: "AVAX", p: "37.21", c: "+2.05%" },
  { s: "DOT", p: "7.42", c: "-0.91%" },
  { s: "MATIC", p: "0.78", c: "+1.66%" },
];

export function Ticker() {
  const list = [...coins, ...coins];
  return (
    <div className="overflow-hidden border-y border-border bg-card/40 py-3">
      <div className="flex gap-10 animate-ticker whitespace-nowrap">
        {list.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-foreground">{c.s}/USDT</span>
            <span className="text-muted-foreground">${c.p}</span>
            <span className={c.c.startsWith("+") ? "text-success" : "text-destructive"}>{c.c}</span>
          </div>
        ))}
      </div>
    </div>
  );
}