import { useState } from 'react';
import { type AdminUser, type Game, GAMES, type Role } from '@gamestation/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { numCell } from '../../components/ui/Table';
import { gameLabel } from '../../lib/format';

interface Props {
  user: AdminUser;
  selfId: number | undefined;
}

export function UserRow({ user, selfId }: Props) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState(user.email);
  const [editing, setEditing] = useState(false);
  const isSelf = user.id === selfId;

  const invalidate = (): Promise<void> =>
    queryClient.invalidateQueries({ queryKey: ['users'] }).then(() => undefined);

  const update = useMutation({
    mutationFn: (input: { email?: string; role?: Role }) => usersApi.update(user.id, input),
    onSuccess: () => {
      setEditing(false);
      void invalidate();
    },
  });
  const reset = useMutation({
    mutationFn: (game: Game) => usersApi.resetScore(user.id, { game }),
    onSuccess: () => void invalidate(),
  });
  const remove = useMutation({
    mutationFn: () => usersApi.remove(user.id),
    onSuccess: () => void invalidate(),
  });

  const winsFor = (game: Game): number => user.scores.find((s) => s.game === game)?.wins ?? 0;

  return (
    <tr>
      <td>
        {editing ? (
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            style={{
              width: '100%',
              padding: '0.3rem 0.5rem',
              background: 'var(--bg-elevated)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 6,
            }}
          />
        ) : (
          user.email
        )}
      </td>
      <td>
        <select
          value={user.role}
          disabled={isSelf}
          onChange={(event) => update.mutate({ role: event.target.value as Role })}
          style={{
            padding: '0.3rem 0.5rem',
            background: 'var(--bg-elevated)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: 6,
          }}
        >
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>
      </td>
      {GAMES.map((game) => (
        <td key={game} className={numCell}>
          {winsFor(game)}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => reset.mutate(game)}
            loading={reset.isPending}
            title={`Сбросить: ${gameLabel(game)}`}
            style={{ marginLeft: 8 }}
          >
            0
          </Button>
        </td>
      ))}
      <td>
        <div className="row">
          {editing ? (
            <>
              <Button
                size="sm"
                variant="primary"
                loading={update.isPending}
                onClick={() => update.mutate({ email })}
              >
                Сохранить
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEmail(user.email);
                  setEditing(false);
                }}
              >
                Отмена
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditing(true)}>
              Имя
            </Button>
          )}
          <Button
            size="sm"
            variant="danger"
            disabled={isSelf}
            loading={remove.isPending}
            onClick={() => {
              if (window.confirm(`Удалить игрока ${user.email}?`)) remove.mutate();
            }}
          >
            Удалить
          </Button>
        </div>
      </td>
    </tr>
  );
}
