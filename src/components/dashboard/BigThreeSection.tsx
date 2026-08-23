import { Link } from "react-router-dom";
import { Sun, Moon, Sunrise } from "lucide-react";
import SectionHeading from "../SectionHeading";
import Reveal from "../Reveal";
import { bigThreeCards } from "../../lib/chartAnalysis";
import { SIGN_BY_KEY, ELEMENT_FA } from "../../data/zodiac";
import type { AstrologyProfile } from "../../types";

const ICONS = { sun: Sun, moon: Moon, rising: Sunrise } as const;
const ACCENTS = { sun: "#e6c56a", moon: "#b3a7e8", rising: "#7cc7d8" } as const;

const BigThreeSection = ({ profile }: { profile: AstrologyProfile }) => {
  const cards = bigThreeCards(profile);

  return (
    <section className="mt-24">
      <Reveal>
        <SectionHeading
          kicker="THE BIG THREE"
          title="سه‌گانه اصلی شما"
          subtitle="خورشید، ماه و طالع — سه ستونِ شخصیت در آسترولوژی: آنچه هستید، آنچه حس می‌کنید، و آنچه دنیا می‌بیند."
        />
      </Reveal>
      <div className="grid gap-6 lg:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = ICONS[card.id];
          const accent = ACCENTS[card.id];
          const sign = SIGN_BY_KEY[card.sign];
          const dim = !card.available;
          return (
            <Reveal key={card.id} delay={i * 140}>
              <article
                className={`glass relative h-full overflow-hidden rounded-xl p-7 transition-all duration-300 hover:-translate-y-1 ${dim ? "opacity-75" : ""}`}
                style={{ borderColor: `${accent}30` }}
              >
                <span className="glyph absolute -bottom-6 -left-4 text-[130px] leading-none opacity-[0.05]" style={{ color: accent }}>
                  {sign.glyph}
                </span>
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full border"
                    style={{ color: accent, borderColor: `${accent}50`, background: `${accent}12` }}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="text-left">
                    <span className="font-display block text-2xl" style={{ color: accent }}>
                      {sign.fa.split(" ")[0]} {sign.glyph}
                    </span>
                    <span className="font-latin block text-[10px] tracking-[0.25em] text-ink-600">{sign.en.toUpperCase()}</span>
                  </span>
                </div>
                <h3 className="font-display mt-5 text-xl text-ink-50">
                  {card.titleFa}
                  <span className="font-latin ms-2 text-[10px] font-normal tracking-[0.25em] text-ink-600">{card.en.toUpperCase()}</span>
                </h3>
                <p className="mt-1 text-xs font-semibold" style={{ color: accent }}>{card.meaningFa}</p>
                <p className="mt-4 text-sm leading-7 text-ink-300">{card.text}</p>
                <div className="mt-5 rounded-lg border-r-2 bg-night-900/50 p-3.5 text-xs leading-6 text-ink-400" style={{ borderColor: accent }}>
                  <span className="mb-1 block text-[10px] font-bold tracking-wider" style={{ color: accent }}>
                    تعامل با دیگر اجزای سه‌گانه
                  </span>
                  {card.interaction}
                </div>
                <p className="mt-3 text-[11px] text-ink-600">
                  عنصر: {ELEMENT_FA[sign.element].label} {ELEMENT_FA[sign.element].glyph} · حالت: {sign.modality === "cardinal" ? "آغازگر" : sign.modality === "fixed" ? "ثابت" : "تغییرپذیر"}
                </p>
                {dim && (
                  <Link to="/wizard" className="btn-ghost mt-4 w-full !py-2 text-xs">
                    افزودن ساعت تولد برای تکمیل طالع
                  </Link>
                )}
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
};

export default BigThreeSection;
