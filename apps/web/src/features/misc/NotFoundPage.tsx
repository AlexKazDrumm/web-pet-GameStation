import { Link } from 'react-router-dom';
import { EmptyState } from '../../components/ui/PageState';

export function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState
        title="Страница не найдена"
        hint="Похоже, такой страницы здесь нет."
        action={<Link to="/">Вернуться к играм</Link>}
      />
    </div>
  );
}
