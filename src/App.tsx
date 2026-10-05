/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { TaxResultCard } from './components/TaxResultCard';
import { SalaryManager } from './components/SalaryManager';
import { RentalIncomeManager } from './components/RentalIncomeManager';
import { HouseholdManager } from './components/HouseholdManager';
import { BracketVisualizer } from './components/BracketVisualizer';
import { InvestorOptimization } from './components/InvestorOptimization';
import { ScenarioManager } from './components/ScenarioManager';
import { TaxSummaryReportModal } from './components/TaxSummaryReportModal';
import { SalaryEntry, RentalEntry, HouseholdConfig, Scenario } from './types/tax';
import { calculateTax } from './utils/taxCalculator';
import { Info, HelpCircle } from 'lucide-react';

const DEFAULT_SALARIES: SalaryEntry[] = [
  {
    id: 's_declarant_1',
    beneficiary: 'Déclarant 1',
    label: 'Poste principal (CDI)',
    monthlyGross: 3600,
    months: 12,
    pasRate: 7.5,
  },
  {
    id: 's_declarant_2',
    beneficiary: 'Déclarant 2',
    label: 'Poste principal (CDI)',
    monthlyGross: 2900,
    months: 12,
    pasRate: 5.2,
  },
];

const DEFAULT_RENTALS: RentalEntry[] = [
  {
    id: 'r_initial',
    name: 'Studio locatif centre-ville',
    regime: 'micro',
    grossAnnualRent: 6800,
    deductibleExpenses: 1800,
    withheldPrelevement: 420,
  },
];

const DEFAULT_HOUSEHOLD: HouseholdConfig = {
  maritalStatus: 'married_pacsed',
  childrenCount: 2,
  sharedCustodyCount: 0,
  isolatedParent: false,
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'calculator' | 'brackets' | 'investor' | 'scenarios'>('calculator');
  const [salaries, setSalaries] = useState<SalaryEntry[]>(DEFAULT_SALARIES);
  const [isRentalEnabled, setIsRentalEnabled] = useState<boolean>(true);
  const [rentals, setRentals] = useState<RentalEntry[]>(DEFAULT_RENTALS);
  const [household, setHousehold] = useState<HouseholdConfig>(DEFAULT_HOUSEHOLD);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Calcul dynamique de l'impôt en temps réel
  const activeRentals = isRentalEnabled ? rentals : [];
  const taxResult = useMemo(() => {
    return calculateTax(salaries, activeRentals, household);
  }, [salaries, activeRentals, household]);

  const handleReset = () => {
    setSalaries(DEFAULT_SALARIES);
    setRentals(DEFAULT_RENTALS);
    setIsRentalEnabled(true);
    setHousehold(DEFAULT_HOUSEHOLD);
    showToast('Modèle exemple rétabli avec succès.');
  };

  const handleLoadScenario = (scenario: Scenario) => {
    setSalaries(scenario.salaries);
    setRentals(scenario.rentals);
    setIsRentalEnabled(scenario.rentals.length > 0);
    setHousehold(scenario.household);
    setActiveTab('calculator');
    showToast(`Scénario "${scenario.name}" chargé.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Top Bar conforme au Top Bar Contract */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onReset={handleReset}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Toast notification discrète */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-lg border border-slate-700 animate-fade-in flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Synthèse principale de tête toujours visible */}
        <TaxResultCard
          result={taxResult}
          onViewBrackets={() => setActiveTab('brackets')}
          onViewInvestor={() => setActiveTab('investor')}
        />

        {/* Vue 1 : Calculateur Principal */}
        {activeTab === 'calculator' && (
          <div className="space-y-6">
            {/* 1. Gestion du Foyer & Quotient Familial */}
            <HouseholdManager
              household={household}
              onChange={setHousehold}
            />

            {/* 2. Rémunérations & Salaires pour le couple */}
            <SalaryManager
              salaries={salaries}
              onChange={setSalaries}
            />

            {/* 3. Revenus Fonciers Complémentaires */}
            <RentalIncomeManager
              rentals={rentals}
              isEnabled={isRentalEnabled}
              onToggleEnabled={setIsRentalEnabled}
              onChange={setRentals}
            />
          </div>
        )}

        {/* Vue 2 : Tranches & Barème Officiel */}
        {activeTab === 'brackets' && (
          <BracketVisualizer result={taxResult} />
        )}

        {/* Vue 3 : Espace Optimisation Investisseur */}
        {activeTab === 'investor' && (
          <InvestorOptimization
            result={taxResult}
            rentals={activeRentals}
          />
        )}

        {/* Vue 4 : Scénarios & Comparateur */}
        {activeTab === 'scenarios' && (
          <ScenarioManager
            currentSalaries={salaries}
            currentRentals={activeRentals}
            currentHousehold={household}
            onLoadScenario={handleLoadScenario}
          />
        )}
      </main>

      {/* Pied de page sobre */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">FiscExpert</span>
            <span aria-hidden="true">·</span>
            <span>Simulateur d'impôt sur le revenu français</span>
            <span aria-hidden="true">·</span>
            <span>Barème officiel 2024–2026 (F1419)</span>
          </div>

          <div className="flex items-center gap-4 text-slate-500">
            <span>Défiscalisation & Investissements locatifs</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setIsReportOpen(true)}
              className="text-slate-700 hover:text-slate-900 font-medium underline"
            >
              Éditer le récapitulatif
            </button>
          </div>
        </div>
      </footer>

      {/* Modal Bilan & Export */}
      <TaxSummaryReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={taxResult}
        salaries={salaries}
        rentals={activeRentals}
        household={household}
      />
    </div>
  );
}
