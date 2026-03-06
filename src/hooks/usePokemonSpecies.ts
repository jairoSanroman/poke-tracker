import { useQuery } from '@tanstack/react-query';

export interface SpeciesEntry {
  id: number;
  name: string;
}

async function fetchAllSpecies(): Promise<SpeciesEntry[]> {
  const res = await fetch('https://pokeapi.co/api/v2/pokemon-species?limit=1025');
  if (!res.ok) throw new Error('Failed to fetch species');
  const data = await res.json();
  return (data.results as { name: string; url: string }[]).map((entry, index) => ({
    id: index + 1,
    name: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
  }));
}

export function usePokemonSpecies() {
  return useQuery({
    queryKey: ['pokemon-species-all'],
    queryFn: fetchAllSpecies,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
