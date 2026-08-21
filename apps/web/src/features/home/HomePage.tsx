import { Link } from 'react-router-dom';
import { Card, CardTitle } from '../../components/ui/Card';
import { useAuthStore } from '../../lib/authStore';

const GAMES = [
  {
    to: '/games/tic-tac-toe',
    title: 'Крестики-нолики',
    text: 'Поле от 3×3 до 8×8, соперник — компьютер с настраиваемой сложностью.',
  },
  {
    to: '/games/rock-paper-scissors',
    title: 'Камень-ножницы-бумага',
    text: 'Быстрые матчи до 3, 5 или 10 побед против компьютера.',
  },
];

export function HomePage() {
  const token = useAuthStore((state) => state.token);

  return (
    <div className="page">
      <header className="stack">
        <h1>GameStation</h1>
        <p className="lede">
          Небольшой игровой портал: две браузерные игры против компьютера, личная статистика,
          общий лидерборд и отзывы игроков.
        </p>
        {!token && (
          <p className="muted">
            <Link to="/register">Заведите аккаунт</Link>, чтобы победы сохранялись в статистике и
            попадали в таблицу лидеров.
          </p>
        )}
      </header>

      <section className="grid-cards">
        {GAMES.map((game) => (
          <Card key={game.to} interactive>
            <CardTitle>{game.title}</CardTitle>
            <p className="muted">{game.text}</p>
            <Link to={game.to}>Играть →</Link>
          </Card>
        ))}
      </section>

      <section className="grid-cards">
        <Card>
          <CardTitle>Лидерборд</CardTitle>
          <p className="muted">Рейтинг игроков по числу побед в каждой игре.</p>
          <Link to="/leaderboard">Смотреть таблицу →</Link>
        </Card>
        <Card>
          <CardTitle>Отзывы</CardTitle>
          <p className="muted">Впечатления игроков о каждой из игр.</p>
          <Link to="/reviews">Читать отзывы →</Link>
        </Card>
      </section>
    </div>
  );
}
