import React, { useState } from 'react';
import { X, Printer, Copy, Check, FileText } from 'lucide-react';
import { TaxCalculationResult, SalaryEntry, RentalEntry, HouseholdConfig } from '../types/tax';
import { formatCurrency, formatPercent } from '../utils/taxCalculator';

interface TaxSummaryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: TaxCalculationResult;
  salaries: SalaryEntry[];
  rentals: RentalEntry[];
  household: HouseholdConfig;
}

export const TaxSummaryReportModal: React.FC<TaxSummaryReportModalProps> = ({
  isOpen,
  onClose,
  result,
  salaries,
  rentals,
  household,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const text = `
=== BILAN FISCAL ESTIMATIF - FISCEXPERT ===
Foyer fiscal : ${result.partsCount} part(s) (${household.maritalStatus === 'married_pacsed' ? 'Marié(e)/Pacsé(e)' : 'Célibataire'})

1. REVENUS D'ACTIVITÉ & SALAIRES BRUTS
- Total salaires bruts annuels : ${formatCurrency(result.totalGrossSalaries)}
- Déduction de 10% (frais professionnels) : -${formatCurrency(result.deduction10Pct)}
- Base salariale imposable (90% du brut) : ${formatCurrency(result.taxableSalariesBase)}
- Total prélèvement à la source (PAS) retenu : ${formatCurrency(result.totalSalaryPASPaid)}

2. REVENUS FONCIERS
- Loyers bruts annuels : ${formatCurrency(result.totalRentalGross)}
- Déductions / abattement : -${formatCurrency(result.rentalDeductions)}
- Revenu foncier net imposable : ${formatCurrency(result.rentalTaxableBase)}
- Prélèvements sociaux (17.2%) : ${formatCurrency(result.rentalSocialLevies)}
- Acomptes PAS foncier réglés : ${formatCurrency(result.totalRentalPASPaid)}

3. CALCUL DU BARÈME OFFICIEL
- Base imposable globale : ${formatCurrency(result.totalTaxableIncome)}
- Revenu par part fiscale : ${formatCurrency(result.incomePerPart)}
- Tranche Marginale d'Imposition (TMI) : ${formatPercent(result.marginalTaxRate)}
- Taux moyen d'imposition : ${result.averageTaxRate.toFixed(1)}%
- Impôt sur le revenu brut : ${formatCurrency(result.totalGrossIncomeTax)}
- Prélèvements sociaux foncier : ${formatCurrency(result.totalSocialLevies)}
- Total impôt dû : ${formatCurrency(result.totalFiscalLiability)}

4. SOLDE DÉFINITIF
- Total déjà prélevé à la source (PAS) : ${formatCurrency(result.totalPASPaid)}
- SOLDE : ${result.isRefund ? 'Remboursement de ' : 'Reste à payer de '} ${formatCurrency(Math.abs(result.netBalanceDue))}
==========================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
        {/* Header Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-slate-800" />
            <h3 className="text-base font-bold text-slate-900">
              Synthèse Fiscale Estimative
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimer</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-6 space-y-6 text-xs text-slate-800 print:text-black">
          {/* Foyer fiscal */}
          <div className="flex justify-between items-center pb-3 border-b border-slate-200">
            <div>
              <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                Foyer Fiscal
              </span>
              <span className="font-semibold text-slate-900 text-sm">
                {household.maritalStatus === 'married_pacsed' ? 'Marié(e) ou Pacsé(e)' : 'Célibataire / Union libre'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 uppercase font-semibold text-[10px] block">
                Nombre de parts
              </span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {result.partsCount} part{result.partsCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Salaires */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wider">
              1. Rémunérations & Salaires déclarés
            </h4>
            <table className="w-full text-left divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2 px-3">Bénéficiaire & Libellé</th>
                  <th className="py-2 px-3 text-right">Brut Mensuel</th>
                  <th className="py-2 px-3 text-center">Mois</th>
                  <th className="py-2 px-3 text-right">Total Brut Annuel</th>
                  <th className="py-2 px-3 text-right">Taux PAS</th>
                  <th className="py-2 px-3 text-right">PAS Retenu sur Brut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {salaries.map((s) => {
                  const grossTot = s.monthlyGross * s.months;
                  const pasTot = grossTot * (s.pasRate / 100);

                  return (
                    <tr key={s.id}>
                      <td className="py-2 px-3">
                        <span className="font-medium text-slate-900">{s.beneficiary}</span>
                        <span className="text-slate-400 block text-[10px]">{s.label}</span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrency(s.monthlyGross)}</td>
                      <td className="py-2 px-3 text-center font-mono tabular-nums">{s.months}</td>
                      <td className="py-2 px-3 text-right font-mono font-medium tabular-nums">{formatCurrency(grossTot)}</td>
                      <td className="py-2 px-3 text-right font-mono tabular-nums">{s.pasRate}%</td>
                      <td className="py-2 px-3 text-right font-mono text-emerald-700 font-medium tabular-nums">{formatCurrency(pasTot)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-slate-50 font-semibold border-t border-slate-200">
                <tr>
                  <td colSpan={3} className="py-2 px-3">Total salaires bruts annuels :</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrency(result.totalGrossSalaries)}</td>
                  <td></td>
                  <td className="py-2 px-3 text-right font-mono text-emerald-700 tabular-nums">{formatCurrency(result.totalSalaryPASPaid)}</td>
                </tr>
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-slate-500 font-normal">Déduction forfaitaire de 10% (frais professionnels) :</td>
                  <td className="py-2 px-3 text-right font-mono text-slate-600 tabular-nums">-{formatCurrency(result.deduction10Pct)}</td>
                  <td colSpan={2}></td>
                </tr>
                <tr className="border-t border-slate-200 text-slate-900 font-bold">
                  <td colSpan={3} className="py-2 px-3">Base salariale imposable (90% du brut) :</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">{formatCurrency(result.taxableSalariesBase)}</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Foncier si présent */}
          {result.rentalTaxableBase > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wider">
                2. Revenus fonciers complémentaires
              </h4>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-600">Loyers bruts : <strong>{formatCurrency(result.totalRentalGross)}</strong></span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-slate-600">Déductions : <strong>-{formatCurrency(result.rentalDeductions)}</strong></span>
                  <span className="text-slate-500 mx-2">·</span>
                  <span className="text-amber-900 font-semibold">Net imposable : <strong>{formatCurrency(result.rentalTaxableBase)}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-slate-600">Prélèvements sociaux (17.2%) : </span>
                  <strong className="font-mono text-rose-700">{formatCurrency(result.totalSocialLevies)}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Décomposition barème */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2 tracking-wider">
              3. Détail du calcul selon le barème progressif officiel
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Base Imposable Totale</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(result.totalTaxableIncome)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Revenu par part</span>
                <span className="font-mono font-bold text-slate-900">{formatCurrency(result.incomePerPart)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Tranche Marginale (TMI)</span>
                <span className="font-mono font-bold text-emerald-700">{formatPercent(result.marginalTaxRate)}</span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Taux moyen effectif</span>
                <span className="font-mono font-bold text-indigo-700">{result.averageTaxRate.toFixed(1)}%</span>
              </div>
            </div>

            <table className="w-full text-left divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="py-1.5 px-3">Tranche</th>
                  <th className="py-1.5 px-3 text-center">Taux</th>
                  <th className="py-1.5 px-3 text-right">Par part</th>
                  <th className="py-1.5 px-3 text-right">Foyer ({result.partsCount} parts)</th>
                  <th className="py-1.5 px-3 text-right">Impôt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.bracketBreakdowns.map((b) => (
                  <tr key={b.id} className={b.taxAmountTotal > 0 ? 'font-medium' : 'text-slate-400'}>
                    <td className="py-1.5 px-3">{b.label}</td>
                    <td className="py-1.5 px-3 text-center font-mono">{b.rate * 100}%</td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(b.taxableAmountPerPart)}</td>
                    <td className="py-1.5 px-3 text-right font-mono">{formatCurrency(b.taxableAmountPerPart * result.partsCount)}</td>
                    <td className="py-1.5 px-3 text-right font-mono font-bold text-slate-900">{formatCurrency(b.taxAmountTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Synthèse finale */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400 uppercase tracking-wider block">
                Solde Net à Régulariser
              </span>
              <div className="text-2xl font-mono font-bold">
                {result.isRefund ? 'Remboursement de ' : 'Reste à payer de '} {formatCurrency(Math.abs(result.netBalanceDue))}
              </div>
              <span className="text-[11px] text-slate-300">
                Total impôt dû ({formatCurrency(result.totalFiscalLiability)}) &minus; Total PAS déjà retenu ({formatCurrency(result.totalPASPaid)})
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
