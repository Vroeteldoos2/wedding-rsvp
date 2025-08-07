// File: src/pages/ViewRSVPPage.jsx
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";
import confetti from "canvas-confetti";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
dayjs.extend(duration);

export default function ViewRSVPPage() {
  const [rsvp, setRsvp] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [countdown, setCountdown] = useState("");

  const weddingDateTime = dayjs("2026-02-21T14:30:00+02:00");

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

  const [formData, setFormData] = useState({
    attending: true,
    hasChildren: false,
    children: [],
    hasPlusOne: false,
    plusOneName: "",
    plusOneDietary: "",
    dietary: "",
    songs: "",
  });

 const [formattedCountdown, setFormattedCountdown] = useState("");

useEffect(() => {
  const interval = setInterval(() => {
    const now = dayjs();
    const diff = weddingDateTime.diff(now);

    if (diff > 0) {
      const dur = dayjs.duration(diff);

      const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = dur.hours();
      const minutes = dur.minutes();
      const seconds = dur.seconds();

      const parts = [];
      if (totalDays > 0) parts.push(`${totalDays} days`);
      if (hours > 0) parts.push(`${hours} hrs`);
      if (minutes > 0) parts.push(`${minutes} mins`);

      setFormattedCountdown(`${parts.join(", ")} until the wedding!`);
    } else {
      setFormattedCountdown("💒 The wedding has begun!");
    }
  }, 1000);

  return () => clearInterval(interval);
}, []);


  useEffect(() => {
    const fetchRSVP = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) return;

      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (error || !data) {
        notifyError("RSVP not found.");
        setLoading(false);
        return;
      }

      setRsvp(data);
      setFormData({
        attending: data.attending ?? true,
        hasChildren: !!data.children,
        children: Array.isArray(data.children)
          ? data.children
          : typeof data.children === "string"
          ? JSON.parse(data.children)
          : [],
        hasPlusOne: !!data.plus_one,
        plusOneName: data.plus_one?.name || "",
        plusOneDietary: data.plus_one?.dietary || "",
        dietary: data.dietary_requirements || "",
        songs: data.song_requests || "",
      });

      setLoading(false);
    };

    fetchRSVP();
  }, []);

  const handleChildChange = (index, field, value) => {
    const updated = [...formData.children];
    updated[index][field] = value;
    setFormData({ ...formData, children: updated });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const updatePayload = {
      attending: formData.attending,
      plus_one: formData.hasPlusOne
        ? { name: formData.plusOneName, dietary: formData.plusOneDietary }
        : null,
      children: formData.hasChildren ? formData.children : null,
      dietary_requirements: formData.dietary,
      song_requests: formData.songs,
    };

    const { error } = await supabase
      .from("rsvps")
      .update(updatePayload)
      .eq("id", rsvp.id);

    if (error) {
      notifyError("Failed to update RSVP.");
    } else {
      notifySuccess("RSVP updated!");
      setEditMode(false);
      confetti({
        particleCount: 300,
        spread: 160,
        startVelocity: 40,
        ticks: 400,
        origin: { x: 0.5, y: 0.5 },
        zIndex: 9999,
      });
    }
  };

  if (loading) {
    return <p className="text-center text-white mt-10">Loading...</p>;
  }

  if (!rsvp) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>No RSVP found for your account.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen pt-12 px-4 pb-12">
        {/* Countdown */}
   <div className="text-center mb-8">
  <div className="inline-block bg-white border-2 border-green-600 text-green-700 font-semibold text-lg sm:text-xl px-6 py-3 rounded-full shadow-sm">
    {formattedCountdown}
  </div>
</div>

        {/* RSVP Card */}
        <div className="w-full max-w-2xl space-y-6">
          {!editMode ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
              <h2 className="text-3xl font-bold text-dark_green">
                🎉 Thank you for RSVPing!
              </h2>
              <p className="text-gray-700 text-lg">
                We’ve received your RSVP. Here’s what you can do next:
              </p>

              <div className="space-y-4">
                <a
                  href="/upload"
                  className="block w-full bg-sea_green text-white py-3 rounded-lg font-semibold hover:bg-sea_green-700 transition"
                >
                  📸 Upload Wedding Photos or Videos
                </a>
                <a
                  href="/album"
                  className="block w-full bg-dark_green text-white py-3 rounded-lg font-semibold hover:bg-dark_green/90 transition"
                >
                  📂 View & Download the Official Wedding Album
                </a>
                <a
                  href="/venue"
                  className="block w-full bg-yellow-600 text-white py-3 rounded-lg font-semibold hover:bg-yellow-700 transition"
                >
                  📍 View Wedding Venue
                </a>
              </div>

              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md p-4 text-sm text-left">
                <strong>Wedding Details:</strong>
                <br />
                📅 <strong>Date:</strong> Saturday, 21 February 2026
                <br />
                ⏰ <strong>Time:</strong> 2:30 PM for 3:00 PM SAST
                <br />
                💌 Please arrive on time. We’ll be tying the knot at 3 PM sharp!
              </div>

              <div className="mt-2">
                <a
                  href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Josh+%26+Martinique+Wedding&dates=20260221T123000Z/20260221T150000Z&details=Join+us+to+celebrate+the+wedding+of+Josh+and+Martinique!&location=383+Graham+Rd,+Shere,+0084&sf=true&output=xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                >
                  📅 Add to Google Calendar
                </a>
              </div>

              <p className="text-sm text-gray-700 mt-2">
                Instead of physical gifts, we kindly request a cash contribution.
                <br />
                Your love and generosity are more than enough!
              </p>

              <button
                onClick={() => setEditMode(true)}
                className="mt-4 text-sea_green underline font-medium text-sm hover:text-dark_green"
              >
                ✏️ Edit My RSVP
              </button>
            </div>
          ) : (
            <form onSubmit={handleUpdate}>{/* form fields here if needed */}</form>
          )}
        </div>

        {/* Slideshow */}
        <div className="w-full max-w-2xl mt-8 rounded-xl overflow-hidden shadow-lg border border-ecru">
          <div className="relative aspect-[4/3]">
            {slideshowImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Wedding ${index + 1}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms] ease-in-out ${
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
