interface SectionHeadingProps {
  kicker: string; // small Latin kicker
  title: string; // Persian display title
  subtitle?: string;
}

const SectionHeading = ({ kicker, title, subtitle }: SectionHeadingProps) => (
  <div className="mb-8">
    <p className="font-latin text-[11px] font-semibold tracking-[0.42em] text-gold-500/80">{kicker}</p>
    <h2 className="font-display mt-2 text-3xl leading-tight text-ink-50 sm:text-4xl">{title}</h2>
    <div className="gold-line mt-4 w-24" />
    {subtitle && <p className="mt-4 max-w-2xl text-sm leading-7 text-ink-400">{subtitle}</p>}
  </div>
);

export default SectionHeading;
