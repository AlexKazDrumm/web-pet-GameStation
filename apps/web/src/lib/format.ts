import { GAME_LABELS, type Game } from '@gamestation/shared';

export function displayName(email: string): string {
  const [local] = email.split('@');
  return local && local.length > 0 ? local : email;
}

export function gameLabel(game: Game): string {
  return GAME_LABELS[game];
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}
