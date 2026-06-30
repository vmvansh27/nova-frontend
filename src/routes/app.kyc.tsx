import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { apiFetch, useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/app/kyc")({ component: KycPage });

interface KycSubmission {
  _id: string;
  fullName: string;
  phone: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentFrontUrl: string;
  documentBackUrl?: string;
  selfieUrl?: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  updatedAt: string;
}

function KycPage() {
  const { refresh, user } = useApp();
  const [submission, setSubmission] = useState<KycSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    country: "",
    documentType: "",
    documentNumber: "",
    documentFrontUrl: "",
    documentBackUrl: "",
    selfieUrl: "",
  });

  const loadKyc = async () => {
    setLoading(true);
    try {
      const response = await apiFetch<{ status: string; submission: KycSubmission | null }>("/user/kyc");
      setSubmission(response.submission);
      if (response.submission) {
        setForm({
          fullName: response.submission.fullName || "",
          phone: response.submission.phone || "",
          country: response.submission.country || "",
          documentType: response.submission.documentType || "",
          documentNumber: response.submission.documentNumber || "",
          documentFrontUrl: response.submission.documentFrontUrl || "",
          documentBackUrl: response.submission.documentBackUrl || "",
          selfieUrl: response.submission.selfieUrl || "",
        });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load KYC details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKyc();
  }, []);

  const updateField = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    try {
      await apiFetch("/user/kyc", { method: "POST", body: JSON.stringify(form) });
      await Promise.all([loadKyc(), refresh()]);
      toast.success("KYC submitted for review");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit KYC");
    }
  };

  const status = submission?.status || user?.kycStatus || "not_started";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" /> KYC verification
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your verification details for manual admin review.
          </p>
        </div>
        <div className="rounded-full border border-border px-3 py-1 text-xs uppercase text-muted-foreground">
          Status: {status.replace("_", " ")}
        </div>
      </div>

      {submission?.status === "rejected" && submission.rejectionReason && (
        <div className="rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm text-warning">
          <div className="flex items-start gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <div className="font-semibold">Last submission was rejected</div>
              <div className="mt-1">{submission.rejectionReason}</div>
            </div>
          </div>
        </div>
      )}

      <div className="gradient-card rounded-2xl border border-border p-6 shadow-card space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Country</Label>
            <Input value={form.country} onChange={(e) => updateField("country", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Document type</Label>
            <Input
              value={form.documentType}
              onChange={(e) => updateField("documentType", e.target.value)}
              placeholder="Passport / National ID / Driving License"
            />
          </div>
          <div className="space-y-2">
            <Label>Document number</Label>
            <Input
              value={form.documentNumber}
              onChange={(e) => updateField("documentNumber", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Front image URL</Label>
            <Input
              value={form.documentFrontUrl}
              onChange={(e) => updateField("documentFrontUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Back image URL</Label>
            <Input
              value={form.documentBackUrl}
              onChange={(e) => updateField("documentBackUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
          <div className="space-y-2">
            <Label>Selfie URL</Label>
            <Input
              value={form.selfieUrl}
              onChange={(e) => updateField("selfieUrl", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Notes for reviewer</Label>
          <Textarea
            value={`Account email: ${user?.email || ""}`}
            readOnly
            className="opacity-70"
          />
        </div>
        <Button onClick={submit} disabled={loading || submission?.status === "approved"} className="gradient-primary shadow-glow">
          {submission?.status === "approved" ? "KYC approved" : "Submit for review"}
        </Button>
      </div>
    </div>
  );
}
