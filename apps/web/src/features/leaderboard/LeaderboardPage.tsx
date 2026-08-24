import { useState } from 'react';
import { type Game } from '@gamestation/shared';
import { useQuery } from '@tanstack/react-query';
import { scoresApi } from '../../api/endpoints';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { Table, numCell } from '../../components/ui/Table';
import { Tabs } from '../../components/ui/Tabs';
import { gameLabel } from '../../lib/format';

const GAME_TABS: ReadonlyArray<{ value: Game; label: string }> = [
  { value: 'TIC_TAC_TOE', label: gameLabel('TIC_TAC_TOE') },
  { value: 'ROCK_PAPER_SCISSORS', label: gameLabel('ROCK_PAPER_SCISSORS') },
];

export function LeaderboardPage() {
  const [game, setGame] = useState<Game>('TIC_TAC_TOE');
  const query = useQuery({
    queryKey: ['leaderboard', game],
    queryFn: () => scoresApi.leaderboard(game, 20),
  });

  return (
    <div className="page">
      <header className="stack">
        <h1>Лидерборд</h1>
        <p className="lede">Топ игроков по числу побед. Имя — часть email до символа @.</p>
      </header>

      <Tabs options={GAME_TABS} value={game} onChange={setGame} ariaLabel="Выбор игры" />

      {query.isPending && <LoadingState />}
      {query.isError && <ErrorState error={query.error} onRetry={() => void query.refetch()} />}
      {query.isSuccess &&
        (query.data.entries.length === 0 ? (
          <EmptyState title="Пока нет побед" hint="Сыграйте первым и возглавьте таблицу." />
        ) : (
          <Table>
            <thead>
              <tr>
                <th style={{ width: 64 }}>#</th>
                <th>Игрок</th>
                <th className={numCell}>Побед</th>
              </tr>
            </thead>
            <tbody>
              {query.data.entries.map((entry) => (
                <tr key={`${entry.rank}-${entry.name}`}>
                  <td>{entry.rank}</td>
                  <td>{entry.name}</td>
                  <td className={numCell}>{entry.wins}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ))}
    </div>
  );
}
