
import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function ProtectedRoute({ children, requireSuperuser = false }) {
  const [user, setUser] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("users")
          .select("is_superuser")
          .eq("id", session.user.id)
          .single();
        setIsSuperuser(data?.is_superuser || false);
      }
      setLoading(false);
    };
    init();
  }, []);

  if (loading) return <div className="text-center mt-10 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (requireSuperuser && !isSuperuser) return <Navigate to="/" />;

  return children;
}
