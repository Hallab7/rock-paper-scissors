'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "../../utils/auth-client";
import GameLoadingScreen from "../../components/LoadingState";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(form);
      router.push("/login"); // redirect to home or game page
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

   if (loading) {
  return (
    <div>
      <GameLoadingScreen
        loadingMessage={
          <>
            Please <span className="text-[#5671f5]">Wait...</span>
          </>
        }
      />
    </div>
  );
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#1f3756] to-[#141539] p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4 text-[#1f3756]"
      >
        <h1 className="text-2xl font-bold text-center text-gray-800">Sign Up</h1>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          type="text"
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 border rounded-lg"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg font-semibold transition"
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-600">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
