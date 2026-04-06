import { useState, useEffect } from 'react';
import { ArrowLeft, MessageSquare, HardHat, ChevronRight, GraduationCap, Heart, Layers, Zap, Shield, Stethoscope, BookOpen, MapPin, HelpCircle, AlertTriangle, Award } from 'lucide-react';
import { SubcategoryInfo } from '../data/subcategories';
import { Language } from '../data/phrases';
import { getExploredCount, getTotalEducationPhrases, shouldShowMilestone, dismissMilestone } from '../utils/educationMastery';
import MilestoneNudge from './MilestoneNudge';

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
  situationBg: string;
  situationText: string;
  situationBorder: string;
  Icon: React.ComponentType<{ className?: string }>;
};

interface QuickSituation {
  label: string;
  subcategoryId: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const QUICK_SITUATIONS: Record<string, QuickSituation[]> = {
  Education: [
    { label: 'Classroom Instruction', subcategoryId: 'teacher-support', Icon: BookOpen },
    { label: 'Student Discipline', subcategoryId: 'student-discipline', Icon: Shield },
    { label: 'Parent Outreach', subcategoryId: 'parent-outreach', Icon: MessageSquare },
    { label: 'Special Needs Support', subcategoryId: 'special-needs', Icon: HelpCircle },
  ],
  Healthcare: [
    { label: 'Medical Question', subcategoryId: 'physical-health', Icon: Stethoscope },
    { label: 'Mental Health', subcategoryId: 'mental-health', Icon: HelpCircle },
    { label: 'Emergency Crisis', subcategoryId: 'emergency-crisis', Icon: AlertTriangle },
    { label: 'Dental Health', subcategoryId: 'dental-health', Icon: Heart },
  ],
  Construction: [
    { label: 'Safety Instruction', subcategoryId: 'safety-osha', Icon: Shield },
    { label: 'Injury or Emergency', subcategoryId: 'injury-emergency', Icon: AlertTriangle },
    { label: 'General Worksite', subcategoryId: 'general-worksite', Icon: HardHat },
    { label: 'Directions / Location', subcategoryId: 'general-worksite', Icon: MapPin },
  ],
};

const SECTOR_ACCENT: Record<string, SectorAccentEntry> = {
  Education: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    hoverBorder: 'hover:border-blue-300',
    situationBg: 'bg-blue-600 hover:bg-blue-700',
    situationText: 'text-white',
    situationBorder: 'border-blue-700',
    Icon: GraduationCap,
  },
  Healthcare: {
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
    hoverBorder: 'hover:border-green-300',
    situationBg: 'bg-green-600 hover:bg-green-700',
    situationText: 'text-white',
    situationBorder: 'border-green-700',
    Icon: Heart,
  },
  Construction: {
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
    hoverBorder: 'hover:border-orange-300',
    situationBg: 'bg-orange-600 hover:bg-orange-700',
    situationText: 'text-white',
    situationBorder: 'border-orange-700',
    Icon: HardHat,
  },
};

const DEFAULT_ACCENT: SectorAccentEntry = {
  iconBg: 'bg-slate-100',
  iconColor: 'text-slate-600',
  hoverBorder: 'hover:border-slate-300',
  situationBg: 'bg-slate-700 hover:bg-slate-800',
  situationText: 'text-white',
  situationBorder: 'border-slate-800',
  Icon: Layers,
};

export default function SubcategorySelector({
  subcategories,
  sectorLabel,
  onSelectSubcategory,
  onBack,
  onOpenTalkTogether,
  onOpenJobSiteTalk,
  selectedLanguage,
}: SubcategorySelectorProps) {
  const accent = SECTOR_ACCENT[sectorLabel] || DEFAULT_ACCENT;
  const SectorIcon = accent.Icon;
  const quickSituations = QUICK_SITUATIONS[sectorLabel] || [];

  const [exploredCount, setExploredCount] = useState(0);
  const [totalPhrases, setTotalPhrases] = useState(0);
  const [activeMilestone, setActiveMilestone] = useState<'milestone10' | 'milestone25' | null>(null);

  useEffect(() => {
    if (sectorLabel === 'Education' && selectedLanguage) {
      const count = getExploredCount();
      setExploredCount(count);
      setTotalPhrases(getTotalEducationPhrases(selectedLanguage));
      setActiveMilestone(shouldShowMilestone(count));
    }
  }, [sectorLabel, selectedLanguage]);

  const progressPercentage = totalPhrases > 0 ? Math.round((exploredCount / totalPhrases) * 100) : 0;

  const handleDismissMilestone = () => {
    if (activeMilestone) {
      dismissMilestone(activeMilestone);
      setActiveMilestone(null);
    }
  };

  const handleViewCertificates = () => {
    if (activeMilestone) {
      dismissMilestone(activeMilestone);
      setActiveMilestone(null);
    }
    window.location.href = '/certificate/enroll/education';
  };

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

        {/* Milestone Nudge - Education Only */}
        {sectorLabel === 'Education' && activeMilestone && (
          <MilestoneNudge
            type={activeMilestone}
            onDismiss={handleDismissMilestone}
            onViewCertificates={handleViewCertificates}
          />
        )}

        {/* Mastery Progress - Education Only */}
        {sectorLabel === 'Education' && selectedLanguage && totalPhrases > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-5 border-2 border-blue-200 shadow-sm">
              <div className="flex items-start gap-4">
                {/* Circular Progress Indicator */}
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="white"
                      strokeWidth="6"
                      fill="none"
                      opacity="0.5"
                    />
                    <circle
                      cx="40"
                      cy="40"
                      r="34"
                      stroke="#2563eb"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - progressPercentage / 100)}`}
                      strokeLinecap="round"
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg font-bold text-blue-600">{progressPercentage}%</span>
                  </div>
                </div>

                {/* Progress Info */}
                <div className="flex-1 pt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <Award className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-blue-900">Mastery Progress</h2>
                  </div>
                  <p className="text-blue-700 font-medium mb-2">
                    {exploredCount} of {totalPhrases} phrases explored
                  </p>
                  <p className="text-sm text-blue-600">
                    Keep exploring phrases to build your language skills
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Situations */}
        {quickSituations.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-yellow-500" />
              <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quick Situations</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {quickSituations.map(({ label, subcategoryId, Icon: SitIcon }) => (
                <button
                  key={`${label}-${subcategoryId}`}
                  onClick={() => onSelectSubcategory(subcategoryId)}
                  className={`${accent.situationBg} rounded-2xl p-4 text-left flex items-center gap-3 transition-all duration-150 active:scale-[0.97] shadow-sm`}
                >
                  <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <SitIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white leading-snug">{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* All Categories */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">All Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <h3 className="font-bold text-slate-800 text-base truncate">{subcategory.label}</h3>
                  <p className="text-sm text-slate-400 mt-0.5">View phrases</p>
                </div>
                <ChevronRight className="w-4 h-4 flex-shrink-0 text-slate-300 group-hover:text-slate-500 transition-colors" />
              </button>
            ))}
          </div>
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

        {/* Certificate Track Card - Education Only */}
        {sectorLabel === 'Education' && (
          <div className="mt-8 mb-6">
            <button
              onClick={() => window.location.href = '/certificate/enroll/education'}
              className="w-full bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-left group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                  <Award className="w-6 h-6 text-slate-600 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Keep Building Your Education Spanish
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed mb-3">
                    Explore phrases for free, track your progress, and unlock your certificate when you're ready.
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span>Explore Certificate Track</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
