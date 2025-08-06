import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";
import confetti from "canvas-confetti";

export default function RSVPPage() {
  const [user, setUser] = useState(null);
  const [hasRSVPed, setHasRSVPed] = useState(false);
  const [countdown, setCountdown] = useState("");

  // Self RSVP
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

  // On behalf
  const [onBehalfGuests, setOnBehalfGuests] = useState([]);

  const weddingDate = new Date("2026-02-21T12:30:00Z");

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const diff = weddingDate - now;

      if (diff <= 0) {
        setCountdown("🎉 It's Wedding Time!");
        clearInterval(interval);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      setCountdown(`${days} days, ${hours} hrs, ${minutes} mins until the wedding!`);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
    };
    fetchUser();
  }, []);

  const handleAddChild = () => {
    setChildren([...children, { name: "", age: "" }]);
  };

  const handleChildChange = (index, field, value) => {
    const updated = [...children];
    updated[index][field] = value;
    setChildren(updated);
  };

  const handleAddGuest = () => {
    setOnBehalfGuests([
      ...onBehalfGuests,
      {
        full_name: "",
        email: "",
        attending: true,
        dietary_requirements: "",
        song_requests: "",
      },
    ]);
  };

  const handleGuestChange = (index, field, value) => {
    const updated = [...onBehalfGuests];
    updated[index][field] = value;
    setOnBehalfGuests(updated);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("Submitting...");
    notifySuccess("Sending RSVP...");

    const submissions = [
      {
        user_id: user.id,
        full_name: fullName,
        email,
        attending,
        children: hasChildren ? JSON.stringify(children) : null,
        plus_one: hasPlusOne ? JSON.stringify({ name: plusOneName, dietary: plusOneDietary }) : null,
        dietary_requirements: dietary,
        song_requests: songs,
        submitted_by: user.id,
      },
      ...onBehalfGuests.map((guest) => ({
        user_id: null,
        full_name: guest.full_name,
        email: guest.email,
        attending: guest.attending,
        dietary_requirements: guest.dietary_requirements,
        song_requests: guest.song_requests,
        submitted_by: user.id,
      })),
    ];

    const { error } = await supabase.from("rsvps").insert(submissions);

    if (error) {
      console.error("RSVP submission error:", error);
      setStatus("Submission failed.");
      notifyError("Failed to submit RSVP.");
    } else {
      await fetch("/functions/v1/send-reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, fullName }),
      });

      setStatus("RSVP submitted successfully!");
      notifySuccess("RSVP submitted!");
      setHasRSVPed(true);
      triggerConfetti();
    }
  };

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

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center bg-white/80 backdrop-blur-md rounded-xl p-4 shadow-md">
            <p className="text-lg font-semibold text-sea_green">{countdown}</p>
          </div>

          {hasRSVPed ? (
            <div className="bg-white p-6 rounded-xl shadow text-center space-y-6">
              <h2 className="text-2xl font-bold text-dark_green">🎉 Thank you for RSVPing!</h2>
              <p className="text-gray-700">You’ve successfully RSVP’d.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow space-y-6">
              <h2 className="text-xl font-semibold text-dark_green">RSVP For Yourself</h2>

              <input type="text" placeholder="Full Name" className="w-full border p-2 rounded" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input type="email" placeholder="Email" className="w-full border p-2 rounded" value={email} onChange={(e) => setEmail(e.target.value)} required />

              <label className="block">
                Will you attend?
                <select className="w-full border p-2 rounded mt-1" value={attending} onChange={(e) => setAttending(e.target.value === "true")}>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </label>

              <label className="block">
                Bringing a Plus One?
                <select className="w-full border p-2 rounded mt-1" value={hasPlusOne ? "yes" : "no"} onChange={(e) => setHasPlusOne(e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>

              {hasPlusOne && (
                <>
                  <input type="text" className="w-full border p-2 rounded" placeholder="Plus One Name" value={plusOneName} onChange={(e) => setPlusOneName(e.target.value)} />
                  <input type="text" className="w-full border p-2 rounded" placeholder="Plus One Dietary Needs" value={plusOneDietary} onChange={(e) => setPlusOneDietary(e.target.value)} />
                </>
              )}

              <label className="block">
                Bringing Children?
                <select className="w-full border p-2 rounded mt-1" value={hasChildren ? "yes" : "no"} onChange={(e) => setHasChildren(e.target.value === "yes")}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
              </label>

              {hasChildren && children.map((child, idx) => (
                <div key={idx} className="flex gap-2">
                  <input type="text" placeholder="Child Name" className="w-full border p-2 rounded" value={child.name} onChange={(e) => handleChildChange(idx, "name", e.target.value)} />
                  <input type="number" placeholder="Age" className="w-24 border p-2 rounded" value={child.age} onChange={(e) => handleChildChange(idx, "age", e.target.value)} />
                </div>
              ))}
              {hasChildren && (
                <button type="button" onClick={handleAddChild} className="text-sea_green underline">
                  + Add Child
                </button>
              )}

              <textarea placeholder="Dietary Requirements" className="w-full border p-2 rounded" rows={2} value={dietary} onChange={(e) => setDietary(e.target.value)} />
              <textarea placeholder="Song Requests" className="w-full border p-2 rounded" rows={2} value={songs} onChange={(e) => setSongs(e.target.value)} />

              <hr className="my-6" />
              <h2 className="text-xl font-semibold text-dark_green">RSVP on Behalf of Others</h2>
              {onBehalfGuests.map((guest, index) => (
                <div key={index} className="border p-4 rounded space-y-2 bg-gray-50">
                  <input type="text" placeholder="Guest Full Name" className="w-full border p-2 rounded" value={guest.full_name} onChange={(e) => handleGuestChange(index, "full_name", e.target.value)} />
                  <input type="email" placeholder="Guest Email" className="w-full border p-2 rounded" value={guest.email} onChange={(e) => handleGuestChange(index, "email", e.target.value)} />
                  <select className="w-full border p-2 rounded" value={guest.attending} onChange={(e) => handleGuestChange(index, "attending", e.target.value === "true")}>
                    <option value="true">Attending</option>
                    <option value="false">Not Attending</option>
                  </select>
                  <input type="text" placeholder="Dietary Requirements" className="w-full border p-2 rounded" value={guest.dietary_requirements} onChange={(e) => handleGuestChange(index, "dietary_requirements", e.target.value)} />
                  <input type="text" placeholder="Song Requests" className="w-full border p-2 rounded" value={guest.song_requests} onChange={(e) => handleGuestChange(index, "song_requests", e.target.value)} />
                </div>
              ))}

              <button type="button" onClick={handleAddGuest} className="text-sea_green underline font-medium">
                + Add Another Guest
              </button>

              <button type="submit" className="w-full bg-sea_green text-white py-3 rounded font-bold hover:bg-sea_green-700">
                Submit All RSVPs
              </button>

              {status && <p className="text-center text-sm text-gray-700 whitespace-pre-wrap mt-2">{status}</p>}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
