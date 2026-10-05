export interface SalaryEntry {
  id: string;
  beneficiary: string; // e.g. "Déclarant 1", "Déclarant 2"
  label: string; // e.g. "Poste principal (CDI)", "Prime annuelle", "Activité secondaire"
  monthlyGross: number; // Salaire brut mensuel
  months: number; // Nombre de mois (1 - 12)
  pasRate: number; // Pourcentage de prélèvement à la source (%) appliqué au brut
}

export type RentalRegime = 'micro' | 'reel';

export interface RentalEntry {
  id: string;
  name: string; // e.g. "Studio Paris 11", "T3 Lyon Saxe"
  regime: RentalRegime;
  grossAnnualRent: number; // Loyers bruts annuels
  deductibleExpenses: number; // Charges déductibles (intérêts emprunt, taxe foncière, travaux, assurances)
  withheldPrelevement: number; // Acomptes contemporains déjà prélevés par le fisc
}

export interface HouseholdConfig {
  maritalStatus: 'single' | 'married_pacsed';
  childrenCount: number;
  sharedCustodyCount: number; // Enfants garde alternée
  isolatedParent: boolean; // Parent isolé
  customParts?: number; // Surcharge manuelle du nombre de parts
}

export interface BracketDetail {
  id: number;
  label: string;
  min: number;
  max: number | null;
  rate: number; // 0, 0.11, 0.30, 0.41, 0.45
  taxableAmountPerPart: number;
  taxAmountPerPart: number;
  taxAmountTotal: number;
}

export interface TaxCalculationResult {
  // Salaires strictement basés sur le brut
  totalGrossSalaries: number; // Total des salaires bruts annuels
  deduction10Pct: number; // Abattement forfaitaire de 10% calculé sur le brut
  taxableSalariesBase: number; // Salaires bruts - 10% (90% du total brut)
  totalSalaryPASPaid: number; // Total déjà prélevé à la source sur les salaires bruts

  // Revenus fonciers
  totalRentalGross: number;
  rentalTaxableBase: number;
  rentalDeductions: number;
  rentalSocialLevies: number; // Prélèvements sociaux de 17.2%
  totalRentalPASPaid: number;

  // Global
  totalTaxableIncome: number; // Base imposable totale = (Salaires bruts * 0.90) + Foncier imposable
  partsCount: number; // Nombre de parts fiscales
  incomePerPart: number; // Base imposable / Nombre de parts

  // Calcul barème
  bracketBreakdowns: BracketDetail[];
  grossIncomeTaxPerPart: number;
  totalGrossIncomeTax: number; // Impôt sur le revenu brut total

  // Prélèvements sociaux totaux
  totalSocialLevies: number;

  // Prélèvements à la source totaux (PAS)
  totalPASPaid: number;

  // Total impôt + prélèvements sociaux
  totalFiscalLiability: number; // IR + PS

  // Net settlement (Solde)
  netBalanceDue: number; // > 0 = Reste à payer, < 0 = Remboursement
  isRefund: boolean;

  // Indicateurs clés
  marginalTaxRate: number; // Taux Marginal d'Imposition (TMI)
  averageTaxRate: number; // Taux d'imposition effectif moyen
  nextBracketDistance: number | null; // Distance en € avant de basculer dans la tranche supérieure
}

export interface Scenario {
  id: string;
  name: string;
  createdAt: string;
  salaries: SalaryEntry[];
  rentals: RentalEntry[];
  household: HouseholdConfig;
}
