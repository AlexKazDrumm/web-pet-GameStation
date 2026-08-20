import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('hardening', () => {
  it('returns a structured 404 for unknown routes', async () => {
    const res = await api().get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('not_found');
  });

  it('does not advertise the framework', async () => {
    const res = await api().get('/api/health');
    expect(res.headers).not.toHaveProperty('x-powered-by');
  });

  it('rejects an oversized JSON body with 413', async () => {
    const user = await createUser();
    const huge = 'a'.repeat(64 * 1024);
    const res = await api()
      .post('/api/reviews')
      .set('Authorization', bearer(user.token))
      .set('Content-Type', 'application/json')
      .send(JSON.stringify({ game: 'TIC_TAC_TOE', text: huge }));
    expect(res.status).toBe(413);
  });

  it('rejects malformed JSON with 400', async () => {
    const res = await api()
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{ "email": ');
    expect(res.status).toBe(400);
  });

  it('rejects unknown body keys', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'whatever', admin: true });
    expect(res.status).toBe(400);
  });

  it('never includes passwordHash in any auth payload', async () => {
    const reg = await api()
      .post('/api/auth/register')
      .send({ email: 'scan@example.com', password: 'sup3r-secret' });
    expect(JSON.stringify(reg.body)).not.toMatch(/passwordHash|\$2[aby]\$/);
  });
});
