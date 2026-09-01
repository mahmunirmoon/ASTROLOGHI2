import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Sparkles } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import MusicPlayer from "./MusicPlayer";

const StarMark = () => (
  <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
    <defs>
      <linearGradient id="starGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f0d98f" />
        <stop offset="100%" stopColor="#b3902c" />
      </linearGradient>
    </defs>
    <path d="M20 2 24.5 15.5 38 20 24.5 24.5 20 38 15.5 24.5 2 20 15.5 15.5Z" fill="url(#starGrad)" />
    <circle cx="20" cy="20" r="3.4" fill="#060a1f" />
  </svg>
);

const Header = () => {
  const [open, setOpen] = useState(false);
  const { hasProfile } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  /* «درباره من» — smooth-scroll to the creator section on the home page */
  const goAbout = () => {
    setOpen(false);
    if (location.pathname === "/") {
      document.getElementById("about-creator")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/", { state: { scrollTo: "about-creator" } });
    }
  };

  const links = [
    { to: "/", label: "خانه" },
    { to: "/wizard", label: "چارت تولد" },
    ...(hasProfile ? [{ to: "/profile", label: "پروفایل من" }] : []),
    { to: "/compatibility", label: "سازگاری" },
    { to: "/help", label: "راهنما" },
  ];

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? "text-gold-300" : "text-ink-400 hover:text-ink-50"
    }`;

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-gold-500/10 bg-night-950/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <StarMark />
          <span className="leading-tight">
            <span className="block font-display text-xl text-gold-300">آستروپروفایل</span>
            <span className="font-latin block text-[10px] tracking-[0.3em] text-ink-500">ASTROPROFILE AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} className={navCls} end={l.to === "/"}>
              {l.label}
            </NavLink>
          ))}
          <button
            onClick={goAbout}
            className="rounded-md px-3 py-2 text-sm font-medium text-ink-400 transition-colors hover:text-ink-50"
          >
            درباره من
          </button>
          <MusicPlayer />
          <Link to="/wizard" className="btn-gold !px-4 !py-2 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            شروع تحلیل
          </Link>
        </nav>

        <button
          className="rounded-lg border border-mystic-600/40 p-2 text-ink-200 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "بستن منو" : "باز کردن منو"}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav
          className="border-t border-mystic-600/20 bg-night-900/95 px-4 py-4 backdrop-blur-xl md:hidden"
          aria-label="ناوبری موبایل"
        >
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `rounded-lg px-4 py-3 text-sm font-medium ${
                    isActive ? "bg-night-800 text-gold-300" : "text-ink-200"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <button
              onClick={goAbout}
              className="rounded-lg px-4 py-3 text-right text-sm font-medium text-ink-200 transition-colors hover:bg-night-800"
            >
              درباره من
            </button>
            <MusicPlayer mobile />
            <Link
              to="/wizard"
              className="btn-gold mt-2"
              onClick={() => setOpen(false)}
            >
              <Sparkles className="h-4 w-4" />
              شروع تحلیل
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
