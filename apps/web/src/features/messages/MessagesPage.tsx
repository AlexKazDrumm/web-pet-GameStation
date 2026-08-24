import { type FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesApi, usersApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { SelectField, TextField } from '../../components/ui/Field';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { useAuthStore } from '../../lib/authStore';
import { displayName, formatDateTime } from '../../lib/format';
import styles from './MessagesPage.module.css';

export function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === 'ADMIN';
  const queryClient = useQueryClient();

  const [withUserId, setWithUserId] = useState<number | undefined>(undefined);
  const [text, setText] = useState('');

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: isAdmin,
  });

  const thread = useQuery({
    queryKey: ['messages', withUserId ?? 'self'],
    queryFn: () => messagesApi.list(withUserId),
    refetchInterval: 10_000,
  });

  const send = useMutation({
    mutationFn: () =>
      messagesApi.send({
        text: text.trim(),
        recipientId: isAdmin ? withUserId : undefined,
      }),
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const canSend =
    text.trim().length > 0 && (!isAdmin || withUserId !== undefined) && !send.isPending;

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    if (canSend) send.mutate();
  };

  return (
    <div className="page">
      <header className="stack">
        <h1>Сообщения</h1>
        <p className="lede">
          {isAdmin
            ? 'Переписка с игроками. Выберите игрока, чтобы открыть ветку.'
            : 'Прямая связь со службой поддержки GameStation.'}
        </p>
      </header>

      {isAdmin && (
        <SelectField
          label="Игрок"
          value={withUserId ?? ''}
          onChange={(event) =>
            setWithUserId(event.target.value ? Number(event.target.value) : undefined)
          }
        >
          <option value="">— выберите игрока —</option>
          {usersQuery.data?.users
            .filter((candidate) => candidate.id !== user?.id)
            .map((candidate) => (
              <option key={candidate.id} value={candidate.id}>
                {displayName(candidate.email)}
              </option>
            ))}
        </SelectField>
      )}

      <Card>
        {thread.isPending && <LoadingState />}
        {thread.isError && <ErrorState error={thread.error} onRetry={() => void thread.refetch()} />}
        {thread.isSuccess &&
          (thread.data.messages.length === 0 ? (
            <EmptyState
              title="Сообщений нет"
              hint={isAdmin && !withUserId ? 'Выберите игрока выше.' : 'Напишите первое сообщение.'}
            />
          ) : (
            <ul className={styles.thread}>
              {thread.data.messages.map((message) => (
                <li
                  key={message.id}
                  className={`${styles.bubble} ${message.mine ? styles.mine : styles.theirs}`}
                >
                  <span className={styles.meta}>
                    {message.senderName} · {formatDateTime(message.createdAt)}
                  </span>
                  <span>{message.text}</span>
                </li>
              ))}
            </ul>
          ))}

        <form className={styles.composer} onSubmit={submit}>
          <TextField
            label="Сообщение"
            value={text}
            maxLength={2000}
            onChange={(event) => setText(event.target.value)}
            placeholder="Текст сообщения"
          />
          <Button type="submit" variant="primary" disabled={!canSend} loading={send.isPending}>
            Отправить
          </Button>
        </form>
      </Card>
    </div>
  );
}
