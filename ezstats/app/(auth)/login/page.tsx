"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock } from "lucide-react";
import AuthField from "@/components/auth/AuthField";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch {
      setError("Invalid email or password");
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold text-text-primary mb-8">Welcome Back</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthField
          id="email"
          label="Email"
          type="email"
          icon={<Mail size={18} />}
          placeholder="example@gmail.com"
          autoComplete="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div>
          <AuthField
            id="password"
            label="Password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <div className="flex justify-end mt-2">
            <Link href="/forgot-password" className="text-sm text-primary font-medium hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-60"
        >
          {submitting ? "Logging in…" : "Login"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-text-secondary">
        New to EzStats?{" "}
        <Link href="/register" className="text-primary font-semibold hover:underline">
          Create a account?
        </Link>
      </p>
    </>
  );
}
