import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import { GameLayout } from '@/components/GameLayout';
import { PlayerBadge } from '@/components/PlayerBadge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PLAYER_COLORS } from '@/data/kanto';
import { Plus, Trash2, Camera, RefreshCw } from 'lucide-react';
import { Player } from '@/types/pokemon';

const AVATAR_POKEMON = [1, 4, 7, 25, 39, 133, 143, 150, 6, 9, 3, 131, 149, 130, 59, 94];

function getRandomAvatar(): string {
  const id = AVATAR_POKEMON[Math.floor(Math.random() * AVATAR_POKEMON.length)];
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`;
}

export default function PlayersPage() {
  const { getActiveRun, activeRunId, addPlayer, removePlayer, updatePlayer } = useGameStore();
  const navigate = useNavigate();
  const run = getActiveRun();
  const [showAdd, setShowAdd] = useState(false);
  const [initials, setInitials] = useState('');
  const [selectedColor, setSelectedColor] = useState(0);
  const [avatarPreview, setAvatarPreview] = useState(getRandomAvatar());
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeRunId) navigate('/');
  }, [activeRunId, navigate]);

  if (!run) return null;

  const handleAdd = () => {
    if (!initials.trim() || !activeRunId) return;
    addPlayer(activeRunId, initials.trim(), avatarPreview);
    setInitials('');
    setAvatarPreview(getRandomAvatar());
    setShowAdd(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (isEdit && editingPlayer && activeRunId) {
        updatePlayer(activeRunId, editingPlayer.id, { avatar: dataUrl });
        setEditingPlayer({ ...editingPlayer, avatar: dataUrl });
      } else {
        setAvatarPreview(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <GameLayout title="Jugadores">
      <div className="space-y-4">
        <button
          onClick={() => { setAvatarPreview(getRandomAvatar()); setShowAdd(true); }}
          className="w-full glass-card p-4 flex items-center gap-3 hover:border-primary/40 transition-all duration-150 active:scale-[0.98]"
        >
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Plus className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-heading font-semibold text-sm">Añadir jugador</span>
        </button>

        {run.players.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-12">No hay jugadores. ¡Añade al menos uno!</p>
        ) : (
          <div className="space-y-3">
            {run.players.map(player => {
              const playerPokemon = run.pokemon.filter(p => p.playerId === player.id);
              const captured = playerPokemon.filter(p => p.status === 'captured' || p.status === 'in_team' || p.status === 'boxed').length;
              const ko = playerPokemon.filter(p => p.status === 'ko').length;

              return (
                <div key={player.id} className="glass-card p-4 flex items-center gap-3 animate-slide-up">
                  <button onClick={() => setEditingPlayer(player)} className="relative group">
                    <PlayerBadge player={player} size="lg" />
                    <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/20 transition-colors flex items-center justify-center">
                      <Camera className="w-4 h-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                  <div className="flex-1">
                    <p className="font-heading font-semibold">{player.initials}</p>
                    <p className="text-xs text-muted-foreground">
                      {captured} capturados · {ko} KO
                    </p>
                  </div>
                  <button
                    onClick={() => removePlayer(run.id, player.id)}
                    className="touch-target w-8 h-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors duration-150 flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add player dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Nuevo jugador</DialogTitle>
          </DialogHeader>
          <form onSubmit={e => { e.preventDefault(); handleAdd(); }} className="space-y-4 pt-2">
            <div className="flex flex-col items-center gap-2">
              <div className="relative group">
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover bg-muted"
                  onError={() => setAvatarPreview(getRandomAvatar())}
                />
                <div className="absolute inset-0 rounded-full bg-foreground/0 group-hover:bg-foreground/30 transition-colors flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => setAvatarPreview(getRandomAvatar())}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background/80 rounded-full"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-background/80 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e)} />
              <p className="text-[10px] text-muted-foreground">Toca para cambiar avatar</p>
            </div>

            <Input
              placeholder="Iniciales (2-3 letras)"
              value={initials}
              onChange={e => setInitials(e.target.value.slice(0, 3))}
              className="rounded-xl text-center text-xl font-heading font-bold uppercase"
              maxLength={3}
              autoFocus
            />
            <div>
              <p className="text-xs text-muted-foreground mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {PLAYER_COLORS.map((color, i) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(i)}
                    className={`w-9 h-9 rounded-full transition-all duration-150 ${
                      selectedColor === i ? 'ring-2 ring-offset-2 ring-offset-background ring-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <button
              type="submit"
              disabled={initials.trim().length < 2}
              className="w-full gradient-primary text-primary-foreground font-semibold py-3 rounded-xl transition-all duration-150 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            >
              Añadir
            </button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit player avatar dialog */}
      <Dialog open={!!editingPlayer} onOpenChange={v => { if (!v) setEditingPlayer(null); }}>
        <DialogContent className="rounded-3xl glass-card-elevated max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-heading">Editar avatar</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="relative group">
                {editingPlayer.avatar ? (
                  <img src={editingPlayer.avatar} alt={editingPlayer.initials} className="w-24 h-24 rounded-full object-cover bg-muted" />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold text-primary-foreground"
                    style={{ backgroundColor: editingPlayer.color }}
                  >
                    {editingPlayer.initials}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!activeRunId) return;
                    const avatar = getRandomAvatar();
                    updatePlayer(activeRunId, editingPlayer.id, { avatar });
                    setEditingPlayer({ ...editingPlayer, avatar });
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                  Aleatorio
                </button>
                <button
                  onClick={() => editFileRef.current?.click()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-all"
                >
                  <Camera className="w-4 h-4" />
                  Subir imagen
                </button>
                <input ref={editFileRef} type="file" accept="image/*" className="hidden" onChange={e => handleFileUpload(e, true)} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </GameLayout>
  );
}
