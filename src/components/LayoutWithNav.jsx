// src/components/LayoutWithNav.jsx
import NavigationBar from "./NavigationBar";

export default function LayoutWithNav({ children }) {
  return (
    <>
      <NavigationBar />
      <main className="null">{children}</main>
    </>
  );
}
