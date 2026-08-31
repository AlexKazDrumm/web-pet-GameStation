import { expect, test } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/games/tic-tac-toe',
  '/games/rock-paper-scissors',
  '/leaderboard',
  '/reviews',
  '/login',
  '/register',
] as const;

test('public pages load cleanly without overflow or broken assets', async ({ page }) => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];
  const requestFailures: string[] = [];
  const errorResponses: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    requestFailures.push(`${request.method()} ${request.url()}`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      errorResponses.push(`${response.status()} ${response.url()}`);
    }
  });

  for (const route of PUBLIC_ROUTES) {
    await page.goto(route);
    await expect(page).toHaveTitle('GameStation');
    await expect(page.locator('main h1')).toBeVisible();

    const viewport = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(viewport.scrollWidth, `${route} has horizontal overflow`).toBeLessThanOrEqual(
      viewport.clientWidth,
    );

    const brokenImages = await page.locator('img').evaluateAll((images) =>
      images
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.getAttribute('src') ?? '(missing src)'),
    );
    expect(brokenImages, `${route} has broken images`).toEqual([]);
  }

  const favicon = await page.request.get('/favicon.svg');
  expect(favicon.ok()).toBe(true);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
  expect(errorResponses).toEqual([]);
});
