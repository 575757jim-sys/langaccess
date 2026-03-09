import { ArrowLeft, MessageSquare, HardHat, ChevronRight, GraduationCap, Heart, Layers } from 'lucide-react';
import { SubcategoryInfo } from '../data/subcategories';
import { Language } from '../data/phrases';

interface SubcategorySelectorProps {
  subcategories: SubcategoryInfo[];
  sectorLabel: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  onBack: () => void;
  onOpenTalkTogether?: () => void;
  onOpenJobSiteTalk?: () => void;
  selectedLanguage?: Language | null;
}

type SectorAccentEntry = {
  iconBg: string;
  iconColor: string;
  hoverBorder: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const SECTOR_ACCENT: Record<string, SectorAccentEntry> = {
  Education: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300',
    Icon: GraduationCap,
  },
  Healthcare: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBorder: 'hover:border-green-300',
    Icon: Heart,
  },
  Construction: {
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBorder: 'hover:border-orange-300',
    Icon: HardHat,
  },
};

const DEFAULT_ACCENT: SectorAccentEntry = {
  iconBg: 'bg-slate-100',
  iconColor: 'text-slate-600',
  hoverBorder: 'hover:border-slate-300',
  Icon: Layers,
};

export default function SubcategorySelector({
  subcategories,
  sectorLabel,
  onSelectSubcategory,
  onBack,
  onOpenTalkTogether,
  onOpenJobSiteTalk,
}: SubcategorySelectorProps) {
  const accent = SECTOR_ACCENT[sectorLabel] || DEFAULT_ACCENT;
  const SectorIcon = accent.Icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className={`w-7 h-7 ${accent.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <SectorIcon className={`w-4 h-4 ${accent.iconColor}`} />
          </div>
          <span className="text-lg font-bold text-slate-800 tracking-tight">{sectorLabel}</span>
          <span className="text-slate-300 text-lg font-light">/</span>
          <span className="text-sm font-medium text-slate-500">Categories</span>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">{sectorLabel} Categories</h1>
          <p className="text-slate-500 text-sm">Select a category to view relevant communication phrases.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          {subcategories.map((subcategory, idx) => (
            <button
              key={subcategory.id}
              onClick={() => onSelectSubcategory(subcategory.id)}
              className={`group bg-white border-2 border-slate-100 ${accent.hoverBorder} rounded-2xl p-5 text-left shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-4`}
            >
              <div className={`w-10 h-10 ${accent.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${accent.iconColor}`}>
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 text-base truncate">{subcategory.label}</h2>
                <p className="text-sm text-slate-400 mt-0.5">View phrases</p>
              </div>
              <ChevronRight className={`w-4 h-4 flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors`} />
            </button>
          ))}
        </div>

        {onOpenTalkTogether && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Conversation</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <button
              onClick={onOpenTalkTogether}
              className="w-full bg-green-600 hover:bg-green-500 text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-base font-bold">Talk Together</h2>
                <p className="text-sm text-green-100 mt-0.5">Live two-way conversation — Teacher &amp; Parent or Student</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
            </button>
          </div>
        )}

        {onOpenJobSiteTalk && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Conversation</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <button
              onClick={onOpenJobSiteTalk}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] flex items-center gap-4"
            >
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center flex-shrink-0">
                <HardHat className="w-6 h-6" />
              </div>
              <div className="text-left flex-1">
                <h2 className="text-base font-bold">Job Site Talk</h2>
                <p className="text-sm text-orange-100 mt-0.5">Live two-way conversation — Supervisor or Foreman &amp; Worker or Crew</p>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 flex-shrink-0" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
