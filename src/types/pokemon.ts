export type PokemonStatus = 'seen' | 'captured' | 'ko' | 'in_team' | 'boxed';
export type RouteStatus = 'pending' | 'completed' | 'no_encounter' | 'blocked';
export type CaptureResult = 'captured' | 'failed' | 'repeated' | 'ko';

export interface Player {
  id: string;
  initials: string;
  color: string;
}

export interface Pokemon {
  id: string;
  speciesId: number;
  species: string;
  imageUrl: string;
  nickname?: string;
  status: PokemonStatus;
  playerId: string;
  routeId: string;
  level?: number;
  nature?: string;
  notes?: string;
}

export interface RouteCapture {
  playerId: string;
  pokemonId?: string;
  result: CaptureResult;
}

export interface GameRoute {
  id: string;
  name: string;
  status: RouteStatus;
  captures: RouteCapture[];
}

export interface Run {
  id: string;
  name: string;
  players: Player[];
  lives: number;
  maxLives: number;
  routes: GameRoute[];
  pokemon: Pokemon[];
  createdAt: number;
}

export interface KantoPokemon {
  id: number;
  name: string;
}

export interface KantoRoute {
  id: string;
  name: string;
}
