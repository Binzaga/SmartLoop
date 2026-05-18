"use client"

import { useState, useActionState } from "react"
import { IconArrowRight } from "@/components/icons"
import { authAction } from "@/app/login/actions"

export function LoginForm({
  defaultMode = "login",
  next,
}: {
  defaultMode?: "login" | "signup"
  next?: string
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [state, formAction, isPending] = useActionState(authAction, undefined)

  return (
    <div className="sl-card p-6">
      <div className="mb-5 flex rounded-lg bg-bg-elev-2 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`flex-1 rounded-md py-1.5 transition ${
            mode === "login"
              ? "bg-bg-elev-3 text-text-primary"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 rounded-md py-1.5 transition ${
            mode === "signup"
              ? "bg-bg-elev-3 text-text-primary"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Create account
        </button>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="mode" value={mode} />
        {next && <input type="hidden" name="next" value={next} />}

        {mode === "signup" && (
          <Field
            label="Name (optional)"
            name="name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          name="password"
          type="password"
          required
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
        />

        {state?.error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/[0.05] px-3 py-2 text-xs text-red-300">
            {state.error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to text-sm font-medium text-bg-base transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          {!isPending && <IconArrowRight size={14} />}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoComplete,
  minLength,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  autoComplete?: string
  minLength?: number
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-text-tertiary">
        {label}
      </span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-2 text-sm placeholder:text-text-quaternary focus:border-border-strong focus:outline-none"
      />
    </label>
  )
}
