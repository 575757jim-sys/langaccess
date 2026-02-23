import { ArrowLeft } from 'lucide-react';
import { SubcategoryInfo } from '../data/subcategories';

interface SubcategorySelectorProps {
  subcategories: SubcategoryInfo[];
  sectorLabel: string;
  onSelectSubcategory: (subcategoryId: string) => void;
  onBack: () => void;
}

export default function SubcategorySelector({
  subcategories,
  sectorLabel,
  onSelectSubcategory,
  onBack
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
      </div>
    </div>
  );
}
