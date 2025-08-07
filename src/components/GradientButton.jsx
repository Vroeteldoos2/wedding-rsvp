export default function GradientButton({ type = "button", label, onClick }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="w-full bg-gradient-to-r from-sage-600 to-sea_green hover:opacity-90 text-white font-semibold py-2 px-4 rounded-md shadow transition"
    >
      {label}
    </button>
  );
}
