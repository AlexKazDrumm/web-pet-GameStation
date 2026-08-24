import { type FormEvent, useState } from 'react';
import { type Game, createReviewInputSchema } from '@gamestation/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reviewsApi } from '../../api/endpoints';
import { Button } from '../../components/ui/Button';
import { Card, CardTitle } from '../../components/ui/Card';
import { SelectField, TextAreaField } from '../../components/ui/Field';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';
import { Tabs } from '../../components/ui/Tabs';
import { useAuthStore } from '../../lib/authStore';
import { formatDateTime, gameLabel } from '../../lib/format';

type Filter = 'ALL' | Game;

const FILTER_TABS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: 'ALL', label: 'Все' },
  { value: 'TIC_TAC_TOE', label: gameLabel('TIC_TAC_TOE') },
  { value: 'ROCK_PAPER_SCISSORS', label: gameLabel('ROCK_PAPER_SCISSORS') },
];

export function ReviewsPage() {
  const token = useAuthStore((state) => state.token);
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<Filter>('ALL');

  const list = useQuery({
    queryKey: ['reviews', filter],
    queryFn: () => reviewsApi.list(filter === 'ALL' ? undefined : filter),
  });

  const [game, setGame] = useState<Game>('TIC_TAC_TOE');
  const [text, setText] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => reviewsApi.create({ game, text: text.trim() }),
    onSuccess: () => {
      setText('');
      void queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });

  const submit = (event: FormEvent): void => {
    event.preventDefault();
    const parsed = createReviewInputSchema.safeParse({ game, text: text.trim() });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Проверьте текст отзыва');
      return;
    }
    setFieldError(null);
    create.mutate();
  };

  return (
    <div className="page">
      <header className="stack">
        <h1>Отзывы</h1>
        <p className="lede">Впечатления игроков о каждой из игр.</p>
      </header>

      {token && (
        <Card>
          <CardTitle>Оставить отзыв</CardTitle>
          <form className="stack" onSubmit={submit}>
            <SelectField
              label="Игра"
              value={game}
              onChange={(event) => setGame(event.target.value as Game)}
            >
              <option value="TIC_TAC_TOE">{gameLabel('TIC_TAC_TOE')}</option>
              <option value="ROCK_PAPER_SCISSORS">{gameLabel('ROCK_PAPER_SCISSORS')}</option>
            </SelectField>
            <TextAreaField
              label="Текст"
              value={text}
              maxLength={1000}
              onChange={(event) => setText(event.target.value)}
              error={fieldError ?? (create.isError ? 'Не удалось отправить отзыв' : undefined)}
              placeholder="Что понравилось или что можно улучшить"
            />
            <Button type="submit" variant="primary" loading={create.isPending}>
              Отправить
            </Button>
          </form>
        </Card>
      )}

      <Tabs options={FILTER_TABS} value={filter} onChange={setFilter} ariaLabel="Фильтр отзывов" />

      {list.isPending && <LoadingState />}
      {list.isError && <ErrorState error={list.error} onRetry={() => void list.refetch()} />}
      {list.isSuccess &&
        (list.data.reviews.length === 0 ? (
          <EmptyState
            title="Отзывов пока нет"
            hint={token ? 'Будьте первым — форма выше.' : 'Войдите, чтобы оставить отзыв.'}
          />
        ) : (
          <div className="stack">
            {list.data.reviews.map((review) => (
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
    </div>
  );
}
