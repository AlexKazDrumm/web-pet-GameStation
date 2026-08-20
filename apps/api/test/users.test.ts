import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('admin users API', () => {
  it('is forbidden for non-admins', async () => {
    const user = await createUser();
    expect((await api().get('/api/users').set('Authorization', bearer(user.token))).status).toBe(403);
  });

  it('lists users with scores and never leaks the password hash', async () => {
    const admin = await createUser({ email: 'root@example.com', role: 'ADMIN' });
    await createUser({ email: 'p1@example.com' });

    const res = await api().get('/api/users').set('Authorization', bearer(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(2);
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
    expect(res.body.users[0]).toHaveProperty('scores');
  });

  it('updates email and role but blocks self-demotion', async () => {
    const admin = await createUser({ email: 'root@example.com', role: 'ADMIN' });
    const target = await createUser({ email: 'old@example.com' });

    const ok = await api()
      .patch(`/api/users/${target.id}`)
      .set('Authorization', bearer(admin.token))
      .send({ email: 'fresh@example.com', role: 'ADMIN' });
    expect(ok.status).toBe(200);
    expect(ok.body.user).toMatchObject({ email: 'fresh@example.com', role: 'ADMIN' });

    const selfDemote = await api()
      .patch(`/api/users/${admin.id}`)
      .set('Authorization', bearer(admin.token))
      .send({ role: 'USER' });
    expect(selfDemote.status).toBe(400);
  });

  it('rejects an empty patch body and an invalid role', async () => {
    const admin = await createUser({ email: 'root@example.com', role: 'ADMIN' });
    const target = await createUser();
    expect(
      (await api().patch(`/api/users/${target.id}`).set('Authorization', bearer(admin.token)).send({}))
        .status,
    ).toBe(400);
    expect(
      (
        await api()
          .patch(`/api/users/${target.id}`)
          .set('Authorization', bearer(admin.token))
          .send({ role: 'SUPERUSER' })
      ).status,
    ).toBe(400);
  });

  it('deletes another user but not itself', async () => {
    const admin = await createUser({ email: 'root@example.com', role: 'ADMIN' });
    const target = await createUser();

    expect(
      (await api().delete(`/api/users/${admin.id}`).set('Authorization', bearer(admin.token))).status,
    ).toBe(400);

    const removed = await api()
      .delete(`/api/users/${target.id}`)
      .set('Authorization', bearer(admin.token));
    expect(removed.status).toBe(204);
    expect((await api().get('/api/users').set('Authorization', bearer(admin.token))).body.users).toHaveLength(1);
  });

  it('resets a per-game score to zero', async () => {
    const admin = await createUser({ email: 'root@example.com', role: 'ADMIN' });
    const target = await createUser();
    await api()
      .post('/api/scores/wins')
      .set('Authorization', bearer(target.token))
      .send({ game: 'TIC_TAC_TOE' });

    const res = await api()
      .post(`/api/users/${target.id}/scores/reset`)
      .set('Authorization', bearer(admin.token))
      .send({ game: 'TIC_TAC_TOE' });

    expect(res.status).toBe(200);
    const ttt = res.body.user.scores.find((s: { game: string }) => s.game === 'TIC_TAC_TOE');
    expect(ttt.wins).toBe(0);
  });
});
