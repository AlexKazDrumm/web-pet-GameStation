import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useAuthStore } from '../../lib/authStore';
import { renderWithProviders } from '../../test/utils';
import { RequireAdmin, RequireAuth } from './guards';

function Tree() {
  return (
    <Routes>
      <Route path="/" element={<div>home</div>} />
      <Route path="/login" element={<div>login page</div>} />
      <Route
        path="/secret"
        element={
          <RequireAuth>
            <div>secret</div>
          </RequireAuth>
        }
      />
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <div>admin area</div>
          </RequireAdmin>
        }
      />
    </Routes>
  );
}

describe('route guards', () => {
  beforeEach(() => {
    useAuthStore.getState().clear();
  });

  it('redirects anonymous users away from protected routes', () => {
    renderWithProviders(<Tree />, { route: '/secret' });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('lets authenticated users through', () => {
    useAuthStore.getState().setSession('t', {
      id: 1,
      email: 'u@example.com',
      role: 'USER',
      createdAt: new Date().toISOString(),
    });
    renderWithProviders(<Tree />, { route: '/secret' });
    expect(screen.getByText('secret')).toBeInTheDocument();
  });

  it('keeps non-admins out of the admin area', () => {
    useAuthStore.getState().setSession('t', {
      id: 1,
      email: 'u@example.com',
      role: 'USER',
      createdAt: new Date().toISOString(),
    });
    renderWithProviders(<Tree />, { route: '/admin' });
    expect(screen.getByText('home')).toBeInTheDocument();
  });

  it('admits admins to the admin area', () => {
    useAuthStore.getState().setSession('t', {
      id: 1,
      email: 'a@example.com',
      role: 'ADMIN',
      createdAt: new Date().toISOString(),
    });
    renderWithProviders(<Tree />, { route: '/admin' });
    expect(screen.getByText('admin area')).toBeInTheDocument();
  });
});
