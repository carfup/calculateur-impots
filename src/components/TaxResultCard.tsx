import React from 'react';
import { ArrowUpRight, ArrowDownRight, Layers, HelpCircle, Wallet, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { TaxCalculationResult } from '../types/tax';
import { formatCurrency, formatPercent } from '../utils/taxCalculator';

interface TaxResultCardProps {
  result: TaxCalculationResult;
  onViewBrackets: () => void;
  onViewInvestor: () => void;
}

export const TaxResultCard: React.FC<TaxResultCardProps> = ({
  result,
  onViewBrackets,
  onViewInvestor,
}) => {
  const isRefund = result.isRefund;
  const balanceAbs = Math.abs(result.netBalanceDue);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Banner : Le Solde Final (Reste à payer OU Remboursement) */}
      <div
        className={`p-6 border-b transition-colors ${
          isRefund
            ? 'bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-emerald-200'
            : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isRefund ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                Solde Net Définitif
              </span>
              <span
                className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                  isRefund
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/30'
                }`}
              >
                Après déduction du prélèvement à la source (PAS)
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h1
                className={`text-3xl sm:text-4xl font-extrabold tracking-tight font-mono tabular-nums ${
                  isRefund ? 'text-emerald-700' : 'text-white'
                }`}
              >
                {formatCurrency(balanceAbs)}
              </h1>
              <span
                className={`text-sm sm:text-base font-semibold ${
                  isRefund ? 'text-emerald-800' : 'text-slate-200'
                }`}
              >
                {isRefund ? 'à vous faire rembourser' : 'de reste à payer au fisc'}
              </span>
            </div>

            <p
              className={`text-xs mt-1.5 max-w-xl ${
                isRefund ? 'text-emerald-700' : 'text-slate-400'
              }`}
            >
              {isRefund
                ? `Vos prélèvements à la source (${formatCurrency(result.totalPASPaid)}) dépassent le total de votre impôt calculé (${formatCurrency(result.totalFiscalLiability)}). L'administration fiscale vous versera la différence à l'été.`
                : `Vos prélèvements à la source (${formatCurrency(result.totalPASPaid)}) sont inférieurs à votre impôt total dû (${formatCurrency(result.totalFiscalLiability)}). Le solde sera prélevé par le fisc à l'automne.`}
            </p>
          </div>

          {/* Badges TMI & Taux effectif */}
          <div className="flex sm:flex-row md:flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onViewBrackets}
              className={`px-3.5 py-2 rounded-xl text-left border transition-all ${
                isRefund
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-800/90 border-slate-700 hover:border-slate-600 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">Tranche Marginale (TMI)</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-mono font-bold text-lg text-emerald-400 tabular-nums">
                {formatPercent(result.marginalTaxRate)}
              </div>
            </button>

            <button
              type="button"
              onClick={onViewInvestor}
              className={`px-3.5 py-2 rounded-xl text-left border transition-all ${
                isRefund
                  ? 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  : 'bg-slate-800/90 border-slate-700 hover:border-slate-600 text-white'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] text-slate-400">Taux Moyen Effectif</span>
                <Layers className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="font-mono font-bold text-lg text-indigo-400 tabular-nums">
                {result.averageTaxRate.toFixed(1)}%
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Grille détaillée des montants clés */}
      <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        {/* 1. Base Imposable Totale */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Scale className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Base Imposable Globale</span>
          </div>
          <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
            {formatCurrency(result.totalTaxableIncome)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Salaires bruts &minus; 10% : {formatCurrency(result.taxableSalariesBase)}
            {result.rentalTaxableBase > 0 && (
              <> · Foncier : +{formatCurrency(result.rentalTaxableBase)}</>
            )}
          </div>
        </div>

        {/* 2. Quotient familial */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Revenu par part</span>
          </div>
          <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
            {formatCurrency(result.incomePerPart)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Calculé sur {result.partsCount} part{result.partsCount > 1 ? 's' : ''} fiscales
          </div>
        </div>

        {/* 3. Total Impôt Brut (IR + PS) */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Total Impôt Théorique</span>
          </div>
          <div className="font-mono font-bold text-base text-slate-900 tabular-nums">
            {formatCurrency(result.totalFiscalLiability)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            IR : {formatCurrency(result.totalGrossIncomeTax)}
            {result.totalSocialLevies > 0 && (
              <> · PS (17.2%) : {formatCurrency(result.totalSocialLevies)}</>
            )}
          </div>
        </div>

        {/* 4. Total Prélèvement à la source */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center gap-1.5 text-slate-500 mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-medium">Total Déjà Retenu (PAS)</span>
          </div>
          <div className="font-mono font-bold text-base text-emerald-700 tabular-nums">
            {formatCurrency(result.totalPASPaid)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Salaires : {formatCurrency(result.totalSalaryPASPaid)}
            {result.totalRentalPASPaid > 0 && (
              <> · Foncier : {formatCurrency(result.totalRentalPASPaid)}</>
            )}
          </div>
        </div>
      </div>

      {/* Alerte / Indicateur de proximité de tranche */}
      {result.nextBracketDistance !== null && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">
                Marge avant bascule dans la tranche supérieure :
              </span>
              <span className="text-slate-600">
                Il vous reste{' '}
                <strong className="font-mono text-slate-900 tabular-nums">
                  {formatCurrency(result.nextBracketDistance)}
                </strong>{' '}
                de revenu global avant d'atteindre la tranche suivante.
              </span>
            </div>
            <button
              type="button"
              onClick={onViewInvestor}
              className="text-indigo-600 hover:text-indigo-800 font-semibold underline whitespace-nowrap ml-2"
            >
              Simuler défiscalisation (PER) &rarr;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
