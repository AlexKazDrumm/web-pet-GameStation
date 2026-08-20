import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('POST /api/scores/wins', () => {
  it('requires authentication', async () => {
    expect((await api().post('/api/scores/wins').send({ game: 'TIC_TAC_TOE' })).status).toBe(401);
  });

  it('increments the per-game win counter', async () => {
    const user = await createUser();
    const first = await api()
      .post('/api/scores/wins')
      .set('Authorization', bearer(user.token))
      .send({ game: 'TIC_TAC_TOE' });
    expect(first.status).toBe(200);
    expect(first.body.score).toEqual({ game: 'TIC_TAC_TOE', wins: 1 });

    const second = await api()
      .post('/api/scores/wins')
      .set('Authorization', bearer(user.token))
      .send({ game: 'TIC_TAC_TOE' });
    expect(second.body.score.wins).toBe(2);
  });

  it('rejects an unknown game', async () => {
    const user = await createUser();
    const res = await api()
      .post('/api/scores/wins')
      .set('Authorization', bearer(user.token))
      .send({ game: 'CHESS' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/scores/me', () => {
  it('returns zeroed rows for both games by default', async () => {
    const user = await createUser();
    const res = await api().get('/api/scores/me').set('Authorization', bearer(user.token));
    expect(res.status).toBe(200);
    expect(res.body.scores).toEqual(
      expect.arrayContaining([
        { game: 'TIC_TAC_TOE', wins: 0 },
        { game: 'ROCK_PAPER_SCISSORS', wins: 0 },
      ]),
    );
  });
});

describe('GET /api/leaderboard', () => {
  it('ranks players by wins and honours the limit', async () => {
    const alice = await createUser({ email: 'alice@example.com' });
    const bob = await createUser({ email: 'bob@example.com' });
    const carol = await createUser({ email: 'carol@example.com' });

    const win = (token: string) =>
      api().post('/api/scores/wins').set('Authorization', bearer(token)).send({ game: 'ROCK_PAPER_SCISSORS' });

    await win(bob.token);
    await win(bob.token);
    await win(bob.token);
    await win(alice.token);
    await win(alice.token);
    await win(carol.token);

    const res = await api().get('/api/leaderboard').query({ game: 'ROCK_PAPER_SCISSORS', limit: 2 });
    expect(res.status).toBe(200);
    expect(res.body.entries).toEqual([
      { rank: 1, name: 'bob', wins: 3 },
      { rank: 2, name: 'alice', wins: 2 },
    ]);
  });

  it('rejects a missing game query', async () => {
    expect((await api().get('/api/leaderboard')).status).toBe(400);
  });
});
