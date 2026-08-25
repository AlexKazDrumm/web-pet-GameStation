import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { type Page, expect, test } from '@playwright/test';

/**
 * Regenerates the screenshots used in the README.
 * Run against a seeded stack:  SCREENSHOTS=1 npx playwright test tests/screenshots.spec.ts
 */
const SHOTS = resolve(process.cwd(), '../../docs/screenshots');
const PASSWORD = process.env.SEED_PASSWORD ?? 'demo-password-123';
mkdirSync(SHOTS, { recursive: true });

async function login(page: Page, email: string): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill(PASSWORD);
  await page.locator('form').getByRole('button', { name: 'Войти' }).click();
  await expect(page.getByRole('button', { name: 'Выйти' })).toBeVisible();
}

test('capture README screenshots', async ({ page }) => {
  await login(page, 'nova@example.com');
  await page.screenshot({ path: `${SHOTS}/01-home.png`, fullPage: true });

  await page.goto('/games/tic-tac-toe');
  await page.getByLabel('Размер поля').selectOption('5');
  await page.getByRole('gridcell', { name: /Клетка 13: пусто/ }).click();
  await page.waitForTimeout(500);
  await page.getByRole('gridcell', { name: /Клетка 7: пусто/ }).click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${SHOTS}/02-tic-tac-toe.png`, fullPage: true });

  await page.goto('/games/rock-paper-scissors');
  await page.getByRole('button', { name: /Камень/ }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${SHOTS}/03-rock-paper-scissors.png`, fullPage: true });

  await page.goto('/leaderboard');
  await expect(page.getByRole('cell', { name: 'blitz' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/04-leaderboard.png`, fullPage: true });

  await page.goto('/reviews');
  await expect(page.getByText(/Большое поле реально затягивает/).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/05-reviews.png`, fullPage: true });

  await page.goto('/profile');
  await page.screenshot({ path: `${SHOTS}/06-profile.png`, fullPage: true });

  await page.goto('/messages');
  await expect(page.getByText(/сбросился прогресс/i)).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/07-messages.png`, fullPage: true });

  // Admin view
  await page.getByRole('button', { name: 'Выйти' }).click();
  await login(page, 'admin@gamestation.local');
  await page.goto('/admin');
  await expect(page.getByRole('cell', { name: 'nova@example.com' })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/08-admin.png`, fullPage: true });
});
