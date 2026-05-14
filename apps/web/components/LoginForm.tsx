"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { IconArrowRight } from "@/components/icons"

export function LoginForm({
  defaultMode = "login",
  next,
}: {
  defaultMode?: "login" | "signup"
  next?: string
}) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const endpoint = mode === "signup" ? "/auth/signup" : "/auth/login"
      const body =
        mode === "signup" ? { email, password, name: name || undefined } : { email, password }
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.")
        return
      }
      router.push(next ?? "/dashboard")
      router.refresh()
    })
  }

  return (
    <div className="sl-card p-6">
      <div className="mb-5 flex rounded-lg bg-bg-elev-2 p-1 text-sm">
        <button
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

      <form onSubmit={submit} className="space-y-4">
        {mode === "signup" && (
          <Field
            label="Name (optional)"
            value={name}
            onChange={setName}
            type="text"
            placeholder="Your name"
            autoComplete="name"
          />
        )}
        <Field
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          required
          placeholder="you@example.com"
          autoComplete="email"
        />
        <Field
          label="Password"
          value={password}
          onChange={setPassword}
          type="password"
          required
          placeholder={mode === "signup" ? "At least 8 characters" : "Your password"}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          minLength={mode === "signup" ? 8 : undefined}
        />

        {error && (
          <p className="rounded-md border border-red-500/30 bg-red-500/[0.05] px-3 py-2 text-xs text-red-300">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-accent-from to-accent-to text-sm font-medium text-bg-base transition disabled:opacity-50"
        >
          {pending ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}
          {!pending && <IconArrowRight size={14} />}
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  autoComplete,
  minLength,
}: {
  label: string
  value: string
  onChange: (v: string) => void
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
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        className="w-full rounded-lg border border-border-soft bg-bg-elev-2 px-3 py-2 text-sm placeholder:text-text-quaternary focus:border-border-strong focus:outline-none"
      />
    </label>
  )
}
