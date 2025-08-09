import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import {
  Menu,
  X,
  Home,
  UploadCloud,
  Image,
  LayoutDashboard,
  LogOut,
  MessageCircleMore,
} from "lucide-react";

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
  const getInitials = (email) => email?.slice(0, 2).toUpperCase() || "";

  if (!user) return null;

  return (
    <nav className="bg-dark_green text-baby_powder shadow-md z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
        <div className="text-lg sm:text-xl font-bold whitespace-nowrap">
          We are getting hitched 💍
        </div>

        {/* Desktop */}
        <div className="hidden sm:flex items-center space-x-6 text-sm sm:text-base">
          <NavLink to="/rsvp" label="Home" icon={<Home size={18} />} active={isActive("/rsvp")} />
          <NavLink
            to="/upload"
            label="Upload Media"
            icon={<UploadCloud size={18} />}
            active={isActive("/upload")}
          />
          <NavLink
            to="/album"
            label="Wedding Album"
            icon={<Image size={18} />}
            active={isActive("/album")}
          />
          <NavLink
            to="/message-wall"
            label="Messages"
            icon={<MessageCircleMore size={18} />}
            active={isActive("/message-wall")}
          />
          {isSuperuser && (
            <NavLink
              to="/dashboard"
              label="Dashboard"
              icon={<LayoutDashboard size={18} />}
              active={isActive("/dashboard")}
            />
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 hover:underline transition"
          >
            <LogOut size={18} />
            Logout
          </button>
          <div className="bg-sea_green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
            {getInitials(user.email)}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle Menu">
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div className="sm:hidden px-4 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-sea_green text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
              {getInitials(user.email)}
            </div>
            <span className="text-xs text-ash_gray">{user.email}</span>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <NavLink
              to="/rsvp"
              label="Home"
              icon={<Home size={18} />}
              active={isActive("/rsvp")}
              onClick={() => setMenuOpen(false)}
            />
            <NavLink
              to="/upload"
              label="Upload Media"
              icon={<UploadCloud size={18} />}
              active={isActive("/upload")}
              onClick={() => setMenuOpen(false)}
            />
            <NavLink
              to="/album"
              label="Wedding Album"
              icon={<Image size={18} />}
              active={isActive("/album")}
              onClick={() => setMenuOpen(false)}
            />
            <NavLink
              to="/leave-a-message"
              label="Messages"
              icon={<MessageCircleMore size={18} />}
              active={isActive("/leave-a-message")}
              onClick={() => setMenuOpen(false)}
            />
            {isSuperuser && (
              <NavLink
                to="/dashboard"
                label="Dashboard"
                icon={<LayoutDashboard size={18} />}
                active={isActive("/dashboard")}
                onClick={() => setMenuOpen(false)}
              />
            )}
            <button
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-2 hover:underline"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ to, label, icon, active, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-2 font-medium transition hover:underline ${
        active ? "text-sea_green font-semibold underline" : ""
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
