import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const WEDDING_DATE = new Date("2026-02-21T14:00:00+02:00");

function getCountdown(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return "🎊 It's the big day!";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

export default function VenuePage() {
  const [guestCount, setGuestCount] = useState(null);
  const [weather, setWeather] = useState(null);
  const [countdown, setCountdown] = useState(getCountdown(WEDDING_DATE));

  const latitude = -26.0587;
  const longitude = 28.0063;

  useEffect(() => {
    const fetchRSVPCount = async () => {
      const { count, error } = await supabase
        .from("rsvps")
        .select("*", { count: "exact", head: true })
        .eq("attending", true);

      if (!error) setGuestCount(count);
    };

    fetchRSVPCount();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = "42f91b13d76a4a3aa09165013250608";
      const response = await fetch(
        `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=1&aqi=no&alerts=no`
      );
      const data = await response.json();
      if (data?.current) {
        setWeather({
          temp: data.current.temp_c,
          condition: data.current.condition.text,
          icon: data.current.condition.icon,
        });
      }
    };

    fetchWeather();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdown(WEDDING_DATE));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen w-full text-gray-800">
      {/* Background */}
      <div
        className="absolute inset-0 bg-fixed bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://bghqkncxbdpmmqisbbgk.supabase.co/storage/v1/object/public/public-assets//background.jpg')",
        }}
      >
        <div className="absolute inset-0 bg-gray-900/70" />
      </div>

      <div className="relative z-10 px-4 py-8 sm:px-8 max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-white text-center">📍 Wedding Venue</h1>

        {/* Countdown Timer */}
        <div className="text-center text-white text-lg bg-white/20 rounded-lg py-3 px-4 font-semibold">
          ⏳ Countdown to the wedding: <span className="text-yellow-300">{countdown}</span>
        </div>

        {/* Weather + RSVP */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-white text-lg text-center">
          {guestCount !== null && (
            <p className="bg-white/20 px-4 py-2 rounded-md">
              🎉 Confirmed Guests: <strong>{guestCount}</strong>
            </p>
          )}
          {weather && (
            <p className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-md">
              <img src={weather.icon} alt="Weather" className="w-6 h-6" />
              {weather.temp}°C – {weather.condition}
            </p>
          )}
        </div>

        {/* Embedded Google Map */}
        <a
          href="https://www.google.com/maps/place/Chocolat+et+Caf%C3%A9/@-26.0587,28.0063,17z"
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full rounded-lg overflow-hidden shadow-md hover:opacity-90 transition"
        >
          <iframe
            title="Chocolat et Café Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3582.4186663099417!2d28.006305215029937!3d-26.058673783503507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e950b7c4643c6f1%3A0x4b457ffdf5ad93fc!2sChocolat+et+Caf%C3%A9!5e0!3m2!1sen!2sza!4v1691325637833!5m2!1sen!2sza"
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
            style={{ border: 0, pointerEvents: "none" }}
          />
        </a>

        {/* Get Directions Button */}
        <div className="text-center">
          <a
            href="https://www.google.com/maps/dir//383+Graham+Rd,+Shere,+0084"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-dark_green text-white px-6 py-3 rounded-lg font-semibold hover:bg-dark_green-700 transition"
          >
            📍 Get Directions
          </a>
        </div>

        {/* Venue Details */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-dark_green">🏠 Venue Details</h2>
          <p>
            <strong>Chocolat et Café</strong><br />
            383 Graham Rd, Shere, 0084
          </p>
          <p>
            <strong>Contact:</strong> +27 87 808 8413
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a
              href="https://www.chocolatetcafe.co.za/"
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.chocolatetcafe.co.za
            </a>
          </p>
          <p>
            <strong>Dress Code:</strong> Casual / Formal
          </p>
        </div>

        {/* Transport & Parking Map */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-3">
          <h2 className="text-2xl font-semibold text-dark_green">🅿️Transport & Parking</h2>
          <p className="text-sm text-gray-700 mt-2">
            Free parking is available on-site and overflow parking is 200m away with shuttle service.
          </p>
        </div>

        {/* FAQs & Accessibility */}
        <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
          <h2 className="text-2xl font-semibold text-dark_green">❓ FAQs & Accessibility</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>🅿️ Free parking available</li>
            <li>♿ Wheelchair accessible venue and restrooms</li>
            <li>👶 Child-friendly seating and entertainment</li>
            <li>🌱 Vegan / Vegetarian options will be served</li>
          </ul>
        </div>

        {/* Back to RSVP */}
        <div className="text-center">
          <a
            href="/rsvp"
            className="inline-block mt-4 bg-sea_green text-white px-6 py-3 rounded-lg font-semibold hover:bg-sea_green-700 transition"
          >
            ← Back to RSVP
          </a>
        </div>
      </div>
    </div>
  );
}
