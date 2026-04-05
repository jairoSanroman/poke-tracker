import { supabase } from '@/integrations/supabase/client';
import type { CaptureRow } from '@/hooks/useCaptures';

async function ensureRunRecord(runId: string, runName?: string) {
  const { data: existing } = await supabase
    .from('runs')
    .select('id')
    .eq('id', runId)
    .maybeSingle();

  if (existing?.id) return;

  const { error } = await supabase
    .from('runs')
    .insert({ id: runId, name: runName || 'Partida', lives: 10, max_lives: 10 });

  if (error && error.code !== '23505') {
    console.warn('[ensureRunRecord] insert error (non-fatal):', error);
  }
}

interface EnsureRouteRecordParams {
  runId: string;
  routeName: string;
  routeStatus?: string;
}

interface UpsertCaptureRecordParams {
  id: string;
  runId: string;
  playerId: string;
  routeName: string;
  routeStatus?: string;
  species: string;
  speciesId: number;
  nickname?: string;
  imageUrl: string;
  status: string;
}

export async function ensureRouteRecord({ runId, routeName, routeStatus = 'pending' }: EnsureRouteRecordParams & { runName?: string }) {
  await ensureRunRecord(runId);

  const { data: existingRoute, error: selectError } = await supabase
    .from('routes')
    .select('id')
    .eq('run_id', runId)
    .eq('name', routeName)
    .limit(1)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existingRoute?.id) return existingRoute.id;

  const validStatus = ['pending', 'done', 'no-encounter'].includes(routeStatus) ? routeStatus : 'pending';

  const { data: insertedRoute, error: insertError } = await supabase
    .from('routes')
    .insert({
      run_id: runId,
      name: routeName,
      status: validStatus,
    })
    .select('id')
    .single();

  if (insertError) {
    // If conflict (duplicate), try fetching again
    const { data: retry } = await supabase
      .from('routes')
      .select('id')
      .eq('run_id', runId)
      .eq('name', routeName)
      .limit(1)
      .maybeSingle();
    if (retry?.id) return retry.id;
    throw insertError;
  }

  return insertedRoute.id;
}

export async function upsertCaptureRecord({
  id,
  runId,
  playerId,
  routeName,
  routeStatus,
  species,
  speciesId,
  nickname,
  imageUrl,
  status,
}: UpsertCaptureRecordParams): Promise<CaptureRow> {
  const routeId = await ensureRouteRecord({ runId, routeName, routeStatus });

  const { data, error } = await supabase
    .from('captures')
    .upsert(
      {
        id,
        run_id: runId,
        player_id: playerId,
        route_id: routeId,
        species,
        species_id: speciesId,
        nickname: nickname || null,
        image_url: imageUrl,
        origin_type: 'route',
        origin_id: routeId,
        status,
      },
      { onConflict: 'id' }
    )
    .select('*')
    .single();

  if (error) throw error;

  return data as CaptureRow;
}