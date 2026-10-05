import React from 'react';
import { Calculator, PieChart, TrendingUp, Layers, RotateCcw, FileText } from 'lucide-react';

interface NavbarProps {
  activeTab: 'calculator' | 'brackets' | 'investor' | 'scenarios';
  onSelectTab: (tab: 'calculator' | 'brackets' | 'investor' | 'scenarios') => void;
  onReset: () => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onReset,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element brand wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-sm tracking-tight shadow-xs">
              FE
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              FiscExpert
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-mono tracking-wider ml-1">
              BARÈME OFFICIEL
            </span>
          </div>

          {/* Zone 2: Navigation tabs with functional buttons */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => onSelectTab('calculator')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'calculator'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Calculateur</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('brackets')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'brackets'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieChart className="w-3.5 h-3.5" />
              <span>Tranches & TMI</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('investor')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'investor'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Optimisation</span> Investisseur
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('scenarios')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Scénarios</span>
            </button>
          </nav>

          {/* Zone 3: Primary action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReset}
              title="Réinitialiser les données"
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exemple</span>
            </button>

            <button
              type="button"
              onClick={onOpenReport}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Synthèse</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
