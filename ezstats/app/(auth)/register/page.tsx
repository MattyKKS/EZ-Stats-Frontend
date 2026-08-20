"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Mail, Lock } from "lucide-react";
import AuthField from "@/components/auth/AuthField";
import PasswordRequirements from "@/components/auth/PasswordRequirements";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordsMismatch) return;
    setError(null);
    setSubmitting(true);
    try {
      await register(email, password, fullName);
      router.push("/dashboard");
    } catch (err) {
      const conflict = err instanceof Error && err.message.includes("409");
      setError(conflict ? "An account with that email already exists" : "Could not create account");
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="text-3xl font-extrabold text-text-primary mb-8">Create your club</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <AuthField
          id="fullName"
          label="Your name"
          type="text"
          icon={<User size={18} />}
          placeholder="Full name"
          autoComplete="name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
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
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
            required
          />
          {passwordFocused && <PasswordRequirements password={password} />}
        </div>
        <div>
          <AuthField
            id="confirmPassword"
            label="Confirm password"
            type="password"
            icon={<Lock size={18} />}
            placeholder="********"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {passwordsMismatch && (
            <p className="mt-2 text-xs font-medium text-red-500">Passwords do not match</p>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-red-500">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full bg-primary hover:bg-primary-hover text-white text-sm font-semibold rounded-xl py-3.5 transition-colors disabled:opacity-60"
        >
          {submitting ? "Creating…" : "Register"}
        </button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-text-muted">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <p className="text-center text-sm text-text-secondary">
        Already have account?{" "}
        <Link href="/login" className="text-primary font-semibold hover:underline">
          Login
        </Link>
      </p>
    </>
  );
}
