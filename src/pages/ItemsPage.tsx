import { GameLayout } from '@/components/GameLayout';
import { Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { useEffect } from 'react';

export default function ItemsPage() {
  const { activeRunId } = useGameStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  return (
    <GameLayout title="Objetos">
      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-heading font-semibold">Inventario</p>
          <p className="text-sm text-muted-foreground mt-1">Próximamente podrás gestionar objetos aquí.</p>
        </div>
      </div>
    </GameLayout>
  );
}
