import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

interface WinBannerProps {
  canRecord: boolean;
  status: 'idle' | 'pending' | 'success' | 'error';
  onRetry: () => void;
}

export function WinBanner({ canRecord, status, onRetry }: WinBannerProps) {
  if (!canRecord) {
    return (
      <p className="note">
        <Link to="/login">Войдите</Link>, чтобы победы попадали в статистику и лидерборд.
      </p>
    );
  }
  if (status === 'pending') return <p className="note">Сохранение победы…</p>;
  if (status === 'success') return <p className="note">Победа засчитана в статистику.</p>;
  if (status === 'error') {
    return (
      <p className="note">
        Не удалось сохранить победу.{' '}
        <Button size="sm" variant="ghost" onClick={onRetry}>
          Повторить
        </Button>
      </p>
    );
  }
  return null;
}
