import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Run, Player, Pokemon, GameRoute, CaptureResult, PokemonStatus } from '@/types/pokemon';
import { KANTO_ROUTES, PLAYER_COLORS } from '@/data/pokemon';

interface GameState {
  runs: Run[];
  activeRunId: string | null;

  // Run actions
  createRun: (name: string) => string;
  deleteRun: (id: string) => void;
  setActiveRun: (id: string | null) => void;
  getActiveRun: () => Run | undefined;

  // Player actions
  addPlayer: (runId: string, initials: string, avatar?: string) => void;
  removePlayer: (runId: string, playerId: string) => void;
  updatePlayer: (runId: string, playerId: string, updates: Partial<Player>) => void;

  // Lives
  setLives: (runId: string, lives: number) => void;

  // Capture
  addCapture: (runId: string, routeId: string, playerId: string, speciesId: number, species: string, nickname: string | undefined, result: CaptureResult) => void;
  updatePokemon: (runId: string, pokemonId: string, updates: Partial<Pokemon>) => void;
  updateRouteCapture: (runId: string, routeId: string, playerId: string, result: CaptureResult) => void;

  // Route
  updateRouteStatus: (runId: string, routeId: string, status: GameRoute['status']) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      runs: [],
      activeRunId: null,

      createRun: (name: string) => {
        const id = crypto.randomUUID();
        const routes: GameRoute[] = KANTO_ROUTES.map(r => ({
          id: r.id,
          name: r.name,
          status: 'pending' as const,
          captures: [],
        }));
        const run: Run = {
          id,
          name,
          players: [],
          lives: 10,
          maxLives: 10,
          routes,
          pokemon: [],
          createdAt: Date.now(),
        };
        set(state => ({ runs: [...state.runs, run], activeRunId: id }));
        return id;
      },

      deleteRun: (id) => {
        set(state => ({
          runs: state.runs.filter(r => r.id !== id),
          activeRunId: state.activeRunId === id ? null : state.activeRunId,
        }));
      },

      setActiveRun: (id) => set({ activeRunId: id }),

      getActiveRun: () => {
        const state = get();
        return state.runs.find(r => r.id === state.activeRunId);
      },

      addPlayer: (runId, initials, avatar) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            const colorIndex = run.players.length % PLAYER_COLORS.length;
            const player: Player = {
              id: crypto.randomUUID(),
              initials: initials.toUpperCase().slice(0, 3),
              color: PLAYER_COLORS[colorIndex],
              avatar,
            };
            return { ...run, players: [...run.players, player] };
          }),
        }));
      },

      updatePlayer: (runId, playerId, updates) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            return {
              ...run,
              players: run.players.map(p =>
                p.id === playerId ? { ...p, ...updates } : p
              ),
            };
          }),
        }));
      },

      removePlayer: (runId, playerId) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            return {
              ...run,
              players: run.players.filter(p => p.id !== playerId),
              pokemon: run.pokemon.filter(p => p.playerId !== playerId),
              routes: run.routes.map(r => ({
                ...r,
                captures: r.captures.filter(c => c.playerId !== playerId),
              })),
            };
          }),
        }));
      },

      setLives: (runId, lives) => {
        set(state => ({
          runs: state.runs.map(run =>
            run.id === runId ? { ...run, lives: Math.max(0, lives) } : run
          ),
        }));
      },

      addCapture: (runId, routeId, playerId, speciesId, species, nickname, result) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            const pokemonId = crypto.randomUUID();
            const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
            const status: PokemonStatus = result === 'captured' ? 'captured' : result === 'ko' ? 'ko' : 'seen';
            const pokemon: Pokemon = {
              id: pokemonId,
              speciesId,
              species,
              imageUrl,
              nickname: nickname || undefined,
              status,
              playerId,
              routeId,
            };

            const routes = run.routes.map(r => {
              if (r.id !== routeId) return r;
              const existingIdx = r.captures.findIndex(c => c.playerId === playerId);
              const capture = { playerId, pokemonId: result === 'captured' ? pokemonId : undefined, result };
              const captures = existingIdx >= 0
                ? r.captures.map((c, i) => i === existingIdx ? capture : c)
                : [...r.captures, capture];
              return { ...r, captures };
            });

            return {
              ...run,
              pokemon: [...run.pokemon, pokemon],
              routes,
            };
          }),
        }));
      },

      updatePokemon: (runId, pokemonId, updates) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            return {
              ...run,
              pokemon: run.pokemon.map(p =>
                p.id === pokemonId ? { ...p, ...updates } : p
              ),
            };
          }),
        }));
      },

      updateRouteCapture: (runId, routeId, playerId, result) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            return {
              ...run,
              routes: run.routes.map(r => {
                if (r.id !== routeId) return r;
                return {
                  ...r,
                  captures: r.captures.map(c =>
                    c.playerId === playerId ? { ...c, result } : c
                  ),
                };
              }),
            };
          }),
        }));
      },

      updateRouteStatus: (runId, routeId, status) => {
        set(state => ({
          runs: state.runs.map(run => {
            if (run.id !== runId) return run;
            return {
              ...run,
              routes: run.routes.map(r =>
                r.id === routeId ? { ...r, status } : r
              ),
            };
          }),
        }));
      },
    }),
    {
      name: 'pokemon-anil-tracker',
    }
  )
);
