"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithGithub, signInWithEmail } from "@/lib/auth-client";

export default function Page(): React.ReactElement {
  const params = useSearchParams();
  const callbackURL = params.get("callbackURL") ?? "/stage";
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleEmailLogin(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    const res = await signInWithEmail({ email, password }, { callbackURL });
    if (!res.ok) setError(res.error ?? "Failed to sign in");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Log in</h1>
        <p className="text-sm text-muted-foreground">Welcome back</p>
      </div>

      <form className="grid gap-4" onSubmit={handleEmailLogin}>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Log in"}
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <Button variant="outline" className="w-full" onClick={() => signInWithGithub({ callbackURL })}>
        Login with GitHub
      </Button>

      <div className="text-center text-sm">
        <a className="underline underline-offset-4" href="/forget-password">
          Forgot password?
        </a>
        <span className="px-1">·</span>
        <a className="underline underline-offset-4" href="/sign-up">
          Create account
        </a>
      </div>
    </div>
  );
}


