import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  baseURL: 'http://localhost:3000',
});

export type SignInOptions = {
  callbackURL?: string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
};

export async function signInWithGithub(
  options: SignInOptions = {}
): Promise<void> {
  const {
    callbackURL = '/stage',
    errorCallbackURL = '/log-in',
    newUserCallbackURL = '/stage',
  } = options;
  await authClient.signIn.social({
    provider: 'github',
    callbackURL,
    errorCallbackURL,
    newUserCallbackURL,
  });
}

export type EmailCredentials = { email: string; password: string };

export async function signInWithEmail(
  creds: EmailCredentials,
  options: SignInOptions = {}
): Promise<{ ok: boolean; error?: string }> {
  const { callbackURL = '/stage' } = options;
  const { error } = await authClient.signIn.email({ ...creds, callbackURL });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export type SignUpPayload = { email: string; password: string; name: string };

export async function signUpWithEmail(
  payload: SignUpPayload
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await authClient.signUp.email(payload);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function requestPasswordReset(
  email: string,
  redirectTo = '/reset-password'
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function resetPassword(
  newPassword: string,
  token: string
): Promise<{ ok: boolean; error?: string }> {
  const { error } = await authClient.resetPassword({ newPassword, token });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
