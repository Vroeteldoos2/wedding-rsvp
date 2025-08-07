import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import confetti from "canvas-confetti";

dayjs.extend(utc);
dayjs.extend(timezone);

export default function MessageWallPage() {
  const [messages, setMessages] = useState([]);
  const [expandedMessageId, setExpandedMessageId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("guest_messages")
        .select("*")
        .eq("approved", true)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (!error) setMessages(data);
    };

    fetchMessages();
  }, []);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
    });
  }, []);

  const toggleExpand = (id) => {
    setExpandedMessageId((prev) => (prev === id ? null : id));
  };

  const isVideoUrl = (url) => {
    return url?.includes("mp4") || url?.includes("video");
  };

  return (
    <div className="min-h-screen bg-[url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black/60 z-0" />

      <div className="relative z-10 px-4 py-12">
        <div className="max-w-6xl mx-auto text-center space-y-4 mb-10">
          <h1 className="text-3xl font-bold text-white drop-shadow">🧡 Message Wall</h1>
          <p className="text-white/90 text-sm sm:text-base">
            Read messages from guests and share your own best wishes or memories!
          </p>

          <button
            onClick={() => navigate("/leave-a-message")}
            className="px-5 py-2 bg-sage-600 text-white text-sm font-medium rounded-md shadow hover:bg-sage-700 transition"
          >
            ✍️ Leave a Message
          </button>
        </div>

        {messages.length === 0 ? (
          <p className="text-center text-white/80">No messages yet. Check back later!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {messages.map((msg) => {
              const isExpanded = expandedMessageId === msg.id;

              return (
                <div
                  key={msg.id}
                  className="cursor-pointer group transition-all duration-300 rounded-2xl border border-gray-300 backdrop-blur bg-white/80 shadow-md p-5 space-y-3 hover:shadow-lg"
                  onClick={() => toggleExpand(msg.id)}
                >
                  <p className="text-gray-800 text-sm font-medium whitespace-pre-line">
                    {isExpanded
                      ? msg.message
                      : `${msg.message.slice(0, 120)}${msg.message.length > 120 ? "..." : ""}`}
                  </p>

                  {msg.name && (
                    <p className="text-sm text-sage-600 font-semibold">– {msg.name}</p>
                  )}

                  <p className="text-xs text-gray-500">
                    {dayjs(msg.created_at).tz("Africa/Johannesburg").format("MMM D, YYYY @ h:mm A")}{" "}
                    (SAST)
                  </p>

                  {isExpanded && msg.media_url && (
                    <div className="mt-3">
                      {isVideoUrl(msg.media_url) ? (
                        <video
                          src={msg.media_url}
                          controls
                          className="w-full rounded-md max-h-64 object-cover"
                        />
                      ) : (
                        <img
                          src={msg.media_url}
                          alt="Uploaded media"
                          className="w-full rounded-md max-h-64 object-cover"
                          onError={(e) => (e.target.style.display = "none")}
                        />
                      )}
                    </div>
                  )}

                  {msg.message.length > 120 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleExpand(msg.id);
                      }}
                      className="text-xs text-sage-700 hover:text-sage-900 underline mt-2"
                    >
                      {isExpanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
