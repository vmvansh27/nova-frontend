import { createFileRoute } from "@tanstack/react-router";
import { TradingViewChart } from "@/components/TradingViewChart";
import { Ticker } from "@/components/Ticker";
import { StatCard } from "@/components/StatCard";
import { TrendingUp, BarChart3, DollarSign, Activity } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/app/market")({ component: Market });

const symbols = ["BINANCE:BTCUSDT", "BINANCE:ETHUSDT", "BINANCE:BNBUSDT", "BINANCE:SOLUSDT"];

function Market() {
  const [sym, setSym] = useState(symbols[0]);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Market</h1>
        <p className="text-sm text-muted-foreground">Live crypto markets, powered by TradingView.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="24h Volume" value="$48.2B" icon={BarChart3} delta="+3.4%" />
        <StatCard label="Market Cap" value="$2.31T" icon={DollarSign} delta="+1.2%" />
        <StatCard label="BTC Dominance" value="52.8%" icon={TrendingUp} delta="-0.3%" positive={false} />
        <StatCard label="Active Pairs" value="1,284" icon={Activity} />
      </div>

      <div className="-mx-4 md:-mx-8"><Ticker /></div>

      <div className="flex flex-wrap gap-2">
        {symbols.map((s) => (
          <button
            key={s}
            onClick={() => setSym(s)}
            className={`px-4 py-2 rounded-lg text-sm border transition ${
              sym === s
                ? "gradient-primary text-primary-foreground border-transparent shadow-glow"
                : "border-border bg-card/40 hover:bg-card"
            }`}
          >
            {s.replace("BINANCE:", "").replace("USDT", "/USDT")}
          </button>
        ))}
      </div>

      <TradingViewChart symbol={sym} height={560} />
    </div>
  );
}