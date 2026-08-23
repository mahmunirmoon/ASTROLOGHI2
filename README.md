# ASTROLOGHI2
پروفایل آسمانی فارسی

## استقرار روی GitHub Pages

سایت: https://mahmunirmoon.github.io/ASTROLOGHI2/

### روش خودکار (پیشنهادی — GitHub Actions)

فایل `.github/workflows/deploy.yml` با هر push به `main` به‌صورت خودکار build و deploy می‌کند.

تنظیم یک‌باره در ریپازیتوری:

1. به **Settings → Pages** بروید.
2. در بخش **Build and deployment** گزینه‌ی **Source** را روی **GitHub Actions** بگذارید.
3. تمام — هر push به `main` سایت را به‌روزرسانی می‌کند.

### روش دستی (branch ‏`gh-pages`)

```bash
npm run build
npx gh-pages -d dist
```

### چرا صفحه سفید می‌شد؟

`base` در `vite.config.js` روی مسیر مطلق `/ASTROLOGHI2/` بود؛ در این حالت اگر build از مسیر دیگری serve شود، همه‌ی assetها 404 می‌شوند و صفحه سفید بالا می‌آید. اکنون `base` نسبی (`"./"`) است:

- زیر `https://mahmunirmoon.github.io/ASTROLOGHI2/` همه‌ی CSS/JS/WASM درست resolve می‌شوند.
- preview لوکال و هر مسیر دیگری هم کار می‌کند.
- روتر از نوع `HashRouter` است و نیازی به `404.html` ندارد.
