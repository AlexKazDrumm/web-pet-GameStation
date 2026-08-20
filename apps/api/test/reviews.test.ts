import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('reviews', () => {
  it('requires authentication to post', async () => {
    const res = await api().post('/api/reviews').send({ game: 'TIC_TAC_TOE', text: 'nice game' });
    expect(res.status).toBe(401);
  });

  it('creates a review and exposes only the author display name', async () => {
    const user = await createUser({ email: 'critic@example.com' });
    const res = await api()
      .post('/api/reviews')
      .set('Authorization', bearer(user.token))
      .send({ game: 'TIC_TAC_TOE', text: 'Отличная реализация большого поля' });

    expect(res.status).toBe(201);
    expect(res.body.review).toMatchObject({ game: 'TIC_TAC_TOE', authorName: 'critic' });
    expect(res.body.review).not.toHaveProperty('authorId');
    expect(JSON.stringify(res.body)).not.toContain('critic@example.com');
  });

  it('rejects too-short text', async () => {
    const user = await createUser();
    const res = await api()
      .post('/api/reviews')
      .set('Authorization', bearer(user.token))
      .send({ game: 'TIC_TAC_TOE', text: 'x' });
    expect(res.status).toBe(400);
  });

  it('lists reviews newest-first and filters by game', async () => {
    const user = await createUser();
    await api()
      .post('/api/reviews')
      .set('Authorization', bearer(user.token))
      .send({ game: 'TIC_TAC_TOE', text: 'первый отзыв про поле' });
    await api()
      .post('/api/reviews')
      .set('Authorization', bearer(user.token))
      .send({ game: 'ROCK_PAPER_SCISSORS', text: 'второй отзыв про раунды' });

    const all = await api().get('/api/reviews');
    expect(all.body.reviews).toHaveLength(2);
    expect(all.body.reviews[0].game).toBe('ROCK_PAPER_SCISSORS');

    const filtered = await api().get('/api/reviews').query({ game: 'TIC_TAC_TOE' });
    expect(filtered.body.reviews).toHaveLength(1);
    expect(filtered.body.reviews[0].game).toBe('TIC_TAC_TOE');
  });
});
