import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../supabaseClient";

export default function EditRsvpModal({ rsvp, onClose, onSave }) {
  const [form, setForm] = useState({
    attending: false,
    dietary_requirements: "",
    song_requests: "",
    plus_one: null,
    children: [],
  });

  useEffect(() => {
    if (rsvp) {
      setForm({
        attending: rsvp.attending,
        dietary_requirements: rsvp.dietary_requirements || "",
        song_requests: rsvp.song_requests || "",
        plus_one: rsvp.plus_one || null,
        children: rsvp.children || [],
      });
    }
  }, [rsvp]);

  const updateRsvp = async () => {
    const { error } = await supabase
      .from("rsvps")
      .update({
        attending: form.attending,
        dietary_requirements: form.dietary_requirements,
        song_requests: form.song_requests,
        plus_one: form.plus_one ? JSON.stringify(form.plus_one) : null,
        children: form.children.length ? JSON.stringify(form.children) : null,
      })
      .eq("id", rsvp.id);

    if (error) {
      toast.error("Failed to update RSVP.");
    } else {
      toast.success("RSVP updated.");
      onSave(); // triggers re-fetch in Dashboard
      onClose(); // close modal
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4 text-black">
        <h2 className="text-lg font-bold">Edit RSVP for {rsvp.full_name}</h2>

        <label className="block text-sm font-medium">
          Attending:
          <select
            className="mt-1 p-2 w-full border rounded"
            value={form.attending ? "yes" : "no"}
            onChange={(e) =>
              setForm({ ...form, attending: e.target.value === "yes" })
            }
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </label>

        <label className="block text-sm font-medium">
          Dietary Requirements:
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded"
            value={form.dietary_requirements}
            onChange={(e) =>
              setForm({ ...form, dietary_requirements: e.target.value })
            }
          />
        </label>

        <label className="block text-sm font-medium">
          Song Requests:
          <input
            type="text"
            className="mt-1 p-2 w-full border rounded"
            value={form.song_requests}
            onChange={(e) =>
              setForm({ ...form, song_requests: e.target.value })
            }
          />
        </label>

        <div className="flex justify-end gap-3 pt-4">
          <button
            className="px-4 py-2 rounded bg-gray-300 text-black hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded bg-sea_green text-white hover:bg-sea_green-700"
            onClick={updateRsvp}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
