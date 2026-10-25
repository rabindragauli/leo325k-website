"use client";

import { useActionState } from "react";
import { changePassword } from "@/app/admin-internal/actions";
import { fieldClasses, labelClasses, submitClasses } from "./form-styles";

const fields = [
  { name: "current", label: "Current password", autoComplete: "current-password" },
  { name: "next", label: "New password", autoComplete: "new-password", hint: true },
  { name: "confirm", label: "New password again", autoComplete: "new-password" },
] as const;

export function ChangePasswordForm() {
  const [state, action, pending] = useActionState(changePassword, null);
  const errors = state && "errors" in state ? state.errors : [];

  return (
    <form action={action} className="flex w-full max-w-[420px] flex-col gap-5">
      {fields.map((field) => (
        <div key={field.name} className="flex flex-col gap-1.5">
          <label htmlFor={`pw-${field.name}`} className={labelClasses}>
            {field.label}
          </label>
          <input
            id={`pw-${field.name}`}
            name={field.name}
            type="password"
            required
            maxLength={1000}
            autoComplete={field.autoComplete}
            aria-describedby={"hint" in field ? "pw-hint" : undefined}
            className={fieldClasses}
          />
          {"hint" in field && (
            <p id="pw-hint" className="text-xs text-slate">
              At least 12 characters. Do not include your username, “leo”, “lions”, “325k” or “leodistrict”.
            </p>
          )}
        </div>
      ))}
      <div role="alert" className="empty:hidden">
        {errors.length > 0 && (
          <ul className="list-disc pl-5 text-sm font-semibold text-form-error">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        )}
      </div>
      <p role="status" className="text-sm font-semibold text-ok empty:hidden">
        {state && "ok" in state ? "Password changed. Other devices have been signed out." : ""}
      </p>
      <button type="submit" disabled={pending} className={submitClasses}>
        {pending ? "Saving…" : "Change password"}
      </button>
    </form>
  );
}
