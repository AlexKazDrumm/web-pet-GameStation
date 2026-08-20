import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('POST /api/auth/register', () => {
  it('creates a USER account and returns a token', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'New.User@Example.com', password: 'sup3r-secret' });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user).toMatchObject({ email: 'new.user@example.com', role: 'USER' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('ignores a role supplied in the body (mass-assignment guard)', async () => {
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'sneaky@example.com', password: 'sup3r-secret', role: 'ADMIN' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('validation_error');
  });

  it('rejects a duplicate email with 409', async () => {
    await createUser({ email: 'dupe@example.com' });
    const res = await api()
      .post('/api/auth/register')
      .send({ email: 'dupe@example.com', password: 'sup3r-secret' });
    expect(res.status).toBe(409);
  });

  it('rejects a weak password and an invalid email', async () => {
    expect(
      (await api().post('/api/auth/register').send({ email: 'a@b.com', password: 'short' })).status,
    ).toBe(400);
    expect(
      (await api().post('/api/auth/register').send({ email: 'not-an-email', password: 'sup3r-secret' }))
        .status,
    ).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('returns a token for valid credentials', async () => {
    const user = await createUser({ email: 'log@example.com', password: 'correct-horse' });
    const res = await api()
      .post('/api/auth/login')
      .send({ email: user.email, password: 'correct-horse' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('rejects a wrong password and an unknown email with 401', async () => {
    const user = await createUser({ email: 'log2@example.com', password: 'correct-horse' });
    expect(
      (await api().post('/api/auth/login').send({ email: user.email, password: 'nope' })).status,
    ).toBe(401);
    expect(
      (await api().post('/api/auth/login').send({ email: 'ghost@example.com', password: 'whatever' }))
        .status,
    ).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('requires a token', async () => {
    expect((await api().get('/api/auth/me')).status).toBe(401);
  });

  it('returns the current user', async () => {
    const user = await createUser({ email: 'me@example.com' });
    const res = await api().get('/api/auth/me').set('Authorization', bearer(user.token));
    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: user.id, email: user.email, role: 'USER' });
    expect(res.body.user).not.toHaveProperty('passwordHash');
  });
});
