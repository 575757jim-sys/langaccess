import { ArrowLeft, MessageSquare, HardHat } from 'lucide-react';
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

export default function SubcategorySelector({
  subcategories,
  sectorLabel,
  onSelectSubcategory,
  onBack,
  onOpenTalkTogether,
  onOpenJobSiteTalk,
}: SubcategorySelectorProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            {sectorLabel} Categories
          </h1>
          <p className="text-slate-600">
            Select a category to view relevant phrases
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => onSelectSubcategory(subcategory.id)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group hover:-translate-y-1 duration-200"
            >
              <h2 className="text-xl font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {subcategory.label}
              </h2>
              <p className="text-sm text-slate-500 mt-2">
                View phrases for {subcategory.label.toLowerCase()}
              </p>
            </button>
          ))}
        </div>

        {onOpenTalkTogether && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-300" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Conversation</span>
              <div className="flex-1 h-px bg-slate-300" />
            </div>
            <button
              onClick={onOpenTalkTogether}
              className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group hover:-translate-y-1 duration-200 flex items-center gap-4"
            >
              <MessageSquare className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Talk Together</h2>
                <p className="text-sm text-green-100 font-normal mt-0.5">Live two-way conversation — Teacher &amp; Parent or Student</p>
              </div>
            </button>
          </div>
        )}

        {onOpenJobSiteTalk && (
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-300" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">Live Conversation</span>
              <div className="flex-1 h-px bg-slate-300" />
            </div>
            <button
              onClick={onOpenJobSiteTalk}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-md hover:shadow-xl transition-all p-6 text-left group hover:-translate-y-1 duration-200 flex items-center gap-4"
            >
              <HardHat className="w-8 h-8 flex-shrink-0" />
              <div>
                <h2 className="text-xl font-semibold">Job Site Talk</h2>
                <p className="text-sm text-orange-100 font-normal mt-0.5">Live two-way conversation — Supervisor or Foreman &amp; Worker or Crew</p>
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
