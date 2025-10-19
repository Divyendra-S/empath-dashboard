import { SignUpForm } from "@/components/auth/signup-form";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,var(--theme-surface),rgba(255,255,255,0.95))] px-4 py-10">
      <div
        className="mx-auto w-full max-w-7xl overflow-hidden rounded-3xl border shadow-xl"
        style={{ borderColor: "rgba(120, 57, 238, 0.12)" }}
      >
        <div className="grid gap-0 md:grid-cols-[1fr,1.4fr]">
          <div className="relative hidden bg-[var(--theme-primary-hex)]/90 p-10 text-white md:flex md:flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-[rgba(255,255,255,0.08)] via-transparent to-[rgba(255,255,255,0.02)]" />
            <div
              className="absolute -top-20 left-16 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.25)" }}
            />
            <div
              className="absolute bottom-10 right-10 h-32 w-32 rounded-full blur-3xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            />
            <div className="relative flex h-full flex-col justify-center items-center text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                Start today
              </span>
              <h1 className="mt-6 text-4xl font-semibold leading-tight">
                Create your Empath space
              </h1>
            </div>
          </div>

          <div className="bg-white/96 p-8 md:p-12">
            <div className="mx-auto w-full space-y-8">
              <div className="space-y-2 text-center md:text-left">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Create an account
                </h2>
              </div>
              <SignUpForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
