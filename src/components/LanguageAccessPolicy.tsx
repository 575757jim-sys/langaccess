import { ArrowLeft, Globe, ShieldCheck, Phone, BookOpen } from 'lucide-react';
import RequestLanguageForm from './RequestLanguageForm';
import { useState } from 'react';

interface LanguageAccessPolicyProps {
  onBack: () => void;
}

export default function LanguageAccessPolicy({ onBack }: LanguageAccessPolicyProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);

  const supportedLanguages = [
    { name: 'Spanish', note: 'Full coverage — all sectors' },
    { name: 'Mandarin', note: 'Audio pronunciation included' },
    { name: 'Cantonese', note: 'Audio pronunciation included' },
    { name: 'Tagalog', note: 'Core phrases available' },
    { name: 'Vietnamese', note: 'Core phrases available' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="sticky top-0 bg-white shadow-md z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-700 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg font-medium">Back</span>
          </button>
          <h2 className="text-3xl font-bold text-slate-800 mt-3">Language Access Policy</h2>
          <p className="text-sm text-slate-500 mt-1">LangAccess Communication Toolkit</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        <section className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="w-7 h-7 text-blue-600 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-slate-800">Statement of Commitment</h3>
          </div>
          <p className="text-slate-700 leading-relaxed mb-4">
            LangAccess is committed to meaningful language access for individuals with limited English proficiency (LEP) across public-sector services including healthcare, education, and construction safety. This toolkit is developed in alignment with California Government Code Section 11135 and Title VI of the Civil Rights Act of 1964.
          </p>
          <p className="text-slate-700 leading-relaxed">
            Our goal is to ensure that no person is denied meaningful access to services, information, or communication due to a language barrier. This toolkit provides a bridge for immediate, point-of-care communication — not a replacement for qualified interpretation.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-7 h-7 text-green-600 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-slate-800">Supported Languages</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supportedLanguages.map((lang) => (
              <div key={lang.name} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-800">{lang.name}</p>
                  <p className="text-sm text-slate-500">{lang.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-amber-50 border border-amber-200 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-7 h-7 text-amber-700 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-amber-900">Important Disclaimer</h3>
          </div>
          <p className="text-amber-900 leading-relaxed mb-3">
            <strong>Certified interpreters are required</strong> for the following situations:
          </p>
          <ul className="space-y-2 text-amber-800">
            {[
              'Medical diagnosis or treatment decisions',
              'Informed consent for procedures or medications',
              'Legal proceedings, contracts, or rights advisements',
              'Mental health assessments and crisis intervention',
              'Immigration proceedings or status determinations',
              'Any situation where miscommunication could cause harm',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-amber-700 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="text-amber-900 mt-4 text-sm leading-relaxed">
            This toolkit is a <strong>communication aid only</strong>. For certified interpretation services, contact your institutional language access coordinator or a qualified interpretation service provider.
          </p>
        </section>

        <section className="bg-white rounded-2xl shadow-md p-8">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-7 h-7 text-blue-600 flex-shrink-0" />
            <h3 className="text-2xl font-bold text-slate-800">Request Additional Language Support</h3>
          </div>
          <p className="text-slate-600 leading-relaxed mb-6">
            Is your community's language not represented? Submit a request below and our editorial team will prioritize content development based on community need and California LEP population data.
          </p>

          {showRequestForm ? (
            <RequestLanguageForm onClose={() => setShowRequestForm(false)} />
          ) : (
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Submit a Language Request
            </button>
          )}
        </section>

        <footer className="text-center text-sm text-slate-400 pb-6">
          LangAccess Editorial Policy v1.0 · Updated {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </footer>
      </div>
    </div>
  );
}
