import { useState } from "react";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";

export default function ResetRequestPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      notifyError(error.message || "Failed to send reset email.");
    } else {
      notifySuccess("Reset email sent! Please check your inbox.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-baby_powder">
      <form onSubmit={handleRequest} className="bg-white rounded-xl shadow p-6 w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-center">Request Password Reset</h2>
        <input
          type="email"
          required
          placeholder="Enter your email"
          className="w-full p-2 mb-4 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-dark_green text-white py-2 rounded hover:bg-sea_green"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </button>
      </form>
    </div>
  );
}
