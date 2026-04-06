import { X, Award, Sparkles } from 'lucide-react';

interface MilestoneNudgeProps {
  type: 'milestone10' | 'milestone25';
  onDismiss: () => void;
  onViewCertificates: () => void;
}

export default function MilestoneNudge({ type, onDismiss, onViewCertificates }: MilestoneNudgeProps) {
  if (type === 'milestone10') {
    return (
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-4 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-10">
            <Sparkles className="w-24 h-24 text-white" />
          </div>

          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm leading-snug">
                  You're building real Education Spanish skills. Save your progress?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onViewCertificates}
                className="bg-white text-blue-600 px-4 py-2 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-all duration-150 active:scale-95 whitespace-nowrap"
              >
                Explore Certificate Track
              </button>
              <button
                onClick={onDismiss}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Award className="w-32 h-32 text-white" />
        </div>
        <div className="absolute bottom-0 left-0 opacity-10">
          <Sparkles className="w-28 h-28 text-white" />
        </div>

        <div className="relative">
          <button
            onClick={onDismiss}
            className="absolute -top-2 -right-2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-bold text-white mb-2">
                You're making strong progress
              </h3>
              <p className="text-blue-100 leading-relaxed">
                Continue learning and unlock your professional certificate track.
              </p>
            </div>
          </div>

          <button
            onClick={onViewCertificates}
            className="w-full bg-white text-blue-700 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all duration-150 active:scale-[0.98] shadow-lg"
          >
            View Certificate Options
          </button>
        </div>
      </div>
    </div>
  );
}
