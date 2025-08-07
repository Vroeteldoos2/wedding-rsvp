import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { supabase } from "./supabaseClient";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import RSVPPage from "./pages/RSVPPage";
import DashboardPage from "./pages/DashboardPage";
import MediaUploadPage from "./pages/MediaUploadPage";
import WeddingAlbumPage from "./pages/WeddingAlbumPage";
import ViewRSVPPage from "./pages/ViewRSVPPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResetRequestPage from "./pages/ResetRequestPage";
import VenuePage from "./pages/VenuePage";
import SplashScreen from "./components/SplashScreen";
import LayoutWithNav from "./components/LayoutWithNav";
import { ProtectedRoute } from "./components/ProtectedRoute";

// ✅ New
import LeaveMessagePage from "./pages/LeaveMessagePage";
import MessageWallPage from "./pages/MessageWallPage";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setSession(data.session);
      setLoading(false);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/request-reset" element={<ResetRequestPage />} />

        {/* Protected Routes with Navbar */}
        <Route
          path="/rsvp"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <RSVPPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-rsvp"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <ViewRSVPPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <MediaUploadPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/album"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <WeddingAlbumPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/venue"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <VenuePage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requireSuperuser={true}>
              <LayoutWithNav>
                <DashboardPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />

        {/* ✅ New Message Pages */}
        <Route
          path="/leave-a-message"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <LeaveMessagePage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />
        <Route
          path="/message-wall"
          element={
            <ProtectedRoute>
              <LayoutWithNav>
                <MessageWallPage />
              </LayoutWithNav>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
