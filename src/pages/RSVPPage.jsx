import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from "../context/ToastContext";
import confetti from "canvas-confetti";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration); // ✅ fix for duration plugin

export default function RSVPPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [attending, setAttending] = useState(true);
  const [hasChildren, setHasChildren] = useState(false);
  const [children, setChildren] = useState([]);
  const [hasPlusOne, setHasPlusOne] = useState(false);
  const [plusOneName, setPlusOneName] = useState("");
  const [plusOneDietary, setPlusOneDietary] = useState("");
  const [dietary, setDietary] = useState("");
  const [songs, setSongs] = useState("");
  const [status, setStatus] = useState("");
  const [behalfGuests, setBehalfGuests] = useState([]);

  const weddingDate = dayjs("2026-02-21T15:00:00+02:00"); // 21 Feb 2026 at 3PM SAST

  useEffect(() => {
    const checkIfRSVPExists = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        notifyError("You must be logged in.");
        navigate("/login");
        return;
      }

      setUser(session.user);

      const { data, error } = await supabase
        .from("rsvps")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (data && !error) {
        navigate("/view-rsvp");
      } else {
        setLoading(false);
      }
    };

    checkIfRSVPExists();
  }, [navigate]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 300,
      spread: 160,
      startVelocity: 40,
      ticks: 400,
      origin: { x: 0.5, y: 0.5 },
      zIndex: 9999,
    });
  };

  const handleAddChild = () => {
    setChildren([...children, { name: "", age: "" }]);
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleAddBehalfGuest = () => {
    setBehalfGuests([
      ...behalfGuests,
      { full_name: "", attending: true, dietary: "", songs: "" },
    ]);
  };

  const handleBehalfGuestChange = (index, field, value) => {
    const updated = [...behalfGuests];
    updated[index][field] = value;
    setBehalfGuests(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setStatus("Submitting...");
    notifySuccess("Sending RSVP...");

    const mainRSVP = {
      user_id: user.id,
      full_name: fullName,
      email,
      attending,
      children: hasChildren ? children : null,
      plus_one: hasPlusOne ? { name: plusOneName, dietary: plusOneDietary } : null,
      dietary_requirements: dietary,
      song_requests: songs,
      submitted_by: user.id,
    };

    const behalfEntries = behalfGuests.map((g) => ({
      full_name: g.full_name,
      attending: g.attending,
      dietary_requirements: g.dietary,
      song_requests: g.songs,
      user_id: null,
      email: null,
      submitted_by: user.id,
    }));

    const { error: mainError } = await supabase.from("rsvps").upsert([mainRSVP], {
      onConflict: ["user_id"],
    });

    const { error: behalfError } = await supabase.from("rsvps").insert(behalfEntries);

    if (mainError || behalfError) {
      console.error("RSVP error:", mainError || behalfError);
      notifyError("Failed to submit RSVP.");
    } else {
      triggerConfetti();
      notifySuccess("RSVP submitted!");
      navigate("/view-rsvp");
    }
  };

  const getCountdown = () => {
    const now = dayjs();
    const diff = weddingDate.diff(now);
    const dur = dayjs.duration(diff);

    const days = Math.floor(dur.asDays());
    const hours = dur.hours();
    const minutes = dur.minutes();

    return `${days} days, ${hours} hrs, ${minutes} mins until the wedding!`;
  };

  if (loading) {
    return <div className="text-white text-center mt-10">Checking RSVP status...</div>;
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

      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 py-12 space-y-6">
        <div className="bg-white/95 text-sea_green text-xl sm:text-2xl font-bold text-center px-8 py-4 rounded-full shadow-lg border-2 border-sea_green animate-fade-in">
  {getCountdown()}
</div>

        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-sm rounded-2xl p-8 w-full max-w-2xl shadow-xl space-y-6"
        >
          <h2 className="text-3xl font-bold text-dark_green text-center">Wedding RSVP</h2>

          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border p-3 rounded-md"
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-md"
            required
          />

          <div className="text-dark_green font-medium">
            Attending?
            <div className="flex gap-4 mt-2">
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border ${
                  attending
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() => setAttending(true)}
              >
                Yes
              </button>
              <button
                type="button"
                className={`px-4 py-2 rounded-lg border ${
                  !attending
                    ? "bg-red-500 text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() => setAttending(false)}
              >
                No
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <label className="w-full">
              Bringing a Plus One?
              <select
                className="mt-1 w-full border p-2 rounded-md"
                value={hasPlusOne ? "yes" : "no"}
                onChange={(e) => setHasPlusOne(e.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>

            <label className="w-full">
              Bringing Children?
              <select
                className="mt-1 w-full border p-2 rounded-md"
                value={hasChildren ? "yes" : "no"}
                onChange={(e) => setHasChildren(e.target.value === "yes")}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            </label>
          </div>

          {hasPlusOne && (
            <div className="space-y-2 bg-baby_powder p-4 rounded-md">
              <input
                type="text"
                placeholder="Plus One Name"
                value={plusOneName}
                onChange={(e) => setPlusOneName(e.target.value)}
                className="w-full border p-2 rounded-md"
              />
              <input
                type="text"
                placeholder="Plus One Dietary"
                value={plusOneDietary}
                onChange={(e) => setPlusOneDietary(e.target.value)}
                className="w-full border p-2 rounded-md"
              />
            </div>
          )}

          {hasChildren && (
            <div className="space-y-3">
              {children.map((child, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Child's Name"
                    className="w-full border p-2 rounded-md"
                    value={child.name}
                    onChange={(e) => handleChildChange(index, "name", e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    className="w-24 border p-2 rounded-md"
                    value={child.age}
                    onChange={(e) => handleChildChange(index, "age", e.target.value)}
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddChild}
                className="text-sm text-sea_green underline"
              >
                Add another child
              </button>
            </div>
          )}

          <textarea
            placeholder="Dietary Requirements"
            value={dietary}
            onChange={(e) => setDietary(e.target.value)}
            className="w-full border p-3 rounded-md"
            rows={2}
          />

          <textarea
            placeholder="Song Requests"
            value={songs}
            onChange={(e) => setSongs(e.target.value)}
            className="w-full border p-3 rounded-md"
            rows={2}
          />

          {/* RSVP on behalf of others */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-lg font-semibold text-dark_green">RSVP on behalf of someone</h3>
            {behalfGuests.map((guest, index) => (
              <div key={index} className="space-y-2 bg-baby_powder p-4 rounded-md">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="w-full border p-2 rounded-md"
                  value={guest.full_name}
                  onChange={(e) =>
                    handleBehalfGuestChange(index, "full_name", e.target.value)
                  }
                />
                <select
                  className="w-full border p-2 rounded-md"
                  value={guest.attending ? "yes" : "no"}
                  onChange={(e) =>
                    handleBehalfGuestChange(index, "attending", e.target.value === "yes")
                  }
                >
                  <option value="yes">Attending</option>
                  <option value="no">Not Attending</option>
                </select>
                <input
                  type="text"
                  placeholder="Dietary Requirements"
                  className="w-full border p-2 rounded-md"
                  value={guest.dietary}
                  onChange={(e) =>
                    handleBehalfGuestChange(index, "dietary", e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Song Requests"
                  className="w-full border p-2 rounded-md"
                  value={guest.songs}
                  onChange={(e) =>
                    handleBehalfGuestChange(index, "songs", e.target.value)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddBehalfGuest}
              className="text-sm text-sea_green underline"
            >
              + Add someone else
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-sea_green text-white py-3 rounded-md font-semibold hover:bg-sea_green-700 transition"
          >
            Submit RSVP
          </button>

          {status && <p className="text-sm text-gray-600 text-center">{status}</p>}
        </form>
      </div>
    </div>
  );
}
