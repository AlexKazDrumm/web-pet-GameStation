import { useEffect } from 'react';
import { MAX_BOARD_SIZE, MIN_BOARD_SIZE } from '@gamestation/shared';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SelectField } from '../../../components/ui/Field';
import { useRecordWin } from '../useRecordWin';
import { WinBanner } from '../WinBanner';
import { Board } from './Board';
import { type TicTacToeStatus, useTicTacToe } from './useTicTacToe';
import shell from '../games.module.css';

const SIZE_OPTIONS = Array.from(
  { length: MAX_BOARD_SIZE - MIN_BOARD_SIZE + 1 },
  (_, i) => MIN_BOARD_SIZE + i,
);

const STATUS_TEXT: Record<TicTacToeStatus, { text: string; tone?: 'win' | 'lose' | 'draw' }> = {
  playing: { text: 'Ваш ход — вы играете за «X»' },
  thinking: { text: 'Компьютер думает…' },
  'player-won': { text: 'Вы выиграли партию!', tone: 'win' },
  'computer-won': { text: 'Партия за компьютером', tone: 'lose' },
  draw: { text: 'Ничья', tone: 'draw' },
};

export function TicTacToePage() {
  const win = useRecordWin('TIC_TAC_TOE');
  const game = useTicTacToe({ initialSize: 3, onPlayerWin: win.record });

  useEffect(() => {
    win.reset();
    // reset the record-win state whenever a new board starts
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.size, game.smart]);

  const status = STATUS_TEXT[game.status];

  return (
    <div className="page">
      <header className="stack">
        <h1>Крестики-нолики</h1>
        <p className="lede">
          Поле от {MIN_BOARD_SIZE}×{MIN_BOARD_SIZE} до {MAX_BOARD_SIZE}×{MAX_BOARD_SIZE}. Побеждает
          тот, кто первым соберёт три в ряд по горизонтали, вертикали или диагонали.
        </p>
      </header>

      <div className={shell.layout}>
        <div className="stack">
          <div className={shell.status} data-tone={status.tone}>
            {status.text}
          </div>
          <Board
            board={game.board}
            size={game.size}
            winningLine={game.winningLine}
            disabled={game.locked || game.status !== 'playing'}
            onPlay={game.play}
          />
          {game.status === 'player-won' && (
            <WinBanner canRecord={win.canRecord} status={win.status} onRetry={win.record} />
          )}
        </div>

        <Card className={shell.sidecard}>
          <SelectField
            label="Размер поля"
            value={game.size}
            onChange={(event) => game.setSize(Number(event.target.value))}
          >
            {SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} × {size}
              </option>
            ))}
          </SelectField>

          <label className={shell.check}>
            <input
              type="checkbox"
              checked={game.smart}
              onChange={(event) => game.setSmart(event.target.checked)}
            />
            Умный соперник (блокирует и атакует)
          </label>

          <Button variant="primary" onClick={game.reset}>
            Новая партия
          </Button>
        </Card>
      </div>
    </div>
  );
}
