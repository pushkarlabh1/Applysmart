import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-6">
        ApplySmart - AI Career Assistant
      </h1>

      <Link
        href="/sign-in"
        className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200"
      >
        Go to Login
      </Link>
    </div>
  );
}

