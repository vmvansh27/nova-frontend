import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Gift, Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Create account - Nova" }] }),
  component: Login,
});

function Login() {
  const { requestOtp, verifyOtp } = useApp();
  const nav = useNavigate();
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [referralId, setReferralId] = useState(() => {
    if (typeof window === "undefined") return "";
    return new URLSearchParams(window.location.search).get("ref") || "";
  });
  const [submitting, setSubmitting] = useState(false);

  const sendOtp = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setSubmitting(true);
    try {
      const demoCode = await requestOtp(email);
      setStep("otp");
      toast.success(demoCode ? `OTP sent - use ${demoCode} for demo` : "OTP sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send OTP");
    } finally {
      setSubmitting(false);
    }
  };

  const verify = async () => {
    setSubmitting(true);
    try {
      const user = await verifyOtp(email, otp, referralId.trim());
      toast.success("Welcome to Nova");
      nav({ to: user.isAdmin ? "/admin" : "/app/home" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-glow)" }} />
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary shadow-glow">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-gradient">NOVA</span>
        </Link>
        <div className="gradient-card rounded-2xl border border-border p-8 shadow-card">
          <h1 className="text-2xl font-bold">
            {step === "email" ? "Create account" : "Verify code"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "email"
              ? "Enter your email to receive a one-time code."
              : `We sent a 6-digit code to ${email}`}
          </p>

          {step === "email" ? (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>
                  Referral ID <span className="text-muted-foreground">(optional)</span>
                </Label>
                <div className="relative">
                  <Gift className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    placeholder="Enter referral ID"
                    value={referralId}
                    onChange={(event) => setReferralId(event.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={sendOtp}
                disabled={submitting}
                className="w-full gradient-primary shadow-glow"
              >
                Send OTP
              </Button>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button
                onClick={verify}
                disabled={submitting || otp.length !== 6}
                className="w-full gradient-primary shadow-glow"
              >
                Verify & continue
              </Button>
              <button
                type="button"
                onClick={() => setStep("email")}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Change email
              </button>
            </div>
          )}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-6">
          Local demo OTP: <span className="text-foreground font-mono">123456</span>
        </p>
      </div>
    </div>
  );
}
