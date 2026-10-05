import React from 'react';
import { Home, Plus, Trash2, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { RentalEntry } from '../types/tax';
import { formatCurrency, SOCIAL_LEVIES_RATE } from '../utils/taxCalculator';

interface RentalIncomeManagerProps {
  rentals: RentalEntry[];
  isEnabled: boolean;
  onToggleEnabled: (enabled: boolean) => void;
  onChange: (rentals: RentalEntry[]) => void;
}

export const RentalIncomeManager: React.FC<RentalIncomeManagerProps> = ({
  rentals,
  isEnabled,
  onToggleEnabled,
  onChange,
}) => {
  const handleAddProperty = () => {
    const newEntry: RentalEntry = {
      id: 'rent_' + Math.random().toString(36).substring(2, 9),
      name: `Bien locatif ${rentals.length + 1}`,
      regime: 'micro',
      grossAnnualRent: 7200,
      deductibleExpenses: 2000,
      withheldPrelevement: 0,
    };
    onChange([...rentals, newEntry]);
  };

  const handleRemoveProperty = (id: string) => {
    onChange(rentals.filter((r) => r.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<RentalEntry>) => {
    onChange(
      rentals.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  // Agrégats fonciers
  let totalGross = 0;
  let totalTaxable = 0;
  let totalDeductions = 0;
  let totalAcomptes = 0;

  if (isEnabled) {
    rentals.forEach((r) => {
      const g = Math.max(0, r.grossAnnualRent);
      totalGross += g;
      totalAcomptes += Math.max(0, r.withheldPrelevement);

      if (r.regime === 'micro') {
        const abatt = g * 0.3;
        totalDeductions += abatt;
        totalTaxable += Math.max(0, g - abatt);
      } else {
        const exp = Math.max(0, r.deductibleExpenses);
        totalDeductions += exp;
        totalTaxable += Math.max(0, g - exp);
      }
    });
  }

  const socialLevies = totalTaxable * SOCIAL_LEVIES_RATE;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Revenus fonciers complémentaires
              </h2>
              <span className="text-[11px] font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                Optionnel
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Investissement locatif : loyers, régime micro-foncier (30%) ou réel déductible
            </p>
          </div>
        </div>

        {/* Toggle principal d'activation */}
        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => {
                onToggleEnabled(e.target.checked);
                if (e.target.checked && rentals.length === 0) {
                  handleAddProperty();
                }
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
            <span className="ml-2 text-xs font-semibold text-slate-700 select-none">
              {isEnabled ? 'Activé' : 'Désactivé'}
            </span>
          </label>
        </div>
      </div>

      {!isEnabled ? (
        <div className="pt-4 text-center py-6">
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vous n'avez pas activé les revenus fonciers. Activez cette option si vous percevez des loyers issus de biens immobiliers non meublés.
          </p>
          <button
            type="button"
            onClick={() => {
              onToggleEnabled(true);
              if (rentals.length === 0) handleAddProperty();
            }}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-200"
          >
            Activer les revenus fonciers
          </button>
        </div>
      ) : (
        <div className="pt-4 space-y-4">
          {/* Liste des biens locatifs */}
          {rentals.map((property) => {
            const isMicro = property.regime === 'micro';
            const taxable = isMicro
              ? property.grossAnnualRent * 0.7
              : Math.max(0, property.grossAnnualRent - property.deductibleExpenses);

            return (
              <div
                key={property.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200/80">
                  <input
                    type="text"
                    value={property.name}
                    onChange={(e) => handleUpdate(property.id, { name: e.target.value })}
                    className="text-xs font-semibold px-2.5 py-1 bg-white border border-slate-200 rounded-md text-slate-800 min-w-[200px] focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  />

                  <div className="flex items-center gap-2">
                    {/* Choix du régime fiscal */}
                    <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-white text-xs">
                      <button
                        type="button"
                        onClick={() => handleUpdate(property.id, { regime: 'micro' })}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          isMicro
                            ? 'bg-amber-600 text-white font-medium shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Abattement forfaitaire de 30% (jusqu'à 15 000 € de loyers)"
                      >
                        Micro-foncier (30%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(property.id, { regime: 'reel' })}
                        className={`px-2.5 py-1 rounded-md transition-colors ${
                          !isMicro
                            ? 'bg-amber-600 text-white font-medium shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                        title="Déduction des charges réelles engagées"
                      >
                        Régime réel
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProperty(property.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition-colors"
                      title="Supprimer ce bien"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  {/* Loyers bruts annuels */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Loyers bruts annuels encaissés
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="100"
                        value={property.grossAnnualRent || ''}
                        onChange={(e) =>
                          handleUpdate(property.id, {
                            grossAnnualRent: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold text-slate-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                        €
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Total annuel (hors charges locatives)
                    </span>
                  </div>

                  {/* Charges déductibles (si réel) ou abattement (si micro) */}
                  <div>
                    {isMicro ? (
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Abattement forfaitaire 30%
                        </label>
                        <div className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 font-mono font-semibold text-slate-700 tabular-nums text-sm">
                          -{formatCurrency(property.grossAnnualRent * 0.3)}
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Calculé automatiquement par le fisc
                        </span>
                      </div>
                    ) : (
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Charges réelles déductibles
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            step="50"
                            value={property.deductibleExpenses || ''}
                            onChange={(e) =>
                              handleUpdate(property.id, {
                                deductibleExpenses: Math.max(0, parseFloat(e.target.value) || 0),
                              })
                            }
                            className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold text-slate-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-sm"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                            €
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Intérêts emprunt, TF, copro, travaux...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acomptes contemporains de prélèvement */}
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Acomptes PAS déjà prélevés
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="20"
                        value={property.withheldPrelevement || ''}
                        onChange={(e) =>
                          handleUpdate(property.id, {
                            withheldPrelevement: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-full pl-3 pr-8 py-2 rounded-lg border border-slate-300 bg-white font-mono font-semibold text-slate-900 tabular-nums focus:outline-hidden focus:ring-1 focus:ring-slate-900 text-sm"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 font-medium text-slate-400">
                        €
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Prélèvements mensuels effectués par le fisc
                    </span>
                  </div>

                  {/* Résultat net imposable du bien */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 text-[11px]">Revenu net imposable :</span>
                        <span className="font-mono font-bold text-amber-900 tabular-nums">
                          {formatCurrency(taxable)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                        <span>Prélèvements sociaux (17.2%) :</span>
                        <span className="font-mono font-medium text-rose-700 tabular-nums">
                          {formatCurrency(taxable * SOCIAL_LEVIES_RATE)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Régime : {isMicro ? 'Micro (30%)' : 'Réel'}</span>
                      {isMicro && property.grossAnnualRent > 15000 && (
                        <span className="text-rose-600 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> &gt; 15k€ plafond
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleAddProperty}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un autre bien locatif</span>
            </button>

            <div className="text-right text-xs">
              <span className="text-slate-500">Base foncière nette ajoutée au barème : </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                +{formatCurrency(totalTaxable)}
              </span>
            </div>
          </div>

          {/* Synthèse Investisseur Foncier */}
          <div className="p-3.5 rounded-lg bg-amber-50/80 border border-amber-200/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-amber-950">
            <div className="flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Prélèvements Sociaux (CSG/CRDS à 17.2%) :</span>
                <span className="text-amber-800">
                  En France, les revenus fonciers nets ({formatCurrency(totalTaxable)}) subissent en plus de l'IR les prélèvements sociaux à 17.2%, soit <strong>{formatCurrency(socialLevies)}</strong>.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 bg-white/80 px-3 py-1.5 rounded-md border border-amber-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium text-[11px] text-slate-700">
                Acomptes PAS foncier déjà réglés : <span className="font-mono font-bold">{formatCurrency(totalAcomptes)}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
