import React, { useState } from 'react';
import { TrendingUp, Calculator, PiggyBank, Building2, ArrowRight, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
import { TaxCalculationResult, RentalEntry } from '../types/tax';
import { formatCurrency, formatPercent, SOCIAL_LEVIES_RATE } from '../utils/taxCalculator';

interface InvestorOptimizationProps {
  result: TaxCalculationResult;
  rentals: RentalEntry[];
}

export const InvestorOptimization: React.FC<InvestorOptimizationProps> = ({
  result,
  rentals,
}) => {
  // Simulateur PER
  const [perContribution, setPerContribution] = useState<number>(3000);

  // Simulateur nouveau loyer ou prime
  const [additionalIncome, setAdditionalIncome] = useState<number>(6000); // 500 € / mois
  const [additionalType, setAdditionalType] = useState<'salary' | 'rental'>('rental');

  const tmi = result.marginalTaxRate; // ex: 0.30
  const perTaxSavings = Math.round(perContribution * tmi);
  const perNetCost = perContribution - perTaxSavings;

  // Fiscalité d'un revenu supplémentaire
  const additionalTaxRate =
    additionalType === 'rental'
      ? tmi + SOCIAL_LEVIES_RATE // TMI + 17.2% sur foncier
      : tmi * 0.90; // TMI avec abattement 10% sur salaire
  const additionalTaxDue = Math.round(additionalIncome * additionalTaxRate);
  const additionalNetInPocket = additionalIncome - additionalTaxDue;

  // Analyse du portefeuille foncier actuel : comparaison Réel vs Micro
  let totalGrossRents = 0;
  let totalActualExpenses = 0;
  rentals.forEach((r) => {
    totalGrossRents += r.grossAnnualRent;
    totalActualExpenses += r.deductibleExpenses;
  });

  const microAbattement = totalGrossRents * 0.30;
  const isRealBetter = totalActualExpenses > microAbattement;
  const diffBase = Math.abs(totalActualExpenses - microAbattement);
  const potentialSavings = Math.round(diffBase * (tmi + SOCIAL_LEVIES_RATE));

  return (
    <div className="space-y-6">
      {/* Introduction Expert Investisseur */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Espace Stratégie & Optimisation Patrimoniale
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">
              Décisions d'investissement adaptées à votre TMI de {formatPercent(tmi)}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Votre Taux Marginal d'Imposition (TMI) détermine précisément combien d'impôt vous paierez sur chaque euro de dividende, de loyer ou de prime supplémentaire, ainsi que l'efficacité de vos leviers de défiscalisation.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 p-4 rounded-xl shrink-0">
            <span className="text-[11px] text-slate-400 block">Fiscalité marginale sur vos loyers :</span>
            <div className="font-mono text-2xl font-bold text-amber-400 tabular-nums">
              {((tmi + SOCIAL_LEVIES_RATE) * 100).toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {formatPercent(tmi)} IR + 17.2% Prélèvements sociaux
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1 : Optimisation PER (Plan d'Épargne Retraite) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Levier PER (Plan d'Épargne Retraite)
              </h3>
              <p className="text-xs text-slate-500">
                Déduisez vos versements directement de votre revenu net imposable
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <label className="font-medium text-slate-700">Versement volontaire simulé :</label>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {formatCurrency(perContribution)}
              </span>
            </div>
            <input
              type="range"
              min="500"
              max="20000"
              step="500"
              value={perContribution}
              onChange={(e) => setPerContribution(parseFloat(e.target.value) || 0)}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>500 €</span>
              <span>5 000 €</span>
              <span>10 000 €</span>
              <span>20 000 €</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <span className="block text-[11px] text-emerald-800 font-medium">
                Économie d'impôt immédiate
              </span>
              <span className="font-mono font-bold text-lg text-emerald-900 tabular-nums">
                -{formatCurrency(perTaxSavings)}
              </span>
              <span className="block text-[10px] text-emerald-700 mt-1">
                = {formatCurrency(perContribution)} &times; {formatPercent(tmi)} (votre TMI)
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="block text-[11px] text-slate-600 font-medium">
                Effort réel d'épargne net
              </span>
              <span className="font-mono font-bold text-lg text-slate-900 tabular-nums">
                {formatCurrency(perNetCost)}
              </span>
              <span className="block text-[10px] text-slate-500 mt-1">
                Pour {formatCurrency(perContribution)} capitalisés sur votre contrat
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 text-[11px] text-slate-600 border border-slate-200/80">
            {tmi >= 0.30 ? (
              <p>
                <strong className="text-slate-900">Conseil investisseur :</strong> Avec une TMI de {formatPercent(tmi)}, le PER est particulièrement rentable à l'entrée. Vous financez {((perTaxSavings / perContribution) * 100).toFixed(0)}% de votre épargne grâce à l'économie fiscale.
              </p>
            ) : (
              <p>
                <strong className="text-slate-900">Conseil investisseur :</strong> À 11% ou 0% de TMI, le PER offre peu d'avantage fiscal immédiat. Privilégiez plutôt une Assurance-Vie ou un PEA pour conserver votre liquidité sans blocage.
              </p>
            )}
          </div>
        </div>

        {/* Module 2 : Fiscalité marginale sur les nouveaux revenus */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Simulateur de Revenu Additionnel
              </h3>
              <p className="text-xs text-slate-500">
                Que vous reste-t-il net en poche sur une prime ou un nouvel investissement locatif ?
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Type de revenu :</label>
              <select
                value={additionalType}
                onChange={(e) => setAdditionalType(e.target.value as 'salary' | 'rental')}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-medium text-slate-800"
              >
                <option value="rental">Revenus fonciers (loyers nets)</option>
                <option value="salary">Augmentation / Prime salaire</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Montant brut annuel :</label>
              <input
                type="number"
                min="500"
                step="500"
                value={additionalIncome}
                onChange={(e) => setAdditionalIncome(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-slate-900 tabular-nums"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Montant brut perçu :</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                +{formatCurrency(additionalIncome)}
              </span>
            </div>

            <div className="flex items-center justify-between text-rose-600">
              <span>
                Impôt prélevé ({additionalType === 'rental' ? `${(additionalTaxRate * 100).toFixed(1)}% (TMI + PS 17.2%)` : `${(additionalTaxRate * 100).toFixed(1)}% (TMI après 10%)`}) :
              </span>
              <span className="font-mono font-bold tabular-nums">
                -{formatCurrency(additionalTaxDue)}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-bold text-slate-900 text-sm">
              <span>Reste net dans votre poche :</span>
              <span className="font-mono text-emerald-700 tabular-nums">
                {formatCurrency(additionalNetInPocket)} ({(additionalNetInPocket / (additionalIncome || 1) * 100).toFixed(1)}%)
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-amber-50 text-[11px] text-amber-900 border border-amber-200">
            {additionalType === 'rental' ? (
              <p>
                <strong>Alerte fiscalité foncière :</strong> Sur <strong>{formatCurrency(additionalIncome)}</strong> de loyers nets, l'État prélèvera <strong>{formatCurrency(additionalTaxDue)}</strong> (IR + CSG/CRDS). C'est pourquoi le régime meublé (LMNP au réel amortissable) ou le déficit foncier sont souvent recommandés aux investisseurs dans une TMI de 30% ou plus.
              </p>
            ) : (
              <p>
                <strong>Sur votre salaire :</strong> L'abattement automatique de 10% pour frais professionnels réduit la base imposable de votre prime de 10% avant application de votre TMI.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Module 3 : Arbitrage Micro-foncier vs Régime Réel pour vos biens existants */}
      {rentals.length > 0 && totalGrossRents > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Audit de votre régime fiscal foncier actuel</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Total loyers déclarés</span>
              <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                {formatCurrency(totalGrossRents)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Abattement forfaitaire 30% (Micro) = {formatCurrency(microAbattement)}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Total charges réelles saisies</span>
              <span className="font-mono font-bold text-base text-slate-900 tabular-nums">
                {formatCurrency(totalActualExpenses)}
              </span>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Ratio de charges = {((totalActualExpenses / (totalGrossRents || 1)) * 100).toFixed(1)}% des loyers
              </span>
            </div>

            <div className={`p-3 rounded-lg border ${isRealBetter ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-blue-50 border-blue-200 text-blue-950'}`}>
              <span className="block font-semibold">
                {isRealBetter ? 'Régime Réel conseillé' : 'Micro-foncier suffisant'}
              </span>
              <span className="font-mono font-bold text-sm tabular-nums block mt-1">
                Gain fiscal estimé : {formatCurrency(potentialSavings)} / an
              </span>
              <span className="text-[10px] block mt-0.5 opacity-80">
                {isRealBetter
                  ? `Vos charges réelles (${formatCurrency(totalActualExpenses)}) dépassent l'abattement de 30% (${formatCurrency(microAbattement)}).`
                  : `Vos charges réelles sont inférieures aux 30% d'abattement automatique.`}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
