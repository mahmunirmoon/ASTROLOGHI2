import { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProfileProvider, useProfile } from "./context/ProfileContext";
import Starfield from "./components/Starfield";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import WizardPage from "./pages/WizardPage";
import DashboardPage from "./pages/DashboardPage";
import CompatibilityPage from "./pages/CompatibilityPage";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
};

const Toast = () => {
  const { toast } = useProfile();
  if (!toast) return null;
  const tone =
    toast.tone === "success"
      ? "border-gold-500/50 text-gold-200"
      : toast.tone === "error"
        ? "border-[#e07a6f]/50 text-[#f0a49b]"
        : "border-mystic-500/50 text-mystic-200";
  return (
    <div
      role="status"
      aria-live="polite"
      className={`animate-fade-up fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border bg-night-850/95 px-6 py-3 text-sm shadow-2xl backdrop-blur-xl ${tone}`}
    >
      {toast.message}
    </div>
  );
};

const App = () => (
  <ProfileProvider>
    <HashRouter>
      <ScrollToTop />
      <Starfield />
      <div className="relative flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wizard" element={<WizardPage />} />
            <Route path="/profile" element={<DashboardPage />} />
            <Route path="/compatibility" element={<CompatibilityPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toast />
    </HashRouter>
  </ProfileProvider>
);

export default App;
