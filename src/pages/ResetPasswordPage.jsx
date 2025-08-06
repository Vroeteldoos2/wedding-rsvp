import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [userReady, setUserReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email); // Autofill from token if valid
        setUserReady(true);
      } else {
        notifyError("Invalid or expired token. Please request a new reset email.");
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      notifyError("Passwords do not match");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      notifyError("Failed to reset password: " + error.message);
    } else {
      notifySuccess("Password updated. Please login.");
      navigate("/login");
    }

    setLoading(false);
  };

  if (!userReady) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center text-red-600">
        Validating reset token...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-baby_powder text-dark_green flex items-center justify-center p-4">
      <form onSubmit={handleReset} className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4 text-center">Reset Password</h2>

        <input
          type="email"
          value={email}
          disabled
          className="w-full p-2 mb-4 border rounded bg-gray-100"
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full p-2 mb-4 border rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-dark_green text-white py-2 rounded hover:bg-sea_green"
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
