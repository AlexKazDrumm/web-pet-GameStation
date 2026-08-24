import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { scoresApi } from '../../api/endpoints';
import { Card, CardTitle } from '../../components/ui/Card';
import { ErrorState, LoadingState } from '../../components/ui/PageState';
import { Table, numCell } from '../../components/ui/Table';
import { useAuthStore } from '../../lib/authStore';
import { displayName, gameLabel } from '../../lib/format';

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);
  const scores = useQuery({ queryKey: ['scores', 'me'], queryFn: () => scoresApi.myScores() });

  const total = scores.data?.scores.reduce((sum, row) => sum + row.wins, 0) ?? 0;

  return (
    <div className="page">
      <header className="stack">
        <h1>Профиль</h1>
        {user && (
          <p className="lede">
            {displayName(user.email)} · {user.email}
            {user.role === 'ADMIN' && ' · администратор'}
          </p>
        )}
      </header>

      <Card>
        <CardTitle>Статистика побед</CardTitle>
        {scores.isPending && <LoadingState />}
        {scores.isError && <ErrorState error={scores.error} onRetry={() => void scores.refetch()} />}
        {scores.isSuccess && (
          <>
            <Table>
              <thead>
                <tr>
                  <th>Игра</th>
                  <th className={numCell}>Побед</th>
                </tr>
              </thead>
              <tbody>
                {scores.data.scores.map((row) => (
                  <tr key={row.game}>
                    <td>{gameLabel(row.game)}</td>
                    <td className={numCell}>{row.wins}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <p className="muted">Всего побед: {total}</p>
          </>
        )}
      </Card>

      <Card>
        <CardTitle>Ссылки</CardTitle>
        <p className="row">
          <Link to="/leaderboard">Лидерборд</Link>
          <Link to="/reviews">Отзывы</Link>
          <Link to="/messages">Сообщения</Link>
        </p>
      </Card>
    </div>
  );
}
