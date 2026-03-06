import { KantoRoute } from '@/types/pokemon';

export interface PokemonGeneration {
  id: number;
  name: string;
  region: string;
  start: number;
  end: number;
}

export const GENERATIONS: PokemonGeneration[] = [
  { id: 1, name: 'Gen I', region: 'Kanto', start: 1, end: 151 },
  { id: 2, name: 'Gen II', region: 'Johto', start: 152, end: 251 },
  { id: 3, name: 'Gen III', region: 'Hoenn', start: 252, end: 386 },
  { id: 4, name: 'Gen IV', region: 'Sinnoh', start: 387, end: 493 },
  { id: 5, name: 'Gen V', region: 'Teselia', start: 494, end: 649 },
  { id: 6, name: 'Gen VI', region: 'Kalos', start: 650, end: 721 },
  { id: 7, name: 'Gen VII', region: 'Alola', start: 722, end: 809 },
  { id: 8, name: 'Gen VIII', region: 'Galar', start: 810, end: 905 },
  { id: 9, name: 'Gen IX', region: 'Paldea', start: 906, end: 1025 },
];

export function getGeneration(speciesId: number): number {
  const gen = GENERATIONS.find(g => speciesId >= g.start && speciesId <= g.end);
  return gen?.id ?? 1;
}

export function getPokemonSprite(speciesId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${speciesId}.png`;
}

export function getPokemonArtwork(speciesId: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${speciesId}.png`;
}

// Keep route data here (unchanged)
export const KANTO_ROUTES: KantoRoute[] = [
  { id: 'pallet', name: 'Pueblo Paleta' },
  { id: 'route1', name: 'Ruta 1' },
  { id: 'viridian', name: 'Ciudad Verde' },
  { id: 'route2', name: 'Ruta 2' },
  { id: 'viridian-forest', name: 'Bosque Verde' },
  { id: 'pewter', name: 'Ciudad Plateada' },
  { id: 'route3', name: 'Ruta 3' },
  { id: 'mt-moon', name: 'Monte Luna' },
  { id: 'route4', name: 'Ruta 4' },
  { id: 'cerulean', name: 'Ciudad Celeste' },
  { id: 'route24', name: 'Ruta 24' },
  { id: 'route25', name: 'Ruta 25' },
  { id: 'route5', name: 'Ruta 5' },
  { id: 'route6', name: 'Ruta 6' },
  { id: 'vermilion', name: 'Ciudad Carmín' },
  { id: 'ss-anne', name: 'S.S. Anne' },
  { id: 'route11', name: 'Ruta 11' },
  { id: 'digletts-cave', name: 'Cueva Diglett' },
  { id: 'route9', name: 'Ruta 9' },
  { id: 'route10', name: 'Ruta 10' },
  { id: 'rock-tunnel', name: 'Túnel Roca' },
  { id: 'lavender', name: 'Pueblo Lavanda' },
  { id: 'pokemon-tower', name: 'Torre Pokémon' },
  { id: 'route8', name: 'Ruta 8' },
  { id: 'route7', name: 'Ruta 7' },
  { id: 'celadon', name: 'Ciudad Azulona' },
  { id: 'game-corner', name: 'Casino / Guarida Rocket' },
  { id: 'route16', name: 'Ruta 16' },
  { id: 'route17', name: 'Ruta 17 (Ciclovía)' },
  { id: 'route18', name: 'Ruta 18' },
  { id: 'fuchsia', name: 'Ciudad Fucsia' },
  { id: 'safari-zone', name: 'Zona Safari' },
  { id: 'route12', name: 'Ruta 12' },
  { id: 'route13', name: 'Ruta 13' },
  { id: 'route14', name: 'Ruta 14' },
  { id: 'route15', name: 'Ruta 15' },
  { id: 'route19', name: 'Ruta 19' },
  { id: 'route20', name: 'Ruta 20' },
  { id: 'seafoam', name: 'Islas Espuma' },
  { id: 'cinnabar', name: 'Isla Canela' },
  { id: 'pokemon-mansion', name: 'Mansión Pokémon' },
  { id: 'route21', name: 'Ruta 21' },
  { id: 'saffron', name: 'Ciudad Azafrán' },
  { id: 'silph-co', name: 'Silph S.A.' },
  { id: 'power-plant', name: 'Central Eléctrica' },
  { id: 'route22', name: 'Ruta 22' },
  { id: 'route23', name: 'Ruta 23' },
  { id: 'victory-road', name: 'Camino Victoria' },
  { id: 'indigo-plateau', name: 'Meseta Añil' },
  { id: 'cerulean-cave', name: 'Cueva Celeste' },
];

export const PLAYER_COLORS = [
  '#6C5CE7', '#00B894', '#E17055', '#0984E3',
  '#D63031', '#FDCB6E', '#E84393', '#00CEC9',
];
