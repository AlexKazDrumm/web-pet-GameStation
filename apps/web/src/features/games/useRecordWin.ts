import type { Game } from '@gamestation/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scoresApi } from '../../api/endpoints';
import { useAuthStore } from '../../lib/authStore';

export function useRecordWin(game: Game) {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const mutation = useMutation({
    mutationFn: () => scoresApi.recordWin(game),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scores', 'me'] });
      void queryClient.invalidateQueries({ queryKey: ['leaderboard', game] });
    },
  });

  return {
    canRecord: Boolean(token),
    record: () => {
      if (token) mutation.mutate();
    },
    reset: mutation.reset,
    status: mutation.status,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    isPending: mutation.isPending,
  };
}
