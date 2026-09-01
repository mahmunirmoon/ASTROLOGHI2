import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/** Scroll-reveal wrapper — fades content up when it enters the viewport. */
const Reveal = ({ children, delay = 0, className = "" }: RevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(26px)",
        transition: `opacity 0.75s cubic-bezier(0.22,0.9,0.35,1) ${delay}ms, transform 0.75s cubic-bezier(0.22,0.9,0.35,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default Reveal;
