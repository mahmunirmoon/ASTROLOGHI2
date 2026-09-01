import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, RotateCcw, Search } from "lucide-react";
import { searchCities } from "../lib/geo";
import { APP_CONFIG } from "../lib/config";
import type { BirthLocation } from "../types";

interface CitySearchProps {
  id: string;
  value: BirthLocation | null;
  onChange: (loc: BirthLocation | null) => void;
  placeholder?: string;
}

/** Reusable city autocomplete with Open-Meteo geocoding + offline fallback. */
const CitySearch = ({ id, value, onChange, placeholder = "جستجوی شهر... (تهران، Dubai، Tokyo)" }: CitySearchProps) => {
  const [query, setQuery] = useState(
    value ? `${value.nameFa ?? value.name}، ${value.country}` : "",
  );
  const [results, setResults] = useState<BirthLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const seq = useRef(0);

  useEffect(() => {
    if (value) setQuery(`${value.nameFa ?? value.name}، ${value.country}`);
  }, [value]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const s = ++seq.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchCities(q);
      if (s === seq.current) {
        setResults(r);
        setLoading(false);
      }
    }, APP_CONFIG.geo.debounceMs);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-600" />
        <input
          id={id}
          className="field !pr-10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            onChange(null);
          }}
          placeholder={placeholder}
          autoComplete="off"
        />
        {loading && <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-mystic-300" />}
      </div>

      {results.length > 0 && (
        <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-mystic-600/30 bg-night-850 shadow-2xl" role="listbox">
          {results.map((c, i) => (
            <li key={`${c.name}-${c.latitude}-${i}`}>
              <button
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-sm transition-colors hover:bg-gold-500/10"
                onClick={() => {
                  onChange(c);
                  setResults([]);
                }}
              >
                <span className="flex items-center gap-2 text-ink-50">
                  <MapPin className="h-4 w-4 shrink-0 text-gold-400" />
                  {c.nameFa ? `${c.nameFa} (${c.name})` : c.name}
                  <span className="text-xs text-ink-500">— {c.country}</span>
                </span>
                <span className="font-latin text-[10px] tracking-wider text-ink-600" dir="ltr">{c.timezone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {value && (
        <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-gold-500/30 bg-gold-500/5 px-3 py-2">
          <p className="text-[11px] leading-5 text-ink-300">
            <span className="font-semibold text-gold-300">{value.nameFa ?? value.name}</span> · {value.country} ·{" "}
            <span dir="ltr" className="font-latin text-[10px]">{value.timezone}</span>
          </p>
          <button
            className="flex items-center gap-1 text-[11px] text-ink-500 hover:text-gold-300"
            onClick={() => {
              onChange(null);
              setQuery("");
            }}
            aria-label="پاک کردن شهر انتخابی"
          >
            <RotateCcw className="h-3 w-3" />
            تغییر
          </button>
        </div>
      )}
    </div>
  );
};

export default CitySearch;
