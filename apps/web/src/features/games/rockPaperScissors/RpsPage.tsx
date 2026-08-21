import { useEffect } from 'react';
import { RPS_LABELS, type RpsMove } from '@gamestation/shared';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { SelectField } from '../../../components/ui/Field';
import { useRecordWin } from '../useRecordWin';
import { WinBanner } from '../WinBanner';
import { useRockPaperScissors } from './useRockPaperScissors';
import shell from '../games.module.css';
import rock from '../../../assets/rock.png';
import paper from '../../../assets/paper.png';
import scissors from '../../../assets/scissors.png';

const ICONS: Record<RpsMove, string> = { ROCK: rock, PAPER: paper, SCISSORS: scissors };
const MOVES: RpsMove[] = ['ROCK', 'PAPER', 'SCISSORS'];
const TARGETS = [3, 5, 10];

const OUTCOME_TEXT = { WIN: 'Раунд за вами', LOSE: 'Раунд за компьютером', TIE: 'Ничья в раунде' };

export function RpsPage() {
  const win = useRecordWin('ROCK_PAPER_SCISSORS');
  const game = useRockPaperScissors({ target: 5, onMatchWin: win.record });

  useEffect(() => {
    win.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game.target]);

  const finished = game.winner !== null;
  const tone = game.winner === 'PLAYER' ? 'win' : game.winner === 'OPPONENT' ? 'lose' : undefined;

  return (
    <div className="page">
      <header className="stack">
        <h1>Камень-ножницы-бумага</h1>
        <p className="lede">
          Матч до {game.target} побед против компьютера. Камень бьёт ножницы, ножницы бьют бумагу,
          бумага бьёт камень.
        </p>
      </header>

      <div className={shell.layout}>
        <div className="stack">
          <div className={shell.status} data-tone={tone}>
            {finished
              ? game.winner === 'PLAYER'
                ? 'Матч выигран!'
                : 'Матч проигран'
              : game.round
                ? OUTCOME_TEXT[game.round.outcome]
                : 'Выберите ход'}
          </div>

          <div className={shell.scoreline}>
            <span>Вы: {game.match.playerScore}</span>
            <span className="muted">Компьютер: {game.match.opponentScore}</span>
          </div>

          <div className={shell.picks}>
            {MOVES.map((move) => (
              <button
                key={move}
                type="button"
                className={shell.pick}
                disabled={finished}
                onClick={() => game.playHand(move)}
              >
                <img src={ICONS[move]} alt="" />
                {RPS_LABELS[move]}
              </button>
            ))}
          </div>

          {game.round && (
            <div className={shell.roundbox}>
              <div className={shell.roundcol}>
                <span className="faint">Вы</span>
                <img src={ICONS[game.round.player]} alt={RPS_LABELS[game.round.player]} />
                <span>{RPS_LABELS[game.round.player]}</span>
              </div>
              <span aria-hidden="true">—</span>
              <div className={shell.roundcol}>
                <span className="faint">Компьютер</span>
                <img src={ICONS[game.round.opponent]} alt={RPS_LABELS[game.round.opponent]} />
                <span>{RPS_LABELS[game.round.opponent]}</span>
              </div>
            </div>
          )}

          {game.winner === 'PLAYER' && (
            <WinBanner canRecord={win.canRecord} status={win.status} onRetry={win.record} />
          )}
        </div>

        <Card className={shell.sidecard}>
          <SelectField
            label="Матч до"
            value={game.target}
            onChange={(event) => game.setTarget(Number(event.target.value))}
          >
            {TARGETS.map((value) => (
              <option key={value} value={value}>
                {value} побед
              </option>
            ))}
          </SelectField>
          <Button variant="primary" onClick={game.reset}>
            Новый матч
          </Button>
        </Card>
      </div>
    </div>
  );
}
