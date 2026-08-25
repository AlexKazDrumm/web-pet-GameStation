import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { LeaderboardResponse } from '@gamestation/shared';
import { renderWithProviders } from '../../test/utils';
import { LeaderboardPage } from './LeaderboardPage';

const leaderboard = vi.fn();

vi.mock('../../api/endpoints', () => ({
  scoresApi: {
    leaderboard: (...args: unknown[]) => leaderboard(...args),
  },
}));

afterEach(() => {
  leaderboard.mockReset();
});

const sample: LeaderboardResponse = {
  game: 'TIC_TAC_TOE',
  entries: [
    { rank: 1, name: 'nova', wins: 7 },
    { rank: 2, name: 'pixel', wins: 3 },
  ],
};

describe('LeaderboardPage', () => {
  it('shows a loading state then the ranked table', async () => {
    leaderboard.mockResolvedValueOnce(sample);
    renderWithProviders(<LeaderboardPage />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(await screen.findByText('nova')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders an empty state when there are no entries', async () => {
    leaderboard.mockResolvedValueOnce({ game: 'TIC_TAC_TOE', entries: [] });
    renderWithProviders(<LeaderboardPage />);
    expect(await screen.findByText('Пока нет побед')).toBeInTheDocument();
  });

  it('shows an error state with a working retry', async () => {
    leaderboard.mockRejectedValueOnce(new Error('boom'));
    leaderboard.mockResolvedValueOnce(sample);
    renderWithProviders(<LeaderboardPage />);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Повторить' }));
    await waitFor(() => expect(screen.getByText('nova')).toBeInTheDocument());
  });
});
