import React, { useState } from 'react';
import { Layers, Plus, BookmarkCheck, ArrowRight, Trash2, Check, Scale } from 'lucide-react';
import { Scenario, SalaryEntry, RentalEntry, HouseholdConfig } from '../types/tax';
import { calculateTax, formatCurrency, formatPercent } from '../utils/taxCalculator';

interface ScenarioManagerProps {
  currentSalaries: SalaryEntry[];
  currentRentals: RentalEntry[];
  currentHousehold: HouseholdConfig;
  onLoadScenario: (scenario: Scenario) => void;
}

export const ScenarioManager: React.FC<ScenarioManagerProps> = ({
  currentSalaries,
  currentRentals,
  currentHousehold,
  onLoadScenario,
}) => {
  const [scenarioName, setScenarioName] = useState('');
  const [savedScenarios, setSavedScenarios] = useState<Scenario[]>([
    {
      id: 'sc_couple_cadres',
      name: 'Couple Cadres + Foncier (2 enfants)',
      createdAt: 'Modèle de référence',
      household: {
        maritalStatus: 'married_pacsed',
        childrenCount: 2,
        sharedCustodyCount: 0,
        isolatedParent: false,
      },
      salaries: [
        {
          id: 's1',
          beneficiary: 'Déclarant 1',
          label: 'Cadre Supérieur CDI',
          monthlyGross: 4500,
          months: 12,
          pasRate: 8.5,
        },
        {
          id: 's2',
          beneficiary: 'Déclarant 2',
          label: 'Responsable Marketing',
          monthlyGross: 3200,
          months: 12,
          pasRate: 5.5,
        },
      ],
      rentals: [
        {
          id: 'r1',
          name: 'T2 Locatif Lyon',
          regime: 'micro',
          grossAnnualRent: 8400,
          deductibleExpenses: 2500,
          withheldPrelevement: 650,
        },
      ],
    },
    {
      id: 'sc_single_cadre',
      name: 'Célibataire sans enfant (TMI 30%)',
      createdAt: 'Modèle',
      household: {
        maritalStatus: 'single',
        childrenCount: 0,
        sharedCustodyCount: 0,
        isolatedParent: false,
      },
      salaries: [
        {
          id: 's_single',
          beneficiary: 'Déclarant 1',
          label: 'Ingénieur Logiciel CDI',
          monthlyGross: 4200,
          months: 12,
          pasRate: 11.2,
        },
      ],
      rentals: [],
    },
  ]);

  const [compareScenarioId, setCompareScenarioId] = useState<string | null>(null);

  const handleSaveCurrent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scenarioName.trim()) return;

    const newScenario: Scenario = {
      id: 'sc_' + Date.now(),
      name: scenarioName.trim(),
      createdAt: new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      salaries: JSON.parse(JSON.stringify(currentSalaries)),
      rentals: JSON.parse(JSON.stringify(currentRentals)),
      household: JSON.parse(JSON.stringify(currentHousehold)),
    };

    setSavedScenarios([newScenario, ...savedScenarios]);
    setScenarioName('');
  };

  const handleDelete = (id: string) => {
    setSavedScenarios(savedScenarios.filter((s) => s.id !== id));
    if (compareScenarioId === id) setCompareScenarioId(null);
  };

  // Calcul du scénario actuel
  const currentResult = calculateTax(currentSalaries, currentRentals, currentHousehold);

  // Calcul du scénario comparé
  const compareScenario = savedScenarios.find((s) => s.id === compareScenarioId);
  const compareResult = compareScenario
    ? calculateTax(compareScenario.salaries, compareScenario.rentals, compareScenario.household)
    : null;

  return (
    <div className="space-y-6">
      {/* Formulaire d'enregistrement */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Gestionnaire de Scénarios Fiscaux
              </h2>
              <p className="text-xs text-slate-500">
                Sauvegardez votre simulation actuelle et comparez plusieurs hypothèses côte à côte
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveCurrent} className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Nom du scénario (ex: Avec nouvel investissement)..."
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white min-w-[240px] focus:outline-hidden focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              disabled={!scenarioName.trim()}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Sauvegarder</span>
            </button>
          </form>
        </div>

        {/* Liste des scénarios enregistrés */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
          {savedScenarios.map((sc) => {
            const scResult = calculateTax(sc.salaries, sc.rentals, sc.household);
            const isComparing = compareScenarioId === sc.id;

            return (
              <div
                key={sc.id}
                className={`p-4 rounded-xl border transition-all ${
                  isComparing
                    ? 'border-indigo-500 bg-indigo-50/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 leading-tight">
                      {sc.name}
                    </h3>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {sc.createdAt}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(sc.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                    title="Supprimer ce scénario"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1 text-xs py-2 border-y border-slate-200/60 my-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Base imposable :</span>
                    <span className="font-mono font-semibold text-slate-800 tabular-nums">
                      {formatCurrency(scResult.totalTaxableIncome)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Impôt total :</span>
                    <span className="font-mono font-bold text-slate-900 tabular-nums">
                      {formatCurrency(scResult.totalFiscalLiability)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">TMI :</span>
                    <span className="font-mono font-semibold text-emerald-700 tabular-nums">
                      {formatPercent(scResult.marginalTaxRate)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Solde net :</span>
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        scResult.isRefund ? 'text-emerald-700' : 'text-slate-900'
                      }`}
                    >
                      {scResult.isRefund ? 'Remboursement ' : 'Reste à payer '}
                      {formatCurrency(Math.abs(scResult.netBalanceDue))}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => onLoadScenario(sc)}
                    className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors text-center"
                  >
                    Charger dans le calculateur
                  </button>

                  <button
                    type="button"
                    onClick={() => setCompareScenarioId(isComparing ? null : sc.id)}
                    className={`py-1.5 px-2.5 text-xs font-semibold rounded-lg border transition-colors ${
                      isComparing
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    {isComparing ? 'Comparé' : 'Comparer'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparateur Côte à Côte si un scénario est sélectionné */}
      {compareScenario && compareResult && (
        <div className="bg-white rounded-xl border border-indigo-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-100">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Comparaison : Simulation Active vs {compareScenario.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setCompareScenarioId(null)}
              className="text-xs text-slate-400 hover:text-slate-700 underline"
            >
              Fermer la comparaison
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-2.5">Indicateur Clé</th>
                  <th className="py-2.5 px-4 text-right">Simulation Active</th>
                  <th className="py-2.5 px-4 text-right">{compareScenario.name}</th>
                  <th className="py-2.5 pl-4 text-right">Écart (&Delta;)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 font-medium text-slate-900">Base imposable globale</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(currentResult.totalTaxableIncome)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(compareResult.totalTaxableIncome)}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono font-bold tabular-nums">
                    {formatCurrency(currentResult.totalTaxableIncome - compareResult.totalTaxableIncome)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-900">Impôt Brut (IR + PS)</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(currentResult.totalFiscalLiability)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(compareResult.totalFiscalLiability)}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono font-bold tabular-nums">
                    {formatCurrency(currentResult.totalFiscalLiability - compareResult.totalFiscalLiability)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-900">Total PAS Déjà Réglé</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(currentResult.totalPASPaid)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatCurrency(compareResult.totalPASPaid)}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono font-bold tabular-nums">
                    {formatCurrency(currentResult.totalPASPaid - compareResult.totalPASPaid)}
                  </td>
                </tr>

                <tr className="bg-slate-50/70 font-semibold">
                  <td className="py-3 text-slate-900">Solde Net Final (Reste à payer / Remboursement)</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {currentResult.isRefund ? '-' : '+'}{formatCurrency(Math.abs(currentResult.netBalanceDue))}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {compareResult.isRefund ? '-' : '+'}{formatCurrency(Math.abs(compareResult.netBalanceDue))}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono font-bold text-indigo-700 tabular-nums">
                    {formatCurrency(currentResult.netBalanceDue - compareResult.netBalanceDue)}
                  </td>
                </tr>

                <tr>
                  <td className="py-3 font-medium text-slate-900">Tranche Marginale (TMI)</td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatPercent(currentResult.marginalTaxRate)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {formatPercent(compareResult.marginalTaxRate)}
                  </td>
                  <td className="py-3 pl-4 text-right font-mono font-bold tabular-nums">
                    {currentResult.marginalTaxRate === compareResult.marginalTaxRate ? 'Identique' : 'Différente'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
