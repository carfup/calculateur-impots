import React from 'react';
import { Briefcase, Plus, Trash2, Copy, DollarSign, Calendar, Percent, ShieldCheck } from 'lucide-react';
import { SalaryEntry } from '../types/tax';
import { calculateSalaryMetrics, formatCurrency } from '../utils/taxCalculator';

interface SalaryManagerProps {
  salaries: SalaryEntry[];
  onChange: (salaries: SalaryEntry[]) => void;
}

export const SalaryManager: React.FC<SalaryManagerProps> = ({
  salaries,
  onChange,
}) => {
  const handleAddSalary = (beneficiaryName = 'Déclarant 1') => {
    const newSalary: SalaryEntry = {
      id: 'sal_' + Math.random().toString(36).substring(2, 9),
      beneficiary: beneficiaryName,
      label: 'Salaire brut CDI',
      monthlyGross: 3200,
      months: 12,
      pasRate: 7.5,
    };
    onChange([...salaries, newSalary]);
  };

  const handleDuplicate = (entry: SalaryEntry) => {
    const copy: SalaryEntry = {
      ...entry,
      id: 'sal_' + Math.random().toString(36).substring(2, 9),
      label: `${entry.label} (Copie)`,
    };
    onChange([...salaries, copy]);
  };

  const handleRemove = (id: string) => {
    if (salaries.length <= 1) return;
    onChange(salaries.filter((s) => s.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<SalaryEntry>) => {
    onChange(
      salaries.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  // Agrégats strictement basés sur le salaire brut
  let totalGross = 0;
  let totalPAS = 0;

  salaries.forEach((s) => {
    const m = calculateSalaryMetrics(s);
    totalGross += m.grossTotal;
    totalPAS += m.pasPaid;
  });

  const abattement10 = totalGross * 0.10;
  const taxableSalariesBase = totalGross - abattement10;

  const hasDeclarant2 = salaries.some((s) => s.beneficiary.includes('2'));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Salaires bruts & Revenus d'activité
              </h2>
              <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Calcul 100% sur le Brut
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Saisie directe en salaire brut pour chaque personne et calcul automatique de l'abattement de 10%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!hasDeclarant2 && (
            <button
              type="button"
              onClick={() => handleAddSalary('Déclarant 2')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Salaire Déclarant 2 (Conjoint)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleAddSalary(hasDeclarant2 ? 'Déclarant 1' : 'Déclarant 1')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter une rémunération</span>
          </button>
        </div>
      </div>

      {/* Liste des entrées de salaires */}
      <div className="space-y-4 pt-4">
        {salaries.map((entry) => {
          const metrics = calculateSalaryMetrics(entry);
          return (
            <div
              key={entry.id}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Sélecteur de bénéficiaire */}
                  <select
                    value={entry.beneficiary}
                    onChange={(e) => handleUpdate(entry.id, { beneficiary: e.target.value })}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="Déclarant 1">Déclarant 1</option>
                    <option value="Déclarant 2">Déclarant 2 (Conjoint)</option>
                    <option value="Autre rémunération">Autre déclarant</option>
                  </select>

                  {/* Intitulé libre */}
                  <input
                    type="text"
                    value={entry.label}
                    onChange={(e) => handleUpdate(entry.id, { label: e.target.value })}
                    placeholder="ex: Salaire brut CDI, CDD 6 mois..."
                    className="text-xs px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-700 min-w-[200px] focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />
                </div>

                {/* Actions dupliquer / supprimer */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(entry)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition-colors"
                    title="Dupliquer cette ligne de salaire"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {salaries.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemove(entry.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                      title="Supprimer cette ligne"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grille de saisie principale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* 1. Salaire brut mensuel */}
                <div>
                  <label className="font-semibold text-slate-700 flex items-center gap-1 mb-1">
                    <DollarSign className="w-3 h-3 text-slate-400" />
                    <span>Salaire brut mensuel</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={entry.monthlyGross || ''}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          monthlyGross: Math.max(0, parseFloat(e.target.value) || 0),
                        })
                      }
                      className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-sm"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                      € brut
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Montant brut contractuel par mois
                  </span>
                </div>

                {/* 2. Nombre de mois */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Nombre de mois</span>
                    </label>
                    <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                      {entry.months} mois
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="12"
                      step="1"
                      value={entry.months}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          months: parseInt(e.target.value) || 12,
                        })
                      }
                      className="w-full accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={entry.months}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          months: Math.min(12, Math.max(1, parseInt(e.target.value) || 1)),
                        })
                      }
                      className="w-12 py-1 px-1.5 text-center font-mono font-bold border border-slate-300 rounded-md bg-white text-xs tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Ex: 12 mois (année complète), ou période partielle
                  </span>
                </div>

                {/* 3. Taux de prélèvement à la source (%) appliqué au brut */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-medium text-slate-700 flex items-center gap-1">
                      <Percent className="w-3 h-3 text-slate-400" />
                      <span>Taux PAS personnalisé</span>
                    </label>
                    <span className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                      {entry.pasRate}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="0.5"
                      value={entry.pasRate}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          pasRate: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                    />
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={entry.pasRate}
                      onChange={(e) =>
                        handleUpdate(entry.id, {
                          pasRate: Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)),
                        })
                      }
                      className="w-14 py-1 px-1 text-center font-mono font-bold border border-slate-300 rounded-md bg-white text-xs tabular-nums"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Pourcentage prélevé à la source sur le brut
                  </span>
                </div>

                {/* 4. Récapitulatif direct de la ligne */}
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[11px]">Total brut annuel :</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(metrics.grossTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-emerald-700 text-[11px] font-medium">PAS déjà prélevé :</span>
                    <span className="font-mono font-bold text-emerald-700 tabular-nums">
                      {formatCurrency(metrics.pasPaid)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bloc récapitulatif salaires & abattement 10% */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Déduction de 10% sur les salaires bruts
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            La valeur totale de vos salaires bruts annuels ({formatCurrency(totalGross)}) est diminuée de 10% (-{formatCurrency(abattement10)}) pour obtenir la base imposable de <strong>{formatCurrency(taxableSalariesBase)}</strong>.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-5 shrink-0 text-right">
          <div>
            <span className="block text-[11px] text-slate-400">Total salaires bruts</span>
            <span className="font-mono font-bold text-sm text-slate-100 tabular-nums">
              {formatCurrency(totalGross)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-slate-400">Base salariale imposable (90%)</span>
            <span className="font-mono font-bold text-sm text-emerald-400 tabular-nums">
              {formatCurrency(taxableSalariesBase)}
            </span>
          </div>

          <div>
            <span className="block text-[11px] text-slate-400">Total PAS prélevé</span>
            <span className="font-mono font-bold text-sm text-cyan-300 tabular-nums">
              {formatCurrency(totalPAS)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
