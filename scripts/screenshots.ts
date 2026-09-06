/**
 * Capture les captures d'écran publiques utilisées dans le README.
 *
 *   pnpm tsx scripts/screenshots.ts
 *   BASE_URL=http://localhost:3000 ARTISAN_SLUG=demo-artisan pnpm tsx scripts/screenshots.ts
 *
 * Les pages derrière authentification (dashboard, console admin) ne sont pas
 * couvertes ici — elles sont ajoutées manuellement dans docs/screenshots/.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Page } from "@playwright/test";

const BASE_URL = process.env.BASE_URL ?? "https://www.traballo.pro";
const ARTISAN_URL =
  process.env.ARTISAN_URL ??
  (process.env.ARTISAN_SLUG
    ? `https://${process.env.ARTISAN_SLUG}.traballo.pro`
    : null);

const OUT = path.join(process.cwd(), "docs", "screenshots");
const VIEWPORT = { width: 1440, height: 900 };

type Shot = { name: string; url: string; themes: ("light" | "dark")[]; fullPage?: boolean };

// Le site vitrine est en thème clair uniquement.
const SHOTS: Shot[] = [
  { name: "landing", url: `${BASE_URL}/`, themes: ["light"] },
  { name: "fonctionnalites", url: `${BASE_URL}/fonctionnalites`, themes: ["light"] },
  { name: "tarifs", url: `${BASE_URL}/tarifs`, themes: ["light"] },
];

async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(() => document.fonts?.ready).catch(() => {});
  await page.waitForTimeout(600);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch();

  const shots = [...SHOTS];
  if (ARTISAN_URL) {
    shots.push({ name: "site-artisan", url: ARTISAN_URL, themes: ["light"] });
  }

  for (const shot of shots) {
    for (const theme of shot.themes) {
      const context = await browser.newContext({
        viewport: VIEWPORT,
        deviceScaleFactor: 1,
        colorScheme: theme,
      });
      const page = await context.newPage();
      try {
        await page.goto(shot.url, { waitUntil: "domcontentloaded", timeout: 30_000 });
        await settle(page);
        const suffix = shot.themes.length > 1 ? `-${theme}` : "";
        const file = path.join(OUT, `${shot.name}${suffix}.png`);
        await page.screenshot({ path: file, fullPage: shot.fullPage ?? false });
        console.log(`✓ ${path.relative(process.cwd(), file)}`);
      } catch (err) {
        console.warn(`✗ ${shot.name} (${theme}) — ${(err as Error).message}`);
      } finally {
        await context.close();
      }
    }
  }

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
