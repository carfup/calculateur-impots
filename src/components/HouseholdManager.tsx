import React, { useState } from 'react';
import { Users, ChevronDown, ChevronUp, Plus, Minus, Info } from 'lucide-react';
import { HouseholdConfig } from '../types/tax';
import { calculateHouseholdParts } from '../utils/taxCalculator';

interface HouseholdManagerProps {
  household: HouseholdConfig;
  onChange: (updated: HouseholdConfig) => void;
}

export const HouseholdManager: React.FC<HouseholdManagerProps> = ({
  household,
  onChange,
}) => {
  const [isDetailedOpen, setIsDetailedOpen] = useState(false);
  const currentParts = calculateHouseholdParts(household);

  const presets = [
    { label: 'Célibataire (1 part)', config: { maritalStatus: 'single' as const, childrenCount: 0, sharedCustodyCount: 0, isolatedParent: false, customParts: undefined } },
    { label: 'Couple (2 parts)', config: { maritalStatus: 'married_pacsed' as const, childrenCount: 0, sharedCustodyCount: 0, isolatedParent: false, customParts: undefined } },
    { label: 'Couple + 1 enf. (2.5 parts)', config: { maritalStatus: 'married_pacsed' as const, childrenCount: 1, sharedCustodyCount: 0, isolatedParent: false, customParts: undefined } },
    { label: 'Couple + 2 enf. (3 parts)', config: { maritalStatus: 'married_pacsed' as const, childrenCount: 2, sharedCustodyCount: 0, isolatedParent: false, customParts: undefined } },
    { label: 'Couple + 3 enf. (4 parts)', config: { maritalStatus: 'married_pacsed' as const, childrenCount: 3, sharedCustodyCount: 0, isolatedParent: false, customParts: undefined } },
  ];

  const handleAdjustParts = (delta: number) => {
    const nextParts = Math.max(1, Math.round((currentParts + delta) * 100) / 100);
    onChange({
      ...household,
      customParts: nextParts,
    });
  };

  const handleResetCustomParts = () => {
    onChange({
      ...household,
      customParts: undefined,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Foyer fiscal & Quotient familial
            </h2>
            <p className="text-xs text-slate-500">
              Détermine la division de vos revenus par le nombre de parts
            </p>
          </div>
        </div>

        {/* Stepper direct de parts */}
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 self-start sm:self-auto">
          <span className="text-xs font-medium text-slate-600 px-2">Parts fiscales :</span>
          <button
            type="button"
            onClick={() => handleAdjustParts(-0.25)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Diminuer de 0.25 part"
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="font-mono font-bold text-sm text-slate-900 px-2 min-w-[3rem] text-center tabular-nums">
            {currentParts}
          </span>

          <button
            type="button"
            onClick={() => handleAdjustParts(0.25)}
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors shadow-2xs"
            title="Augmenter de 0.25 part"
          >
            <Plus className="w-3 h-3" />
          </button>

          {household.customParts !== undefined && (
            <button
              type="button"
              onClick={handleResetCustomParts}
              className="text-[10px] text-slate-500 hover:text-slate-900 underline px-1"
              title="Revenir au calcul automatique"
            >
              Auto
            </button>
          )}
        </div>
      </div>

      {/* Raccourcis / Presets */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700">Configurations courantes :</span>
          <button
            type="button"
            onClick={() => setIsDetailedOpen(!isDetailedOpen)}
            className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <span>{isDetailedOpen ? 'Masquer détails' : 'Personnaliser situation'}</span>
            {isDetailedOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {presets.map((preset) => {
            const isSelected =
              household.customParts === undefined &&
              household.maritalStatus === preset.config.maritalStatus &&
              household.childrenCount === preset.config.childrenCount &&
              household.sharedCustodyCount === preset.config.sharedCustodyCount &&
              household.isolatedParent === preset.config.isolatedParent;

            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onChange(preset.config)}
                className={`px-3 py-2 text-xs text-left rounded-lg border transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 font-semibold shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Détails personnalisés (accordéon) */}
      {isDetailedOpen && (
        <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Situation de couple
            </label>
            <select
              value={household.maritalStatus}
              onChange={(e) =>
                onChange({
                  ...household,
                  maritalStatus: e.target.value as 'single' | 'married_pacsed',
                  customParts: undefined,
                })
              }
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            >
              <option value="single">Célibataire / Union libre (1 part)</option>
              <option value="married_pacsed">Marié(e) ou Pacsé(e) (2 parts)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Enfants à charge exclusive
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                value={household.childrenCount}
                onChange={(e) =>
                  onChange({
                    ...household,
                    childrenCount: Math.max(0, parseInt(e.target.value) || 0),
                    customParts: undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-slate-500 whitespace-nowrap">
                (+0.5 / +1 part)
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Enfants en garde alternée
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="10"
                value={household.sharedCustodyCount}
                onChange={(e) =>
                  onChange({
                    ...household,
                    sharedCustodyCount: Math.max(0, parseInt(e.target.value) || 0),
                    customParts: undefined,
                  })
                }
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 font-mono tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
              <span className="text-slate-500 whitespace-nowrap">
                (+0.25 / +0.5)
              </span>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Cas particuliers
            </label>
            <label className="flex items-center gap-2 py-1 text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={household.isolatedParent}
                onChange={(e) =>
                  onChange({
                    ...household,
                    isolatedParent: e.target.checked,
                    customParts: undefined,
                  })
                }
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Parent isolé (Case T : +0.5 part)</span>
            </label>
          </div>
        </div>
      )}

      {/* Note d'information sobre */}
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
        <span>
          Le barème progressif est appliqué au revenu par part ({currentParts} part{currentParts > 1 ? 's' : ''}), puis l'impôt obtenu est multiplié par {currentParts}.
        </span>
      </div>
    </div>
  );
};
