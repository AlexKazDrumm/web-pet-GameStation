import { expect, test } from '@playwright/test';

test('player can register, win a tic-tac-toe game and see it on the leaderboard', async ({ page }) => {
  const stamp = Date.now();
  const email = `smoke.${stamp}@example.com`;
  const password = 'smoke-secret-123';
  const handle = `smoke.${stamp}`;

  await page.goto('/register');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Пароль').fill(password);
  await page.getByRole('button', { name: 'Создать аккаунт' }).click();
  await expect(page.getByRole('heading', { name: 'GameStation' })).toBeVisible();

  await page.goto('/games/tic-tac-toe');
  await page.getByLabel('Размер поля').selectOption('8');
  await page.getByLabel(/Умный соперник/).uncheck();

  for (const cell of [1, 2, 3]) {
    await page.getByRole('gridcell', { name: new RegExp(`Клетка ${cell}: пусто`) }).click();
  }
  await expect(page.getByText('Вы выиграли партию!')).toBeVisible();
  await expect(page.getByText('Победа засчитана в статистику.')).toBeVisible();

  await page.goto('/profile');
  const tttRow = page.getByRole('row', { name: /Крестики-нолики/ });
  await expect(tttRow.getByRole('cell', { name: '1' })).toBeVisible();

  await page.goto('/leaderboard');
  await expect(page.getByRole('cell', { name: handle })).toBeVisible();

  await page.goto('/games/rock-paper-scissors');
  await page.getByRole('button', { name: /Камень/ }).click();
  await expect(page.getByText(/Вы: \d/)).toBeVisible();
});
