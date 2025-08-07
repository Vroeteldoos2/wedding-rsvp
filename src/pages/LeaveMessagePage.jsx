import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { notifySuccess, notifyError } from "../context/ToastContext";
import confetti from "canvas-confetti";
import { FaPhotoVideo } from "react-icons/fa";

const GOOGLE_CLIENT_ID = "679999598965-e8ov4d4u4aemucn8bdn2taa0ls0qjjam.apps.googleusercontent.com";
const GOOGLE_API_KEY = "AIzaSyCPM6S6EvnAJ5vAaEdqGBYLtex6tSdko98";
const GOOGLE_FOLDER_ID = "1EzWfmdCYAeIJIiRfOFLpT-j3X6H8k6Bw";

export default function LeaveMessagePage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadScripts = async () => {
      const gisScript = document.createElement("script");
      gisScript.src = "https://accounts.google.com/gsi/client";
      document.body.appendChild(gisScript);

      const pickerScript = document.createElement("script");
      pickerScript.src = "https://apis.google.com/js/api.js";
      pickerScript.onload = () => {
        window.gapi.load("picker", () => {});
      };
      document.body.appendChild(pickerScript);
    };

    loadScripts();
  }, []);

  const handleMediaUpload = () => {
    setUploading(true);

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: "https://www.googleapis.com/auth/drive.file",
      callback: (tokenResponse) => {
        const oauthToken = tokenResponse.access_token;

        const view = new window.google.picker.DocsUploadView().setParent(GOOGLE_FOLDER_ID);

        const picker = new window.google.picker.PickerBuilder()
          .setAppId("679999598965")
          .setOAuthToken(oauthToken)
          .addView(view)
          .setDeveloperKey(GOOGLE_API_KEY)
          .setCallback((data) => {
            if (data.action === window.google.picker.Action.PICKED) {
              const file = data.docs[0];
              const fileId = file.id;
              const previewUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
              setMediaUrl(previewUrl);
              notifySuccess("Media uploaded!");
            }
            setUploading(false);
          })
          .build();

        picker.setVisible(true);
      },
    });

    tokenClient.requestAccessToken();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      notifyError("Message cannot be empty.");
      return;
    }

    const user = (await supabase.auth.getUser())?.data?.user;

    const { error } = await supabase.from("guest_messages").insert([
      {
        user_id: user?.id || null,
        name: name || null,
        message,
        media_url: mediaUrl || null,
        is_public: isPublic,
        approved: true,
      },
    ]);

    if (error) {
      console.error(error);
      notifyError("Something went wrong.");
    } else {
      notifySuccess("Message submitted successfully!");
      confetti();
      setMessage("");
      setName("");
      setMediaUrl("");
      setIsPublic(true);
    }
  };

  return (
    <div className="min-h-screen bg-[url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0"></div>
      <div className="relative z-10 p-4 flex items-center justify-center">
        <div className="w-full max-w-xl space-y-6 bg-white/90 rounded-2xl shadow-xl p-6 border border-gray-300 mt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <h2 className="text-2xl font-bold text-center text-sage-700">✍️ Share Your Message</h2>
            <p className="text-sm text-center text-gray-500">Your message will appear on the Message Wall right away.</p>

            <input
              type="text"
              placeholder="Your Name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage-400"
            />

            <textarea
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              required
              className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-sage-400 resize-none"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleMediaUpload}
                disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 bg-sage-600 hover:bg-sage-700 text-black rounded-md shadow"
              >
                <FaPhotoVideo />
                {uploading ? "Uploading..." : "Upload Image/Video"}
              </button>
              {mediaUrl && (
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-sage-700 underline"
                >
                  View Uploaded Media
                </a>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-gray-700 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={() => setIsPublic(!isPublic)}
                  className="form-checkbox h-4 w-4 text-sage-600"
                />
                Make this message public
              </label>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-sage-700 hover:bg-sage-800 text-black rounded-md shadow text-lg font-semibold"
            >
              💌 Send Message
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => navigate("/message-wall")}
              className="text-sm text-sage-700 underline hover:text-sage-900 transition"
            >
              👀 Back to Message Wall
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
