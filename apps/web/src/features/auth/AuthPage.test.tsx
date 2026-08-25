import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../lib/authStore';
import { renderWithProviders } from '../../test/utils';
import { AuthPage } from './AuthPage';

const login = vi.fn();
const register = vi.fn();

vi.mock('../../api/endpoints', () => ({
  authApi: {
    login: (...args: unknown[]) => login(...args),
    register: (...args: unknown[]) => register(...args),
  },
}));

afterEach(() => {
  login.mockReset();
  register.mockReset();
  useAuthStore.getState().clear();
});

describe('AuthPage', () => {
  it('flags a short password on registration and does not call the API', async () => {
    renderWithProviders(<AuthPage mode="register" />, { route: '/register' });
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'abc');
    await userEvent.click(screen.getByRole('button', { name: 'Создать аккаунт' }));

    await waitFor(() =>
      expect(screen.getByLabelText('Пароль')).toHaveAttribute('aria-invalid', 'true'),
    );
    expect(register).not.toHaveBeenCalled();
  });

  it('logs in and stores the session on success', async () => {
    login.mockResolvedValueOnce({
      token: 'jwt-token',
      user: { id: 1, email: 'user@example.com', role: 'USER', createdAt: '2020-01-01T00:00:00.000Z' },
    });
    renderWithProviders(<AuthPage mode="login" />, { route: '/login' });
    await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
    await userEvent.type(screen.getByLabelText('Пароль'), 'sup3r-secret');
    await userEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => expect(useAuthStore.getState().token).toBe('jwt-token'));
    expect(login).toHaveBeenCalledWith({ email: 'user@example.com', password: 'sup3r-secret' });
  });
});
