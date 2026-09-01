import { BookOpen, CircleHelp, Database, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HelpPage = () => {
  return (
    <div dir="rtl" className="mx-auto max-w-5xl px-4 pb-20 pt-28 sm:px-6">
      <section className="glass rounded-2xl p-6 sm:p-8">
        <div className="mb-8 text-center">
          <CircleHelp className="mx-auto h-10 w-10 text-gold-300" />
          <h1 className="font-display mt-3 text-3xl text-ink-50 sm:text-4xl">
            راهنمای آستروپروفایل
          </h1>
          <p className="mt-3 text-sm leading-7 text-ink-400">
            راهنمای کوتاه استفاده از برنامه، خروجی‌ها و منابع محاسبات
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <article className="rounded-xl border border-gold-500/20 bg-night-900/50 p-5">
            <Sparkles className="h-6 w-6 text-gold-300" />
            <h2 className="font-display mt-3 text-xl text-ink-50">
              این برنامه چه کار می‌کند؟
            </h2>
            <p className="mt-3 text-sm leading-7 text-ink-400">
              آستروپروفایل با دریافت اطلاعات تولد شما، موقعیت واقعی سیارات
              در لحظه تولد را محاسبه می‌کند و یک چارت تولد شخصی می‌سازد.
              سپس اطلاعاتی مانند خورشید، ماه، طالع، خانه‌ها، جنبه‌های سیارات،
              عنصر غالب، تحلیل شخصیتی، عددشناسی و سازگاری را نمایش می‌دهد.
            </p>
          </article>

          <article className="rounded-xl border border-mystic-500/20 bg-night-900/50 p-5">
            <BookOpen className="h-6 w-6 text-mystic-300" />
            <h2 className="font-display mt-3 text-xl text-ink-50">
              روش استفاده
            </h2>
            <ol className="mt-3 space-y-2 text-sm leading-7 text-ink-400">
              <li>۱. وارد بخش «چارت تولد» شوید.</li>
              <li>۲. نام و تاریخ تولد را وارد کنید.</li>
              <li>۳. ساعت تولد را در صورت اطلاع وارد کنید.</li>
              <li>۴. شهر محل تولد را انتخاب کنید.</li>
              <li>۵. روی «شروع تحلیل» بزنید.</li>
              <li>۶. نتایج و پروفایل شخصی خود را مشاهده کنید.</li>
            </ol>
          </article>

          <article className="rounded-xl border border-airx-500/20 bg-night-900/50 p-5">
            <CircleHelp className="h-6 w-6 text-airx-400" />
            <h2 className="font-display mt-3 text-xl text-ink-50">
              چه اطلاعاتی دریافت می‌کنید؟
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-7 text-ink-400">
              <li>• موقعیت خورشید، ماه و سیارات</li>
              <li>• برج خورشیدی، برج ماه و Ascendant</li>
              <li>• ۱۲ خانه آسترولوژی</li>
              <li>• جنبه‌های اصلی بین سیارات</li>
              <li>• عنصر و حالت غالب</li>
              <li>• تحلیل نمادین شخصیت</li>
              <li>• عددشناسی</li>
              <li>• بررسی سازگاری دو نفر</li>
            </ul>
          </article>

          <article className="rounded-xl border border-gold-500/20 bg-night-900/50 p-5">
            <Database className="h-6 w-6 text-gold-300" />
            <h2 className="font-display mt-3 text-xl text-ink-50">
              منابع و مبنای محاسبات
            </h2>
            <div className="mt-3 space-y-2 text-sm leading-7 text-ink-400">
              <p>
                <strong className="text-ink-200">Swiss Ephemeris:</strong>{" "}
                محاسبه موقعیت سیارات
              </p>
              <p>
                <strong className="text-ink-200">Moshier Ephemeris:</strong>{" "}
                داده‌های نجومی مورد استفاده در موتور محاسبات
              </p>
              <p>
                <strong className="text-ink-200">Tropical Zodiac:</strong>{" "}
                سیستم زودیاک استوایی
              </p>
              <p>
                <strong className="text-ink-200">Placidus:</strong>{" "}
                سیستم محاسبه خانه‌ها
              </p>
              <p>
                <strong className="text-ink-200">Open-Meteo Geocoding:</strong>{" "}
                جستجوی شهر و اطلاعات جغرافیایی
              </p>
            </div>
          </article>
        </div>

        <div className="mt-7 rounded-xl border border-mystic-500/20 bg-mystic-500/5 p-5 text-sm leading-7 text-ink-400">
          <strong className="text-ink-200">توجه:</strong>{" "}
          موقعیت‌های سیارات بر اساس محاسبات نجومی به‌دست می‌آیند؛
          اما تفسیرهای آسترولوژی و عددشناسی ماهیت نمادین و تفسیری دارند
          و جایگزین مشاوره پزشکی، روان‌شناختی، حقوقی یا مالی نیستند.
        </div>

        <div className="mt-7 text-center">
          <Link to="/wizard" className="btn-gold">
            <Sparkles className="h-4 w-4" />
            شروع تحلیل
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HelpPage;
