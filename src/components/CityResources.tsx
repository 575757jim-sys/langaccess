import { Phone, MapPin, Clock, DollarSign, TrendingDown } from 'lucide-react';
import { CityData, CityFacility } from '../data/cityResources';

interface CityResourcesProps {
  city: CityData;
  hospitalMode: boolean;
  activeCategory: string | null;
  onCategorySelect: (id: string | null) => void;
  categoryLabel: (id: string) => string;
}

function mapsUrl(facility: CityFacility): string {
  const q = encodeURIComponent(`${facility.name} ${facility.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

function formatCurrency(n: number): string {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

const CATEGORY_COLORS: Record<string, string> = {
  shelter: 'border-green-500/40 hover:border-green-400/60',
  food: 'border-amber-500/40 hover:border-amber-400/60',
  medical: 'border-red-500/40 hover:border-red-400/60',
  bathrooms: 'border-cyan-500/40 hover:border-cyan-400/60',
  power: 'border-yellow-500/40 hover:border-yellow-400/60',
  lockers: 'border-orange-500/40 hover:border-orange-400/60',
};

const CATEGORY_BADGE: Record<string, string> = {
  shelter: 'bg-green-500/15 text-green-300',
  food: 'bg-amber-500/15 text-amber-300',
  medical: 'bg-red-500/15 text-red-300',
  bathrooms: 'bg-cyan-500/15 text-cyan-300',
  power: 'bg-yellow-500/15 text-yellow-300',
  lockers: 'bg-orange-500/15 text-orange-300',
};

export default function CityResources({ city, hospitalMode, activeCategory, onCategorySelect, categoryLabel }: CityResourcesProps) {
  const filtered = activeCategory
    ? city.facilities.filter(f => f.category === activeCategory)
    : city.facilities;

  const roi = city.roi;
  const savings = roi.readmission30dCost - roi.annualShelterCost;
  const roiMultiple = (roi.readmission30dCost / roi.shelterReferralCost).toFixed(0);

  return (
    <div className="space-y-4">
      {hospitalMode && (
        <div className="bg-blue-950/60 border border-blue-700/50 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-blue-300" />
            <h3 className="text-blue-200 font-bold text-sm uppercase tracking-widest">Hospital Staff View — {city.label}</h3>
          </div>
          <p className="text-blue-300/70 text-xs leading-relaxed">
            Cost comparison to support the financial case for shelter referrals over repeat ER visits.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4">
              <p className="text-red-300 text-xs font-semibold uppercase tracking-wide mb-1">Single ER Visit</p>
              <p className="text-white text-2xl font-black">{formatCurrency(roi.erVisitCost)}</p>
              <p className="text-red-400/70 text-xs mt-1">avg. per visit</p>
            </div>
            <div className="bg-red-900/30 border border-red-700/40 rounded-xl p-4">
              <p className="text-red-300 text-xs font-semibold uppercase tracking-wide mb-1">30-Day Readmission</p>
              <p className="text-white text-2xl font-black">{formatCurrency(roi.readmission30dCost)}</p>
              <p className="text-red-400/70 text-xs mt-1">avg. uncompensated</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-1">Shelter Referral</p>
              <p className="text-white text-2xl font-black">{formatCurrency(roi.shelterReferralCost)}</p>
              <p className="text-green-400/70 text-xs mt-1">one-time placement cost</p>
            </div>
            <div className="bg-green-900/30 border border-green-700/40 rounded-xl p-4">
              <p className="text-green-300 text-xs font-semibold uppercase tracking-wide mb-1">Annual Shelter Cost</p>
              <p className="text-white text-2xl font-black">{formatCurrency(roi.annualShelterCost)}</p>
              <p className="text-green-400/70 text-xs mt-1">vs. {formatCurrency(savings)} saved</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-blue-900/40 border border-blue-600/40 rounded-xl px-4 py-3">
            <TrendingDown className="w-5 h-5 text-blue-300 flex-shrink-0" />
            <p className="text-blue-200 text-sm">
              A shelter referral costs <strong className="text-white">{roiMultiple}x less</strong> than one 30-day readmission cycle. Shelter placement saves an estimated <strong className="text-white">{formatCurrency(savings)}</strong>/year per patient.
            </p>
          </div>
          <p className="text-blue-400/50 text-xs">Source: {roi.source}</p>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {(['shelter', 'food', 'medical', 'bathrooms', 'power', 'lockers'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => onCategorySelect(activeCategory === cat ? null : cat)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-150 ${
              activeCategory === cat
                ? CATEGORY_BADGE[cat] + ' border-transparent ring-1 ring-white/20'
                : 'bg-gray-900 border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {categoryLabel(cat)}
          </button>
        ))}
        {activeCategory && (
          <button
            onClick={() => onCategorySelect(null)}
            className="text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-700 text-gray-500 hover:text-white transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-600 text-sm py-4 text-center">No facilities in this category for {city.label}.</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((facility, i) => (
            <div
              key={i}
              className={`bg-gray-900 border ${CATEGORY_COLORS[facility.category]} rounded-xl px-5 py-4 transition-all duration-150`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-full mb-2 ${CATEGORY_BADGE[facility.category]}`}>
                    {categoryLabel(facility.category)}
                  </span>
                  <p className="text-white font-bold text-sm leading-snug">{facility.name}</p>
                  {facility.hours && (
                    <p className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      {facility.hours}
                    </p>
                  )}
                  <p className="flex items-start gap-1 text-gray-600 text-xs mt-0.5">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    {facility.address}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <a
                  href={`tel:${facility.phone}`}
                  className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Phone className="w-3.5 h-3.5" />
                  Call
                </a>
                <a
                  href={mapsUrl(facility)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Get Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
