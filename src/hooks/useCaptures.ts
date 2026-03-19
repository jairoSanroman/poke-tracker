import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CaptureRow {
  id: string;
  run_id: string;
  player_id: string;
  route_id: string;
  species: string;
  species_id: number | null;
  nickname: string | null;
  image_url: string | null;
  origin_type: string;
  origin_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function useRunCaptures(runId: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!runId) return;
    const channel = supabase
      .channel(`captures-${runId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'captures', filter: `run_id=eq.${runId}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ['captures', runId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [runId, queryClient]);

  return useQuery({
    queryKey: ['captures', runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from('captures')
        .select('*')
        .eq('run_id', runId);
      if (error) throw error;
      return data as CaptureRow[];
    },
    enabled: !!runId,
  });
}

export function useLinkedCaptures(originType: string, originId: string, excludePlayerId: string) {
  return useQuery({
    queryKey: ['linked-captures', originType, originId, excludePlayerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('captures')
        .select('*')
        .eq('origin_type', originType)
        .eq('origin_id', originId)
        .neq('player_id', excludePlayerId);
      if (error) throw error;
      return data as CaptureRow[];
    },
    enabled: !!originType && !!originId && !!excludePlayerId,
  });
}

export function useUpsertCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (capture: Omit<CaptureRow, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('captures')
        .upsert(capture, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['captures', data.run_id] });
      queryClient.invalidateQueries({ queryKey: ['linked-captures'] });
    },
  });
}

export function useUpdateCaptureStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('captures')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['captures', data.run_id] });
      queryClient.invalidateQueries({ queryKey: ['linked-captures'] });
    },
  });
}

export function useInsertCapture() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (capture: {
      id: string;
      run_id: string;
      player_id: string;
      route_id: string;
      species: string;
      species_id: number;
      nickname?: string;
      image_url: string;
      origin_type: string;
      origin_id: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from('captures')
        .insert(capture)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['captures', data.run_id] });
    },
  });
}
