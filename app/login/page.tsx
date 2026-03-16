"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {

const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const handleLogin = (e: any) => {
e.preventDefault();

if (email && password) {
  router.push("/dashboard");
} else {
  alert("Enter email and password");
}


};

return ( <div className="flex items-center justify-center min-h-screen bg-gray-100">

```
  <form
    onSubmit={handleLogin}
    className="bg-white p-8 rounded-xl shadow-md w-96 space-y-4"
  >

    <h2 className="text-2xl font-bold text-center">
      Login
    </h2>

    <input
      type="email"
      placeholder="Email"
      className="w-full border p-2 rounded"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
    />

    <input
      type="password"
      placeholder="Password"
      className="w-full border p-2 rounded"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      type="submit"
      className="w-full bg-indigo-600 text-white p-2 rounded"
    >
      Login
    </button>

  </form>

</div>
);
}
