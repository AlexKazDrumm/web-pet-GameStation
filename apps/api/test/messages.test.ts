import { describe, expect, it } from 'vitest';
import { api, bearer, createUser } from './helpers.js';

describe('messages', () => {
  it('routes a player message to the support admin regardless of recipientId', async () => {
    const admin = await createUser({ email: 'admin@example.com', role: 'ADMIN' });
    const player = await createUser({ email: 'player@example.com' });
    const other = await createUser({ email: 'other@example.com' });

    const res = await api()
      .post('/api/messages')
      .set('Authorization', bearer(player.token))
      .send({ text: 'нужна помощь', recipientId: other.id });

    expect(res.status).toBe(201);
    expect(res.body.message.recipientId).toBe(admin.id);
    expect(res.body.message.mine).toBe(true);
  });

  it('keeps a player from reading another player thread', async () => {
    const admin = await createUser({ email: 'admin@example.com', role: 'ADMIN' });
    const alice = await createUser({ email: 'alice@example.com' });
    const bob = await createUser({ email: 'bob@example.com' });

    await api().post('/api/messages').set('Authorization', bearer(alice.token)).send({ text: 'from alice' });
    await api().post('/api/messages').set('Authorization', bearer(bob.token)).send({ text: 'from bob' });

    const bobView = await api()
      .get('/api/messages')
      .set('Authorization', bearer(bob.token))
      .query({ withUserId: alice.id });

    expect(bobView.status).toBe(200);
    expect(bobView.body.messages).toHaveLength(1);
    expect(bobView.body.messages[0].text).toBe('from bob');
    void admin;
  });

  it('requires a recipient when an admin writes and can open any thread', async () => {
    const admin = await createUser({ email: 'admin@example.com', role: 'ADMIN' });
    const alice = await createUser({ email: 'alice@example.com' });

    const missing = await api()
      .post('/api/messages')
      .set('Authorization', bearer(admin.token))
      .send({ text: 'no target' });
    expect(missing.status).toBe(400);

    await api().post('/api/messages').set('Authorization', bearer(alice.token)).send({ text: 'hi admin' });
    await api()
      .post('/api/messages')
      .set('Authorization', bearer(admin.token))
      .send({ text: 'hello alice', recipientId: alice.id });

    const thread = await api()
      .get('/api/messages')
      .set('Authorization', bearer(admin.token))
      .query({ withUserId: alice.id });
    expect(thread.body.messages).toHaveLength(2);
    expect(thread.body.messages.map((m: { text: string }) => m.text)).toEqual(['hi admin', 'hello alice']);
  });
});
