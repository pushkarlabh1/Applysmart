import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-zinc-950 p-4 overflow-hidden">
      
      {/* ── Ambient background glows ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div style={{background: "radial-gradient(ellipse at 15% 15%, rgba(20,184,166,0.15) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{background: "radial-gradient(ellipse at 85% 75%, rgba(6,182,212,0.12) 0%, transparent 55%)"}} className="absolute inset-0" />
        <div style={{backgroundImage: "linear-gradient(rgba(20,184,166,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(20,184,166,0.04) 1px, transparent 1px)", backgroundSize: "48px 48px"}} className="absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-2xl rounded-3xl bg-zinc-900/40 backdrop-blur-xl border border-white/10",
              headerTitle: "text-2xl font-bold text-white tracking-tight",
              headerSubtitle: "text-zinc-500",
              socialButtonsBlockButton: "bg-white/5 hover:bg-white/10 border border-white/5 text-white transition-all",
              socialButtonsBlockButtonText: "text-zinc-300 font-medium",
              dividerLine: "bg-white/10",
              dividerText: "text-zinc-600",
              formFieldLabel: "text-zinc-400 font-bold uppercase tracking-widest text-[10px] mb-2",
              formFieldInput: "bg-zinc-950 border-white/5 text-white focus:border-teal-500/40 transition-all placeholder:text-zinc-700 p-3 rounded-xl",
              formButtonPrimary: "bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-bold transition-all shadow-lg shadow-teal-900/20 py-3 rounded-xl",
              footerActionText: "text-zinc-500",
              footerActionLink: "text-teal-400 hover:text-teal-300 font-bold",
            },
          }}
        />
      </div>
    </div>
  );
}
