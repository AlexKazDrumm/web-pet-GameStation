import { useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import { authApi } from './api/endpoints';
import { LoadingState } from './components/ui/PageState';
import { Layout } from './components/layout/Layout';
import { RequireAdmin, RequireAuth } from './components/layout/guards';
import { AuthPage } from './features/auth/AuthPage';
import { AdminPage } from './features/admin/AdminPage';
import { RpsPage } from './features/games/rockPaperScissors/RpsPage';
import { TicTacToePage } from './features/games/ticTacToe/TicTacToePage';
import { HomePage } from './features/home/HomePage';
import { LeaderboardPage } from './features/leaderboard/LeaderboardPage';
import { MessagesPage } from './features/messages/MessagesPage';
import { NotFoundPage } from './features/misc/NotFoundPage';
import { ProfilePage } from './features/profile/ProfilePage';
import { ReviewsPage } from './features/reviews/ReviewsPage';
import { useAuthStore } from './lib/authStore';

export function App() {
  const { token, setUser, clear } = useAuthStore();
  const [checking, setChecking] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    let alive = true;
    authApi
      .me()
      .then((res) => {
        if (alive) setUser(res.user);
      })
      .catch(() => {
        if (alive) clear();
      })
      .finally(() => {
        if (alive) setChecking(false);
      });
    return () => {
      alive = false;
    };
    // Session check runs once on load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking) {
    return <LoadingState label="Проверка сессии…" />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route path="games/tic-tac-toe" element={<TicTacToePage />} />
        <Route path="games/rock-paper-scissors" element={<RpsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="reviews" element={<ReviewsPage />} />
        <Route
          path="profile"
          element={
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          }
        />
        <Route
          path="messages"
          element={
            <RequireAuth>
              <MessagesPage />
            </RequireAuth>
          }
        />
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
