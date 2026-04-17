/**
 * Check all pages and take screenshots
 */
import { chromium } from '@playwright/test';

const pages = [
  { name: 'Landing', url: 'https://traballo.pro' },
  { name: 'App Dashboard (should redirect to signin)', url: 'https://app.traballo.pro/dashboard' },
  { name: 'Signin', url: 'https://app.traballo.pro/auth/signin' },
  { name: 'Signup', url: 'https://app.traballo.pro/auth/signup' },
  { name: 'Admin', url: 'https://admin.traballo.pro' },
];

async function checkPages() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  console.log('\n=== Checking Pages ===\n');

  for (const pageInfo of pages) {
    console.log(`\nChecking: ${pageInfo.name}`);
    console.log(`URL: ${pageInfo.url}`);

    try {
      const response = await page.goto(pageInfo.url, {
        waitUntil: 'networkidle',
        timeout: 30000
      });

      console.log(`  Status: ${response?.status()}`);
      console.log(`  Final URL: ${page.url()}`);

      // Check if CSS loaded
      const stylesheets = await page.$$eval('link[rel="stylesheet"]', links =>
        links.map(link => ({ href: (link as HTMLLinkElement).href, loaded: true }))
      );
      console.log(`  Stylesheets: ${stylesheets.length} loaded`);

      // Take screenshot
      const filename = `screenshots/${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}.png`;
      await page.screenshot({ path: filename, fullPage: false });
      console.log(`  Screenshot: ${filename}`);

      // Check for visible text
      const bodyText = await page.textContent('body');
      console.log(`  Content length: ${bodyText?.length || 0} chars`);

      // Check for errors
      const errors = await page.evaluate(() => {
        const errorEl = document.querySelector('[class*="error"]');
        return errorEl ? errorEl.textContent : null;
      });
      if (errors) {
        console.log(`  ⚠️  Error found: ${errors}`);
      }

    } catch (error) {
      console.log(`  ❌ Error: ${error}`);
    }
  }

  await browser.close();
  console.log('\n=== Check Complete ===\n');
}

checkPages().catch(console.error);
