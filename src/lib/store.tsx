import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

const TOKEN_KEY = "nova_token";
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api";

export type TxType = "deposit" | "withdraw" | "investment" | "profit" | "referral" | "signup_bonus";
export type TxStatus = "pending" | "completed" | "rejected" | "active";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  status: TxStatus;
  date: string;
  hash?: string;
  note?: string;
}

export interface Investment {
  id: string;
  amount: number;
  roi: number;
  expectedReturn: number;
  startedAt: string;
  maturesAt: string;
  status: "active" | "matured" | "cancelled";
}

export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  referralCode: string;
  walletAddress: string;
}

interface AppState {
  user: User | null;
  loading: boolean;
  balance: number;
  invested: number;
  profit: number;
  referralEarnings: number;
  transactions: Transaction[];
  investments: Investment[];
  requestOtp: (email: string) => Promise<string | undefined>;
  verifyOtp: (email: string, code: string, referralCode?: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
  deposit: (amount: number, hash: string) => Promise<void>;
  withdraw: (amount: number, address: string) => Promise<void>;
  invest: (amount: number) => Promise<void>;
}

type ApiOptions = RequestInit & { auth?: boolean };

export async function apiFetch<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (options.auth !== false && typeof window !== "undefined") {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = (await response.json().catch(() => ({}))) as T & {
    error?: string;
    errors?: Array<{ msg?: string }>;
  };
  if (!response.ok) throw new Error(body.error || body.errors?.[0]?.msg || "Request failed");
  return body as T;
}

interface RawUser extends Partial<User> {
  _id?: string;
}

interface RawTransaction extends Omit<Transaction, "id" | "date"> {
  _id?: string;
  id?: string;
  createdAt?: string;
  date?: string;
}

interface RawInvestment extends Omit<Investment, "id" | "startedAt"> {
  _id?: string;
  id?: string;
  createdAt?: string;
  startedAt?: string;
}

interface ProfileResponse {
  user: RawUser;
  balance: number;
  invested: number;
  profit: number;
  referralEarnings: number;
  transactions: RawTransaction[];
  investments: RawInvestment[];
}

function mapUser(raw: RawUser): User {
  return {
    id: raw.id || raw._id,
    email: raw.email,
    name: raw.name || raw.email.split("@")[0],
    isAdmin: Boolean(raw.isAdmin),
    referralCode: raw.referralCode || "",
    walletAddress: raw.walletAddress || "",
  };
}

function mapTransaction(raw: RawTransaction): Transaction {
  return {
    id: raw.id || raw._id,
    type: raw.type,
    amount: raw.amount,
    status: raw.status,
    date: raw.date || raw.createdAt,
    hash: raw.hash,
    note: raw.note,
  };
}

function mapInvestment(raw: RawInvestment): Investment {
  return {
    id: raw.id || raw._id,
    amount: raw.amount,
    roi: raw.roi,
    expectedReturn: raw.expectedReturn,
    startedAt: raw.startedAt || raw.createdAt,
    maturesAt: raw.maturesAt,
    status: raw.status,
  };
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [invested, setInvested] = useState(0);
  const [profit, setProfit] = useState(0);
  const [referralEarnings, setReferralEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  const clearSession = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setBalance(0);
    setInvested(0);
    setProfit(0);
    setReferralEarnings(0);
    setTransactions([]);
    setInvestments([]);
  }, []);

  const refresh = useCallback(async () => {
    const data = await apiFetch<ProfileResponse>("/user/me");
    setUser(mapUser(data.user));
    setBalance(data.balance);
    setInvested(data.invested);
    setProfit(data.profit);
    setReferralEarnings(data.referralEarnings);
    setTransactions(data.transactions.map(mapTransaction));
    setInvestments(data.investments.map(mapInvestment));
  }, []);

  useEffect(() => {
    if (!window.localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    refresh()
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [clearSession, refresh]);

  const requestOtp = async (email: string) => {
    const response = await apiFetch<{ demoCode?: string }>("/auth/request-otp", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email }),
    });
    return response.demoCode;
  };

  const verifyOtp = async (email: string, code: string, referralCode?: string) => {
    const response = await apiFetch<{ token: string; user: User }>("/auth/verify-otp", {
      method: "POST",
      auth: false,
      body: JSON.stringify({ email, code, referralCode: referralCode || undefined }),
    });
    window.localStorage.setItem(TOKEN_KEY, response.token);
    await refresh();
    return mapUser(response.user);
  };

  const logout = () => clearSession();

  const deposit = async (amount: number, hash: string) => {
    await apiFetch("/deposit/confirm", { method: "POST", body: JSON.stringify({ amount, hash }) });
    await refresh();
  };

  const withdraw = async (amount: number, address: string) => {
    await apiFetch("/withdraw", { method: "POST", body: JSON.stringify({ amount, address }) });
    await refresh();
  };

  const invest = async (amount: number) => {
    await apiFetch("/invest", { method: "POST", body: JSON.stringify({ amount }) });
    await refresh();
  };

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        balance,
        invested,
        profit,
        referralEarnings,
        transactions,
        investments,
        requestOtp,
        verifyOtp,
        logout,
        refresh,
        deposit,
        withdraw,
        invest,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useApp must be inside AppProvider");
  return context;
}
