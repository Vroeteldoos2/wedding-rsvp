import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { CSVLink } from "react-csv";
import toast from "react-hot-toast";
import EditRsvpModal from "../components/EditRsvpModal";

export default function DashboardPage() {
  const [rsvps, setRsvps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [search, setSearch] = useState("");
  const [editingRsvp, setEditingRsvp] = useState(null);

  const fetchRsvps = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("rsvps")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch RSVPs.");
      setLoading(false);
      return;
    }

    const parsed = (data || []).map((r) => {
      let parsedChildren = [];
      let parsedPlusOne = null;

      try {
        const parsed = r.children ? JSON.parse(r.children) : [];
        parsedChildren = Array.isArray(parsed)
          ? parsed
          : typeof parsed === "object"
          ? [parsed]
          : [];
      } catch {
        parsedChildren = [];
      }

      try {
        parsedPlusOne = r.plus_one ? JSON.parse(r.plus_one) : null;
      } catch {
        parsedPlusOne = null;
      }

      return {
        ...r,
        children: parsedChildren,
        plus_one: parsedPlusOne,
      };
    });

    setRsvps(parsed);
    setLoading(false);
  };

  useEffect(() => {
    fetchRsvps();
  }, []);

  useEffect(() => {
    let filteredData = [...rsvps];

    if (filter === "attending") {
      filteredData = filteredData.filter((r) => r.attending);
    } else if (filter === "not_attending") {
      filteredData = filteredData.filter((r) => !r.attending);
    }

    if (search) {
      filteredData = filteredData.filter((r) =>
        `${r.full_name} ${r.email}`.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sortBy === "name") {
      filteredData.sort((a, b) => a.full_name.localeCompare(b.full_name));
    } else if (sortBy === "email") {
      filteredData.sort((a, b) => a.email.localeCompare(b.email));
    } else if (sortBy === "created_at") {
      filteredData.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    setFiltered(filteredData);
  }, [rsvps, filter, sortBy, search]);

  const handleDelete = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this RSVP?");
    if (!confirm) return;

    const { error } = await supabase.from("rsvps").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete RSVP.");
    } else {
      toast.success("RSVP deleted.");
      setRsvps((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const total = rsvps.length;
  const attending = rsvps.filter((r) => r.attending).length;
  const notAttending = rsvps.filter((r) => !r.attending).length;
  const withKids = rsvps.filter((r) => r.children?.length > 0).length;

  const headers = [
    { label: "Name", key: "full_name" },
    { label: "Email", key: "email" },
    { label: "Attending", key: "attending" },
    { label: "Dietary", key: "dietary_requirements" },
    { label: "Song Requests", key: "song_requests" },
    { label: "Created At", key: "created_at" },
  ];

  return (
    <div
      className="relative min-h-screen w-full text-black"
      style={{
        backgroundImage:
          "url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gray-900/70" />

      <div className="relative z-10 p-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">
          Admin RSVP Dashboard
        </h1>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 text-center text-sm">
          <div className="bg-white p-3 rounded shadow">
            <p className="font-bold text-xl text-dark_green">{total}</p>
            <p>Total RSVPs</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="font-bold text-xl text-dark_green">{attending}</p>
            <p>Attending</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="font-bold text-xl text-dark_green">{notAttending}</p>
            <p>Not Attending</p>
          </div>
          <div className="bg-white p-3 rounded shadow">
            <p className="font-bold text-xl text-dark_green">{withKids}</p>
            <p>With Children</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-5 mb-7">
          <div className="flex gap-4">
            <select
              className="border p-2 rounded"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="attending">Attending</option>
              <option value="not_attending">Not Attending</option>
            </select>

            <select
              className="border p-2 rounded"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_at">Newest</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
            </select>
          </div>

          <input
            type="text"
            className="border p-2 rounded w-full sm:w-64"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* CSV Export */}
        <div className="text-right mb-4">
          <CSVLink
            data={filtered}
            headers={headers}
            filename={"rsvp_export.csv"}
            className="bg-sea_green text-black px-4 py-2 rounded hover:bg-sea_green-700"
          >
            Export CSV
          </CSVLink>
        </div>

        {/* RSVP List */}
        <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-4 text-gray-900">
          {loading ? (
            <p className="text-center text-gray-600">Loading RSVPs...</p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-gray-600">No RSVPs found.</p>
          ) : (
            <div className="space-y-4">
              {filtered.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="border border-ash_gray rounded p-4 shadow-sm bg-baby_powder"
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <h2 className="text-lg font-semibold">{rsvp.full_name}</h2>
                    <span
                      className={`text-sm px-3 py-1 rounded-full ${
                        rsvp.attending
                          ? "bg-sea_green text-black"
                          : "bg-ash_gray text-gray-800"
                      }`}
                    >
                      {rsvp.attending ? "Attending" : "Not Attending"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">Email: {rsvp.email}</p>

                  {rsvp.children?.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-sm">Children:</p>
                      <ul className="list-disc ml-5 text-sm">
                        {rsvp.children.map((child, index) => (
                          <li key={index}>
                            {child.name} ({child.age})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {rsvp.plus_one && (
                    <div className="mt-2 text-sm">
                      <p>
                        <strong>Plus One:</strong> {rsvp.plus_one.name}{" "}
                        {rsvp.plus_one.dietary &&
                          `(Dietary: ${rsvp.plus_one.dietary})`}
                      </p>
                    </div>
                  )}

                  {rsvp.dietary_requirements && (
                    <p className="mt-2 text-sm">
                      <strong>Dietary:</strong> {rsvp.dietary_requirements}
                    </p>
                  )}

                  {rsvp.song_requests && (
                    <p className="text-sm">
                      <strong>Song Requests:</strong> {rsvp.song_requests}
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-2">
                    Submitted: {new Date(rsvp.created_at).toLocaleString()}
                  </p>

                  <div className="mt-3 flex gap-4">
                    <button
                      className="text-blue-600 hover:underline text-sm"
                      onClick={() => setEditingRsvp(rsvp)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:underline text-sm"
                      onClick={() => handleDelete(rsvp.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {editingRsvp && (
          <EditRsvpModal
            rsvp={editingRsvp}
            onClose={() => setEditingRsvp(null)}
            onSave={fetchRsvps}
          />
        )}
      </div>
    </div>
  );
}
