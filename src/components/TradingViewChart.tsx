import { useEffect, useRef } from "react";

export function TradingViewChart({ symbol = "BINANCE:BTCUSDT", height = 480 }: { symbol?: string; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: "60",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      backgroundColor: "rgba(20, 20, 50, 0.4)",
      gridColor: "rgba(99, 102, 241, 0.15)",
      allow_symbol_change: true,
      hide_top_toolbar: false,
      hide_legend: false,
      withdateranges: true,
      support_host: "https://www.tradingview.com",
    });
    ref.current.appendChild(script);
  }, [symbol]);

  return (
    <div className="rounded-xl overflow-hidden border border-border shadow-card" style={{ height }}>
      <div ref={ref} className="tradingview-widget-container h-full w-full">
        <div className="tradingview-widget-container__widget h-full w-full" />
      </div>
    </div>
  );
}