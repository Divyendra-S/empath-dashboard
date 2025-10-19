import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--theme-surface),rgba(255,255,255,0.95))] px-4 py-10">
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl border shadow-xl"
        style={{ borderColor: "rgba(120, 57, 238, 0.12)" }}
      >
        <div className="grid gap-0 md:grid-cols-[1.1fr,1fr]">
          <div className="relative hidden bg-[var(--theme-primary-hex)]/90 p-10 text-white md:flex md:flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-transparent to-[rgba(255,255,255,0.02)]" />
            <div className="absolute -top-24 left-12 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.25)" }}
            />
            <div className="absolute bottom-8 right-8 h-32 w-32 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  Empath
                </span>
                <h1 className="mt-6 text-3xl font-semibold leading-tight">Welcome back to Empath</h1>
                <p className="mt-3 max-w-sm text-sm text-white/80">
                  Reconnect with your clients and keep every relationship moving forward. Sign in to access your dashboard and today&apos;s agenda.
                </p>
              </div>
              <div className="space-y-2 rounded-2xl border border-white/10 bg-white/10 p-4 text-sm backdrop-blur-md">
                <p className="font-semibold text-white">Today&apos;s gentle reminder</p>
                <p className="text-white/70">
                  A slow morning with mindful check-ins nurtures every session. The Empath suite keeps your day organized with warmth.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/96 p-8 md:p-12">
            <div className="mx-auto w-full max-w-md space-y-8">
              <div className="space-y-3 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-slate-900">Sign in</h2>
                <p className="text-sm text-slate-500">
                  Enter your details to access your dashboard and continue caring journeys.
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
