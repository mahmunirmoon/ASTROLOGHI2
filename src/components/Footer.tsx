import { Link } from "react-router-dom";
import { Trash2, ShieldCheck } from "lucide-react";
import { useProfile } from "../context/ProfileContext";
import { APP_CONFIG } from "../lib/config";

const Footer = () => {
  const { hasProfile, clearBirthData, showToast } = useProfile();

  const onDelete = () => {
    clearBirthData();
    showToast("اطلاعات تولد شما از این مرورگر حذف شد.", "success");
  };

  return (
    <footer className="relative z-10 mt-24 border-t border-gold-500/10 bg-night-950/60">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-2xl text-gold-300">آستروپروفایل</p>
            <p className="mt-2 text-sm leading-7 text-ink-500">
              نقشه‌ی آسمان لحظه‌ی تولد شما — محاسبه‌شده با {APP_CONFIG.engineLabel}، زودیاک{" "}
              {APP_CONFIG.zodiacLabel} و سیستم خانه {APP_CONFIG.houseSystemLabel}.
            </p>
          </div>
          <div>
            <p className="text-sm font-bold text-ink-200">دسترسی سریع</p>
            <ul className="mt-3 space-y-2 text-sm text-ink-500">
              <li><Link className="transition-colors hover:text-gold-300" to="/wizard">محاسبه چارت تولد</Link></li>
              <li><Link className="transition-colors hover:text-gold-300" to="/compatibility">سازگاری دو نفر</Link></li>
              <li><Link className="transition-colors hover:text-gold-300" to="/profile">پروفایل آسمانی من</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-bold text-ink-200">حریم خصوصی</p>
            <p className="mt-3 flex items-start gap-2 text-sm leading-6 text-ink-500">
              <ShieldCheck className="mt-1 h-4 w-4 shrink-0 text-gold-400" />
              اطلاعات تولد فقط در صورت تمایل و تنها در مرورگر خودِ شما (localStorage) ذخیره می‌شود؛ هیچ داده‌ای به
              سروری فرستاده نمی‌شود و هر زمان قابل حذف است.
            </p>
            {hasProfile && (
              <button
                onClick={onDelete}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#e07a6f]/40 px-4 py-2 text-xs font-semibold text-[#f0a49b] transition-colors hover:bg-[#e07a6f]/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                حذف اطلاعات ذخیره‌شده
              </button>
            )}
          </div>
        </div>

        <div className="gold-line my-8" />

        <p className="mx-auto max-w-3xl text-center text-xs leading-6 text-ink-600">
          ⚠️ این اطلاعات جنبه سرگرمی و خودشناسی دارند و جایگزین مشاوره تخصصی پزشکی، مالی یا حقوقی نیستند. آسترولوژی یک
          زبان نمادین است، نه علم تجربی.
        </p>
        <p className="mt-3 text-center text-xs text-ink-600">
          AstroProfile AI — نسخه {APP_CONFIG.version} · محاسبات نجومی در مرورگر شما انجام می‌شود
        </p>
      </div>
    </footer>
  );
};

export default Footer;
