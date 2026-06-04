import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/store";

export const Route = createFileRoute("/app/nft")({ component: NFTPage });

interface NFT {
  _id: string;
  name: string;
  artist?: string;
  image?: string;
  price: number;
  currency: string;
  tokenId?: string;
}

function NFTPage() {
  const [nfts, setNfts] = useState<NFT[]>([]);

  const loadNfts = () =>
    apiFetch<NFT[]>("/nft", { auth: false })
      .then(setNfts)
      .catch((error) => toast.error(error.message));

  useEffect(() => {
    loadNfts();
  }, []);

  const buy = async (nft: NFT) => {
    try {
      await apiFetch(`/nft/buy/${nft._id}`, { method: "POST" });
      await loadNfts();
      toast.success(`${nft.name} purchased`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Purchase failed");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" /> NFT Marketplace
        </h1>
        <p className="text-sm text-muted-foreground">Discover and collect listed platform NFTs.</p>
      </div>

      {nfts.length === 0 && (
        <div className="gradient-card rounded-2xl border border-border p-8 text-center text-muted-foreground">
          No NFTs are currently listed.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {nfts.map((nft, index) => (
          <div
            key={nft._id}
            className="gradient-card rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-glow transition-shadow"
          >
            <div
              className="aspect-square relative bg-cover bg-center"
              style={{
                backgroundImage: nft.image
                  ? `url(${nft.image})`
                  : `linear-gradient(135deg, hsl(${index * 47} 80% 25%), hsl(${index * 47 + 60} 80% 45%))`,
              }}
            >
              <button className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-background/70 backdrop-blur hover:bg-background">
                <Heart className="h-4 w-4" />
              </button>
              {nft.tokenId && (
                <div className="absolute bottom-3 left-3 text-xs px-2 py-1 rounded-full bg-background/70 backdrop-blur">
                  #{nft.tokenId}
                </div>
              )}
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{nft.name}</div>
                  <div className="text-xs text-muted-foreground">by {nft.artist || "Nova"}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Price</div>
                  <div className="font-semibold">
                    {nft.price} {nft.currency}
                  </div>
                </div>
              </div>
              <Button onClick={() => buy(nft)} className="mt-4 w-full gradient-primary shadow-glow">
                Buy now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
