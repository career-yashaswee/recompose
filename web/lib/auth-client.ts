import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
});

export type SignInOptions = {
  callbackURL?: string;
  errorCallbackURL?: string;
  newUserCallbackURL?: string;
};

export const signIn = async (
  options: SignInOptions = {}
): Promise<void> => {
  const {
    callbackURL = "/stage",
    errorCallbackURL = "/log-in",
    newUserCallbackURL = "/stage",
  } = options;
  await authClient.signIn.social({
    provider: "github",
    callbackURL,
    errorCallbackURL,
    newUserCallbackURL,
  });
};
