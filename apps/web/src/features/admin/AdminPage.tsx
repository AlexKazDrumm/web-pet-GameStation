import { useState } from 'react';
import { GAMES } from '@gamestation/shared';
import { useQuery } from '@tanstack/react-query';
import { reviewsApi, usersApi } from '../../api/endpoints';
import { Card } from '../../components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { Table, numCell } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { useAuthStore } from '../../lib/authStore';
import { formatDateTime, gameLabel } from '../../lib/format';
import { UserRow } from './UserRow';

type Tab = 'users' | 'reviews';

const TABS: ReadonlyArray<{ value: Tab; label: string }> = [
  { value: 'users', label: 'Игроки' },
  { value: 'reviews', label: 'Отзывы' },
];

export function AdminPage() {
  const selfId = useAuthStore((state) => state.user?.id);
  const [tab, setTab] = useState<Tab>('users');

  const users = useQuery({ queryKey: ['users'], queryFn: () => usersApi.list(), enabled: tab === 'users' });
  const reviews = useQuery({
    queryKey: ['reviews', 'ALL'],
    queryFn: () => reviewsApi.list(),
    enabled: tab === 'reviews',
  });

  return (
    <div className="page">
      <header className="stack">
        <h1>Администрирование</h1>
        <p className="lede">Управление игроками и модерация отзывов.</p>
      </header>

      <Tabs options={TABS} value={tab} onChange={setTab} ariaLabel="Разделы администрирования" />

      {tab === 'users' && (
        <Card>
          {users.isPending && <LoadingState />}
          {users.isError && <ErrorState error={users.error} onRetry={() => void users.refetch()} />}
          {users.isSuccess && (
            <Table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Роль</th>
                  {GAMES.map((game) => (
                    <th key={game} className={numCell}>
                      {gameLabel(game)}
                    </th>
                  ))}
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.data.users.map((user) => (
                  <UserRow key={user.id} user={user} selfId={selfId} />
                ))}
              </tbody>
            </Table>
          )}
        </Card>
      )}

      {tab === 'reviews' && (
        <>
          {reviews.isPending && <LoadingState />}
          {reviews.isError && (
            <ErrorState error={reviews.error} onRetry={() => void reviews.refetch()} />
          )}
          {reviews.isSuccess &&
            (reviews.data.reviews.length === 0 ? (
              <EmptyState title="Отзывов пока нет" />
            ) : (
              <div className="stack">
                {reviews.data.reviews.map((review) => (
                  <Card key={review.id}>
                    <div className="row" style={{ justifyContent: 'space-between' }}>
                      <strong>{gameLabel(review.game)}</strong>
                      <span className="faint">{formatDateTime(review.createdAt)}</span>
                    </div>
                    <p>{review.text}</p>
                    <span className="muted">— {review.authorName}</span>
                  </Card>
                ))}
              </div>
            ))}
        </>
      )}
    </div>
  );
}
