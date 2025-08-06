import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const CLIENT_ID = "679999598965-e8ov4d4u4aemucn8bdn2taa0ls0qjjam.apps.googleusercontent.com";
const DEVELOPER_KEY = "AIzaSyCPM6S6EvnAJ5vAaEdqGBYLtex6tSdko98";
const PHOTO_FOLDER_ID = "1kP1oy-7ghvmLCB9fa9ygwK71AwKO9ySe";
const VIDEO_FOLDER_ID = "14QpFFSiLIowWGesmhM2H_iSujtwVE1W2";

export default function MediaUploadPage() {
  const tokenClientRef = useRef(null);
  const accessTokenRef = useRef(null);
  const [pickerReady, setPickerReady] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [uploaderName, setUploaderName] = useState("Guest");

  useEffect(() => {
    const loadScripts = () => {
      const gsiScript = document.createElement("script");
      gsiScript.src = "https://accounts.google.com/gsi/client";
      gsiScript.async = true;
      gsiScript.defer = true;
      document.body.appendChild(gsiScript);

      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.async = true;
      gapiScript.defer = true;
      gapiScript.onload = () => {
        window.gapi.load("client:picker", () => {
          initTokenClient();
          setPickerReady(true);
        });
      };
      document.body.appendChild(gapiScript);
    };

    const initTokenClient = () => {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file openid email profile",
        callback: async (tokenResponse) => {
          accessTokenRef.current = tokenResponse.access_token;

          // Fetch user info from Google
          const userInfo = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
              Authorization: `Bearer ${accessTokenRef.current}`,
            },
          });
          const user = await userInfo.json();
          const displayName = user.name || "Guest";
          const cleanedName = displayName.replace(/\s+/g, "");
          setUploaderName(cleanedName);

          openPicker(uploadType, cleanedName);
        },
      });
    };

    loadScripts();
  }, [uploadType]);

  const openPicker = (type, uploader) => {
    if (!accessTokenRef.current || !window.google?.picker) {
      toast.error("Google Picker not ready yet.");
      return;
    }

    const folderId = type === "video" ? VIDEO_FOLDER_ID : PHOTO_FOLDER_ID;

    const view = new window.google.picker.DocsUploadView()
      .setIncludeFolders(false)
      .setParent(folderId);

    const picker = new window.google.picker.PickerBuilder()
      .addView(view)
      .enableFeature(window.google.picker.Feature.MULTISELECT_ENABLED)
      .setOAuthToken(accessTokenRef.current)
      .setDeveloperKey(DEVELOPER_KEY)
      .setCallback(async (data) => {
        if (data.action === "picked") {
          const total = data.docs.length;
          toast.success(`✅ Uploaded ${total} file${total > 1 ? "s" : ""}`);

          const renameTasks = data.docs.map(async (doc) => {
            const newTitle = `${uploader}_${doc.name}`;
            return fetch(`https://www.googleapis.com/drive/v3/files/${doc.id}`, {
              method: "PATCH",
              headers: {
                Authorization: `Bearer ${accessTokenRef.current}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ name: newTitle }),
            });
          });

          await Promise.all(renameTasks);
          toast.success("🎉 All files renamed!");
        } else if (data.action === "cancel") {
          toast("Upload cancelled.");
        }
      })
      .setOrigin(window.location.protocol + "//" + window.location.host)
      .build();

    picker.setVisible(true);
  };

  const handleUpload = (type) => {
    setUploadType(type);
    if (tokenClientRef.current && pickerReady) {
      tokenClientRef.current.requestAccessToken();
    } else {
      toast.error("Google Picker not ready yet. Please wait...");
    }
  };

  return (
    <div
      className="relative min-h-screen w-full text-white"
      style={{
        backgroundImage:
          "url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-gray-900/70" />

      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="bg-white/90 text-dark_green backdrop-blur-md p-8 rounded-2xl shadow-2xl w-full max-w-xl space-y-6 text-center">
          <h2 className="text-3xl font-bold">📤 Upload Your Wedding Media</h2>
          <p className="text-sm text-gray-700">
            Upload multiple photos or videos. Files will be renamed to include your name and appear in the album.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => handleUpload("photo")}
              disabled={!pickerReady}
              className={`py-3 rounded font-semibold ${
                pickerReady
                  ? "bg-sea_green text-white hover:bg-sea_green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              📸 Upload Photos
            </button>

            <button
              onClick={() => handleUpload("video")}
              disabled={!pickerReady}
              className={`py-3 rounded font-semibold ${
                pickerReady
                  ? "bg-dark_green text-white hover:bg-dark_green-700"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              🎥 Upload Videos
            </button>
          </div>

          <p className="text-xs text-gray-500">
            You’ll be asked to log in with Google. Your name will be tagged to each file.
          </p>
        </div>
      </div>
    </div>
  );
}
