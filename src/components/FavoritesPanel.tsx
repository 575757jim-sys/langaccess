import { useEffect, useState, useCallback } from 'react';
import { Star, Volume2, Loader2, X, Maximize2, Download } from 'lucide-react';
import { FavoritePhrase, loadFavorites, removeFavorite } from '../utils/favorites';
import { playAudioFromGesture } from '../utils/speech';
import { fetchAllLogs, exportLogsToCSV } from '../utils/interactionLog';
import PointAndSpeak from './PointAndSpeak';
import { Language } from '../data/phrases';

interface FavoritesPanelProps {
  onClose: () => void;
}

export default function FavoritesPanel({ onClose }: FavoritesPanelProps) {
  const [favorites, setFavorites] = useState<FavoritePhrase[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [pointAndSpeak, setPointAndSpeak] = useState<FavoritePhrase | null>(null);
  const [exportingLogs, setExportingLogs] = useState(false);

  useEffect(() => {
    loadFavorites().then(f => {
      setFavorites(f);
      setLoading(false);
    });
  }, []);

  const handlePlay = useCallback((fav: FavoritePhrase) => {
    setPlayingId(fav.id);
    playAudioFromGesture(fav.phraseTranslation, fav.language as Language);
    setTimeout(() => setPlayingId(null), 2500);
  }, []);

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const handleExportLogs = async () => {
    setExportingLogs(true);
    const logs = await fetchAllLogs();
    exportLogsToCSV(logs);
    setExportingLogs(false);
  };

  const grouped = favorites.reduce<Record<string, FavoritePhrase[]>>((acc, fav) => {
    const key = `${fav.sector} / ${fav.language}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(fav);
    return acc;
  }, {});

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <h2 className="text-base font-bold text-slate-800">My Common Phrases</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 px-6 text-center">
              <Star className="w-10 h-10 text-slate-200 mb-3" />
              <p className="text-slate-500 text-sm">No favorites yet.</p>
              <p className="text-slate-400 text-xs mt-1">Tap the star icon next to any phrase to save it here.</p>
            </div>
          ) : (
            <div className="p-4 space-y-5">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 capitalize">{group}</p>
                  <div className="space-y-2">
                    {items.map(fav => (
                      <div
                        key={fav.id}
                        className="bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2 pr-2"
                      >
                        <button
                          onClick={() => handlePlay(fav)}
                          className="flex items-center gap-3 p-3 flex-1 text-left rounded-xl hover:bg-white transition-colors"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${playingId === fav.id ? 'bg-blue-100' : 'bg-blue-600'}`}>
                            {playingId === fav.id
                              ? <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                              : <Volume2 className="w-4 h-4 text-white" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{fav.phraseEnglish}</p>
                            <p className="text-xs text-blue-600 truncate">{fav.phraseTranslation}</p>
                          </div>
                        </button>
                        <button
                          onClick={() => setPointAndSpeak(fav)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 text-slate-400 transition-colors flex-shrink-0"
                          title="Point & Speak"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemove(fav.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-400 transition-colors flex-shrink-0"
                          title="Remove from favorites"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer — admin log export */}
        <div className="border-t border-slate-200 px-5 py-3">
          <button
            onClick={handleExportLogs}
            disabled={exportingLogs}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium transition-colors"
          >
            {exportingLogs
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />}
            Export Interaction Log (CSV)
          </button>
        </div>
      </div>

      {pointAndSpeak && (
        <PointAndSpeak
          english={pointAndSpeak.phraseEnglish}
          translation={pointAndSpeak.phraseTranslation}
          language={pointAndSpeak.language as Language}
          onClose={() => setPointAndSpeak(null)}
        />
      )}
    </>
  );
}
