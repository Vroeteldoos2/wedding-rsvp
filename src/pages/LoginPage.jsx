import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 🧠 Auto-redirect if already logged in
useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    // If user is logged in AND not just coming from logout
    if (session && session.user) {
      // Optional: check if coming from logout (using referrer or custom state)
      // For now, just redirect to RSVP
      navigate("/login");
    }
  };

  checkSession();
}, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message || "Login failed");
    } else {
      toast.success("Logged in successfully!");
      navigate("/rsvp"); // ✅ Correct route
    }
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const slideshowImages = [
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//1.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//2.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//3.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//4.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//5.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//6.jpg",
    "https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//7.jpg",
  ];
  const loveQuotes = [
    "Two hearts, one future.",
    "Forever starts here.",
    "A love story written in vows.",
    "Together is a beautiful place to be.",
    "Soulmates saying 'I do'.",
    "The beginning of always.",
    "Bound by love, sealed with a kiss.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slideshowImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-12">
        <h1 className="text-4xl sm:text-5xl font-fancy text-baby_powder text-center mb-6">
          Josh & Martinique are getting hitched 💍
        </h1>

        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 space-y-6">
          <h2 className="text-3xl font-bold text-center text-gray-800">Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition"
            >
              Sign In
            </button>
          </form>

          <div className="text-sm text-center">
            <Link to="/request-reset" className="text-green-600 hover:underline">
  Forgot Password?
</Link>
            <span className="mx-2">|</span>
            <Link to="/signup" className="text-green-600 hover:underline">
              Sign Up
            </Link>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t text-center">
            <p className="text-sm text-gray-500 mb-2">Created by App Venturers</p>
            <img
              src="https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//Av%20Logo%20Red%20White%20Transparent.svg"
              alt="App Venturers Logo"
              className="h-8 mx-auto"
            />
          </div>
        </div>

        {/* Slideshow */}
        <div className="w-full max-w-md mt-6 rounded-xl overflow-hidden shadow-lg border border-ecru">
          <div className="relative aspect-[4/3]">
            {slideshowImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Wedding ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  index === currentIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute bottom-0 w-full bg-black/40 text-white text-center text-sm sm:text-base py-2 px-3 font-medium font-fancy tracking-wide">
              {loveQuotes[currentIndex]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
