import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { Menu, X } from "lucide-react";

export default function NavigationBar() {
  const [user, setUser] = useState(null);
  const [isSuperuser, setIsSuperuser] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase
          .from("users")
          .select("is_superuser")
          .eq("id", session.user.id)
          .single();
        setIsSuperuser(data?.is_superuser);
      }
    };
    fetchSession();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const getInitials = (email) => {
    if (!email) return "";
    return email.slice(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <nav className="bg-dark_green text-baby_powder shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Left side: Brand */}
        <div className="text-lg sm:text-xl font-bold whitespace-nowrap">
          Josh & Martinique are getting hitched 💍
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Desktop Avatar */}
          <div className="hidden sm:flex items-center justify-center bg-sea_green text-white rounded-full w-8 h-8 text-sm font-bold">
            {getInitials(user.email)}
          </div>

          {/* Desktop Links */}
          <div className="hidden sm:flex items-center gap-5 text-sm sm:text-base">
            <NavLink to="/rsvp" label="Home" active={isActive("/rsvp")} />
            <NavLink to="/upload" label="Upload Media" active={isActive("/upload")} />
            <NavLink to="/album" label="Wedding Album" active={isActive("/album")} />
            {isSuperuser && (
              <NavLink to="/dashboard" label="Dashboard" active={isActive("/dashboard")} />
            )}
            <button onClick={handleLogout} className="hover:underline">
              Logout
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="sm:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          {/* Mobile Avatar */}
          <div className="flex items-center mb-3">
            <div className="bg-sea_green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {getInitials(user.email)}
            </div>
            <span className="ml-2 text-xs text-ash_gray">{user.email}</span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <NavLink to="/" label="Home" active={isActive("/")} onClick={() => setMenuOpen(false)} />
            <NavLink
              to="/upload"
              label="Upload Media"
              active={isActive("/upload")}
              onClick={() => setMenuOpen(false)}
            />
            <NavLink
              to="/album"
              label="Wedding Album"
              active={isActive("/album")}
              onClick={() => setMenuOpen(false)}
            />
            {isSuperuser && (
              <NavLink
                to="/dashboard"
                label="Dashboard"
                active={isActive("/dashboard")}
                onClick={() => setMenuOpen(false)}
              />
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="hover:underline text-left"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`hover:underline font-medium transition ${
        active ? "text-sea_green font-semibold underline" : ""
      }`}
    >
      {label}
    </Link>
  );
}
