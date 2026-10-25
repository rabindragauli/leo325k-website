"use client";

import { useActionState } from "react";
import { signIn } from "@/app/admin-internal/actions";
import { fieldClasses, labelClasses, submitClasses } from "./form-styles";

// Works without JavaScript too: the form posts to the server action and the page re-renders.
export function SignInForm() {
  const [state, action, pending] = useActionState(signIn, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signin-username" className={labelClasses}>
          Username
        </label>
        <input
          id="signin-username"
          name="username"
          required
          maxLength={100}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state?.username}
          aria-describedby={state ? "signin-error" : undefined}
          className={fieldClasses}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="signin-password" className={labelClasses}>
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          required
          maxLength={1000}
          autoComplete="current-password"
          aria-describedby={state ? "signin-error" : undefined}
          className={fieldClasses}
        />
      </div>
      <p id="signin-error" role="alert" className="text-sm font-semibold text-form-error empty:hidden">
        {state?.error}
      </p>
      <button type="submit" disabled={pending} className={submitClasses}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
