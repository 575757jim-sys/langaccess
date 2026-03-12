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
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-yellow-50">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">My Common Phrases</h2>
              {favorites.length > 0 && (
                <p className="text-xs text-slate-500">{favorites.length} saved phrase{favorites.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close favorites panel"
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-yellow-100 text-slate-400 transition-colors"
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
              <p className="text-slate-500 text-sm font-medium">No saved phrases yet.</p>
              <p className="text-slate-400 text-xs mt-1 leading-relaxed">Tap the star icon next to any phrase to save it here for quick access.</p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {Object.entries(grouped).map(([group, items]) => (
                <div key={group}>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 capitalize">{group}</p>
                  <div className="space-y-3">
                    {items.map(fav => {
                      const isPlaying = playingId === fav.id;
                      return (
                        <div
                          key={fav.id}
                          className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                        >
                          {/* Large play button row */}
                          <div className="flex items-stretch">
                            <button
                              onClick={() => handlePlay(fav)}
                              className="flex items-center gap-4 p-4 flex-1 text-left group active:bg-slate-50 transition-colors min-w-0"
                            >
                              <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl transition-all duration-150 shadow-sm
                                ${isPlaying
                                  ? 'bg-blue-100'
                                  : 'bg-blue-600 group-hover:bg-blue-700 group-active:scale-95 shadow-blue-200'}`}>
                                {isPlaying
                                  ? <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                  : <Volume2 className="w-5 h-5 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-500 leading-snug mb-0.5 truncate">{fav.phraseEnglish}</p>
                                <p className="text-lg font-bold text-slate-900 leading-tight truncate">{fav.phraseTranslation}</p>
                              </div>
                            </button>

                            {/* Action column */}
                            <div className="flex flex-col border-l border-slate-100 w-11">
                              <button
                                onClick={() => setPointAndSpeak(fav)}
                                className="flex-1 flex items-center justify-center hover:bg-blue-50 transition-colors rounded-tr-2xl group/ps"
                                aria-label="Point and Speak — show fullscreen"
                                title="Point & Speak"
                              >
                                <Maximize2 className="w-3.5 h-3.5 text-slate-300 group-hover/ps:text-blue-500 transition-colors" />
                              </button>
                              <button
                                onClick={() => handleRemove(fav.id)}
                                className="flex-1 flex items-center justify-center hover:bg-red-50 transition-colors border-t border-slate-100 rounded-br-2xl group/rm"
                                aria-label="Remove from favorites"
                                title="Remove from favorites"
                              >
                                <X className="w-3.5 h-3.5 text-slate-300 group-hover/rm:text-red-400 transition-colors" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
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
