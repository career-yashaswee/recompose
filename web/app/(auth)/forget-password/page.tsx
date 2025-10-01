"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth-client";

export default function Page(): React.ReactElement {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setMessage(undefined);
    const res = await requestPasswordReset(email, "/reset-password");
    if (!res.ok) setError(res.error ?? "Unable to send reset link");
    else setMessage("If an account exists, a reset link has been sent.");
    setLoading(false);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">We will email you a reset link</p>
      </div>

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        {message && <p className="text-sm text-green-600 dark:text-green-500">{message}</p>}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>
      <div className="text-center text-sm">
        <a className="underline underline-offset-4" href="/log-in">
          Back to log in
        </a>
      </div>
    </div>
  );
}


