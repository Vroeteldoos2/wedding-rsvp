import React from "react";

export default function SplashScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-dark_green">
      <div className="text-center space-y-4 animate-pulse">
        <div className="text-4xl sm:text-5xl font-fancy">Josh & Martinique</div>
        <div className="text-xl sm:text-2xl font-medium">Preparing your RSVP experience 💍</div>
        <div className="text-sm text-gray-500">Just a moment...</div>
      </div>
    </div>
  );
}
