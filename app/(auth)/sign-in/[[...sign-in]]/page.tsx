import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black p-4">
      <div className="w-full max-w-md">
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "w-full shadow-2xl rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10",
              headerTitle: "text-2xl font-bold text-white",
              headerSubtitle: "text-gray-300",
              socialButtonsBlockButton: "bg-white/10 hover:bg-white/20 border border-white/10 text-white",
              socialButtonsBlockButtonText: "text-white font-medium",
              dividerLine: "bg-white/20",
              dividerText: "text-gray-400",
              formFieldLabel: "text-gray-300",
              formFieldInput: "bg-white/10 border-white/20 text-white focus:border-indigo-500 placeholder:text-gray-500",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all",
              footerActionText: "text-gray-400",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
            },
          }}
        />
      </div>
    </div>
  );
}
