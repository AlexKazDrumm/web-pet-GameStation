import { describe, expect, it } from 'vitest';
import { signToken, verifyToken } from '../src/lib/jwt.js';
import { hashPassword, verifyPassword } from '../src/lib/password.js';

describe('jwt', () => {
  it('round-trips a payload', () => {
    const token = signToken({ sub: 42, role: 'ADMIN' });
    expect(verifyToken(token)).toEqual({ sub: 42, role: 'ADMIN' });
  });

  it('rejects a tampered token', () => {
    const token = signToken({ sub: 1, role: 'USER' });
    expect(() => verifyToken(`${token}x`)).toThrow();
  });

  it('rejects a foreign-signed token', () => {
    expect(() => verifyToken('eyJhbGciOiJIUzI1NiJ9.e30.invalidsignature')).toThrow();
  });
});

describe('password', () => {
  it('hashes and verifies', async () => {
    const hash = await hashPassword('correct-horse-battery');
    expect(hash).not.toBe('correct-horse-battery');
    expect(await verifyPassword('correct-horse-battery', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });
});
