import React from 'react';
import { Layers, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { TaxCalculationResult } from '../types/tax';
import { formatCurrency, formatPercent } from '../utils/taxCalculator';

interface BracketVisualizerProps {
  result: TaxCalculationResult;
}

export const BracketVisualizer: React.FC<BracketVisualizerProps> = ({ result }) => {
  const { incomePerPart, bracketBreakdowns, partsCount, totalGrossIncomeTax, marginalTaxRate } = result;

  // Maximum d'échelle pour la barre visuelle (181 917 ou plus si haut revenu)
  const maxScale = Math.max(120000, incomePerPart * 1.15);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Entête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Barème Progressif & Tranches d'Imposition
            </h2>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              Source : service-public.gouv.fr (F1419)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            L'impôt est calculé tranche par tranche sur le revenu net imposable par part ({formatCurrency(incomePerPart)} pour {partsCount} part{partsCount > 1 ? 's' : ''})
          </p>
        </div>

        {/* Rappel TMI */}
        <div className="flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl shrink-0">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Votre TMI</span>
            <span className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
              {formatPercent(marginalTaxRate)}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 max-w-[130px] border-l border-slate-800 pl-3">
            Taux appliqué à votre dernière tranche de revenu
          </div>
        </div>
      </div>

      {/* Visualisation graphique empilée / jauge progressive */}
      <div>
        <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
          <span className="font-semibold">Progression de votre revenu par part dans les tranches :</span>
          <span className="font-mono font-bold text-slate-900">
            {formatCurrency(incomePerPart)} / part
          </span>
        </div>

        {/* Barre de répartition */}
        <div className="h-6 w-full bg-slate-100 rounded-lg overflow-hidden flex border border-slate-200">
          {bracketBreakdowns.map((bracket) => {
            const widthPct = Math.min(100, Math.max(0, (bracket.taxableAmountPerPart / maxScale) * 100));
            if (widthPct <= 0) return null;

            const bgColors: Record<number, string> = {
              0: 'bg-emerald-500 text-white',
              0.11: 'bg-blue-500 text-white',
              0.30: 'bg-amber-500 text-white',
              0.41: 'bg-orange-500 text-white',
              0.45: 'bg-rose-600 text-white',
            };

            return (
              <div
                key={bracket.id}
                style={{ width: `${widthPct}%` }}
                className={`${bgColors[bracket.rate] || 'bg-slate-600'} h-full flex items-center justify-center text-[10px] font-bold tracking-tight px-1 transition-all overflow-hidden whitespace-nowrap`}
                title={`Tranche ${bracket.rate * 100}% : ${formatCurrency(bracket.taxableAmountPerPart)} imposés`}
              >
                {widthPct > 5 ? `${bracket.rate * 100}%` : ''}
              </div>
            );
          })}
        </div>

        {/* Légende de la barre */}
        <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>0% (jusqu'à 11 600 €)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>11% (11 601 € - 29 579 €)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>30% (29 580 € - 84 577 €)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span>41% (84 578 € - 181 917 €)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
            <span>45% (&gt; 181 917 €)</span>
          </div>
        </div>
      </div>

      {/* Tableau détaillé de calcul tranche par tranche */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 pr-4">Tranche</th>
              <th className="py-2.5 px-4 text-center">Taux</th>
              <th className="py-2.5 px-4 text-right">Revenu dans la tranche (1 part)</th>
              <th className="py-2.5 px-4 text-right">Revenu total foyer ({partsCount} parts)</th>
              <th className="py-2.5 pl-4 text-right">Impôt généré</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bracketBreakdowns.map((bracket) => {
              const isActive = bracket.taxableAmountPerPart > 0;
              const isTMI = bracket.rate === marginalTaxRate && isActive;

              return (
                <tr
                  key={bracket.id}
                  className={`transition-colors ${
                    isTMI
                      ? 'bg-amber-50/60 font-medium'
                      : isActive
                      ? 'hover:bg-slate-50'
                      : 'opacity-50 hover:opacity-80'
                  }`}
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{bracket.label}</span>
                      {isTMI && (
                        <span className="text-[10px] font-bold text-amber-900 bg-amber-200/70 px-1.5 py-0.5 rounded-sm">
                          Votre TMI
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className="font-mono font-bold text-slate-800 tabular-nums">
                      {bracket.rate * 100} %
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {formatCurrency(bracket.taxableAmountPerPart)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono text-slate-700 tabular-nums">
                    {formatCurrency(bracket.taxableAmountPerPart * partsCount)}
                  </td>

                  <td className="py-3 pl-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatCurrency(bracket.taxAmountTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-300 font-bold text-slate-900">
              <td colSpan={4} className="py-3 text-right">
                Total Impôt sur le Revenu Brut (hors prélèvements sociaux) :
              </td>
              <td className="py-3 pl-4 text-right font-mono text-sm text-slate-900 tabular-nums">
                {formatCurrency(totalGrossIncomeTax)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Explication pédagogique sur l'impôt progressif */}
      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2 text-slate-600">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Pourquoi passer dans une tranche supérieure n'augmente pas l'impôt sur l'ensemble de vos revenus ?</span>
        </div>
        <p className="leading-relaxed">
          Le système fiscal français est <strong>progressif</strong> : seule la fraction de votre revenu net imposable qui dépasse le seuil est imposée au taux supérieur.
          Par exemple, si votre revenu par part passe de 29 000 € à 30 000 €, seuls les 421 € situés au-dessus de 29 579 € sont taxés à 30 %. Les premiers 11 600 € restent taxés à 0 %, et les 17 979 € suivants à 11 %.
        </p>
      </div>
    </div>
  );
};
