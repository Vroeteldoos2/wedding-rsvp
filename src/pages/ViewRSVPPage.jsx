import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";
import confetti from "canvas-confetti";

export default function ViewRSVPPage() {
  const [rsvp, setRsvp] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    const fetchRSVP = async () => {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

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

      // 🎉 Trigger confetti
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
      {/* Background */}
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
      <div className="relative z-10 flex justify-center min-h-screen p-6">
        <div className="w-full max-w-2xl space-y-6">
          {/* 🎉 Thank you card */}
          {!editMode ? (
            <div className="bg-white p-8 rounded-2xl shadow-xl text-center space-y-6">
              <h2 className="text-3xl font-bold text-dark_green">🎉 Thank you for RSVPing!</h2>
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

              <p className="text-sm text-gray-700 mt-2">
                Instead of physical gifts, we kindly request a cash contribution. <br />
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
            <form
              onSubmit={handleUpdate}
              className="bg-white rounded-2xl shadow-xl p-6 space-y-4"
            >
              <h2 className="text-3xl font-bold text-dark_green text-center">Update RSVP</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Will you attend?
                  </label>
                  <select
                    className="w-full border p-2 rounded-md"
                    value={formData.attending}
                    onChange={(e) =>
                      setFormData({ ...formData, attending: e.target.value === "true" })
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div className="space-y-2 sm:flex sm:gap-4 sm:space-y-0">
                  <label className="w-full text-gray-700 text-sm font-medium">
                    Bringing a Plus One?
                    <select
                      className="mt-1 w-full border p-2 rounded-md"
                      value={formData.hasPlusOne ? "yes" : "no"}
                      onChange={(e) =>
                        setFormData({ ...formData, hasPlusOne: e.target.value === "yes" })
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>

                  <label className="w-full text-gray-700 text-sm font-medium">
                    Bringing Children?
                    <select
                      className="mt-1 w-full border p-2 rounded-md"
                      value={formData.hasChildren ? "yes" : "no"}
                      onChange={(e) =>
                        setFormData({ ...formData, hasChildren: e.target.value === "yes" })
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Yes</option>
                    </select>
                  </label>
                </div>

                {formData.hasPlusOne && (
                  <div className="space-y-2 border p-4 rounded-md bg-baby_powder">
                    <input
                      type="text"
                      placeholder="Plus One's Name"
                      className="w-full border p-2 rounded-md"
                      value={formData.plusOneName}
                      onChange={(e) =>
                        setFormData({ ...formData, plusOneName: e.target.value })
                      }
                    />
                    <input
                      type="text"
                      placeholder="Plus One's Dietary Needs"
                      className="w-full border p-2 rounded-md"
                      value={formData.plusOneDietary}
                      onChange={(e) =>
                        setFormData({ ...formData, plusOneDietary: e.target.value })
                      }
                    />
                  </div>
                )}

                {formData.hasChildren && (
                  <div className="space-y-4">
                    {formData.children.map((child, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Child's Name"
                          className="w-full border p-2 rounded-md"
                          value={child.name}
                          onChange={(e) =>
                            handleChildChange(index, "name", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          placeholder="Age"
                          className="w-24 border p-2 rounded-md"
                          value={child.age}
                          onChange={(e) =>
                            handleChildChange(index, "age", e.target.value)
                          }
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          children: [...formData.children, { name: "", age: "" }],
                        })
                      }
                      className="text-sm text-sea_green underline"
                    >
                      Add another child
                    </button>
                  </div>
                )}

                <textarea
                  placeholder="Dietary Requirements (optional)"
                  className="w-full border p-3 rounded-md"
                  rows={2}
                  value={formData.dietary}
                  onChange={(e) =>
                    setFormData({ ...formData, dietary: e.target.value })
                  }
                />

                <textarea
                  placeholder="Song Requests (optional)"
                  className="w-full border p-3 rounded-md"
                  rows={2}
                  value={formData.songs}
                  onChange={(e) =>
                    setFormData({ ...formData, songs: e.target.value })
                  }
                />

                <button
                  type="submit"
                  className="w-full bg-sea_green text-white py-3 rounded-md font-semibold hover:bg-sea_green-700 transition"
                >
                  Save Changes
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
