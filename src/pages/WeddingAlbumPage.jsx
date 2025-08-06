import { useEffect, useState } from "react";

const API_KEY = "AIzaSyCPM6S6EvnAJ5vAaEdqGBYLtex6tSdko98";
const PHOTO_FOLDER_ID = "1kP1oy-7ghvmLCB9fa9ygwK71AwKO9ySe";
const VIDEO_FOLDER_ID = "14QpFFSiLIowWGesmhM2H_iSujtwVE1W2";
const ITEMS_PER_PAGE = 9;

export default function WeddingAlbumPage() {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [previewIndex, setPreviewIndex] = useState(null);
  const [loadedCount, setLoadedCount] = useState(ITEMS_PER_PAGE);

  const fetchDriveFiles = async (folderId, type) => {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${API_KEY}&fields=files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,createdTime)`
    );
    const data = await res.json();
    if (!data?.files) return [];

    return data.files.map((file) => {
      let guestName = "Guest";
      if (file.name.includes("_")) {
        const prefix = file.name.split("_")[0];
        if (prefix && prefix.length < 30 && /^[a-zA-Z]+$/.test(prefix)) {
          guestName = prefix;
        }
      }

      return {
        id: file.id,
        name: file.name,
        type,
        mimeType: file.mimeType,
        thumbnail: file.thumbnailLink,
        preview: file.webViewLink,
        download: file.webContentLink,
        createdAt: file.createdTime,
        guest: guestName,
      };
    });
  };

  useEffect(() => {
    const loadMedia = async () => {
      const photoFiles = await fetchDriveFiles(PHOTO_FOLDER_ID, "photo");
      const videoFiles = await fetchDriveFiles(VIDEO_FOLDER_ID, "video");

      const sortedPhotos = photoFiles.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      const sortedVideos = videoFiles.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setPhotos(sortedPhotos);
      setVideos(sortedVideos);
    };

    loadMedia();
  }, []);

  const allMedia = [...photos, ...videos];
  const filteredMedia =
    filter === "all"
      ? allMedia
      : allMedia.filter((item) => item.type === filter);

  const visibleMedia = filteredMedia.slice(0, loadedCount);

  // Group media by date
  const groupedByDate = visibleMedia.reduce((acc, item) => {
    const date = new Date(item.createdAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  const currentPreview = previewIndex !== null ? visibleMedia[previewIndex] : null;

  const goNext = () => {
    setPreviewIndex((prev) => (prev + 1) % visibleMedia.length);
  };

  const goPrev = () => {
    setPreviewIndex((prev) =>
      (prev - 1 + visibleMedia.length) % visibleMedia.length
    );
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (previewIndex === null) return;
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "Escape") setPreviewIndex(null);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [previewIndex, visibleMedia.length]);

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

      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center text-white">
          Wedding Album
        </h1>

        <div className="flex justify-center gap-4 mb-8">
          {["all", "photo", "video"].map((f) => (
            <button
              key={f}
              className={`px-4 py-2 rounded ${
                filter === f
                  ? "bg-sea_green text-white"
                  : "bg-white text-dark_green border"
              }`}
              onClick={() => {
                setFilter(f);
                setPreviewIndex(null);
                setLoadedCount(ITEMS_PER_PAGE);
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {visibleMedia.length === 0 ? (
          <p className="text-center text-white">No media uploaded yet.</p>
        ) : (
          Object.entries(groupedByDate).map(([date, items]) => (
            <div key={date} className="mb-10">
              <h2 className="text-xl font-semibold text-white mb-4 border-b border-white/20 pb-1">
                {date}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-xl p-4 shadow-md flex flex-col hover:scale-[1.01] transition"
                  >
                    <p className="text-xs font-semibold text-gray-600 mb-1 truncate">
                      {item.name}
                    </p>

                    {item.type === "photo" ? (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="w-full h-48 object-cover rounded-lg mb-2 border cursor-pointer"
                        onClick={() => setPreviewIndex(index)}
                        onError={(e) =>
                          (e.target.src =
                            "https://via.placeholder.com/300x200?text=No+Preview")
                        }
                      />
                    ) : (
                      <div
                        className="cursor-pointer"
                        onClick={() => setPreviewIndex(index)}
                      >
                        <iframe
                          src={`https://drive.google.com/file/d/${item.id}/preview`}
                          title={item.name}
                          className="w-full h-48 rounded-lg mb-2"
                          allow="autoplay"
                          allowFullScreen
                        />
                      </div>
                    )}

                    <div className="text-xs text-gray-700 italic mb-1">
                      Uploaded by: {item.guest}
                    </div>

                    <div className="mt-auto flex justify-between text-sm text-sea_green font-medium">
                      <a
                        href={item.download || item.preview}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        Download
                      </a>
                      <a
                        href={item.preview}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-blue-600"
                      >
                        View
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}

        {visibleMedia.length < filteredMedia.length && (
          <div className="text-center mt-8">
            <button
              onClick={() => setLoadedCount((prev) => prev + ITEMS_PER_PAGE)}
              className="bg-white text-dark_green px-6 py-2 rounded hover:bg-gray-200 font-semibold"
            >
              Load More
            </button>
          </div>
        )}

        {/* Lightbox Modal */}
        {currentPreview && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-4 max-w-4xl w-full shadow-lg relative flex flex-col items-center">
              <button
                onClick={() => setPreviewIndex(null)}
                className="absolute top-2 right-3 text-gray-800 hover:text-red-600 text-xl font-bold"
              >
                ×
              </button>

              <div className="flex justify-between w-full mb-4">
                <button
                  onClick={goPrev}
                  className="text-dark_green font-bold text-2xl hover:text-sea_green"
                >
                  ←
                </button>
                <h3 className="text-md text-dark_green font-semibold truncate">
                  {currentPreview.name}
                </h3>
                <button
                  onClick={goNext}
                  className="text-dark_green font-bold text-2xl hover:text-sea_green"
                >
                  →
                </button>
              </div>

              {currentPreview.type === "photo" ? (
                <img
                  src={`https://drive.google.com/uc?export=view&id=${currentPreview.id}`}
                  alt={currentPreview.name}
                  className="w-full max-h-[70vh] object-contain"
                />
              ) : (
                <iframe
                  src={`https://drive.google.com/file/d/${currentPreview.id}/preview`}
                  title={currentPreview.name}
                  allow="autoplay"
                  allowFullScreen
                  className="w-full h-[70vh] rounded-lg"
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
