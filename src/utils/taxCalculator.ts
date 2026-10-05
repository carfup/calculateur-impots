import {
  BracketDetail,
  HouseholdConfig,
  RentalEntry,
  SalaryEntry,
  TaxCalculationResult,
} from '../types/tax';

export const OFFICIAL_TAX_BRACKETS = [
  { id: 1, label: "Jusqu'à 11 600 €", min: 0, max: 11600, rate: 0 },
  { id: 2, label: 'De 11 601 € à 29 579 €', min: 11600, max: 29579, rate: 0.11 },
  { id: 3, label: 'De 29 580 € à 84 577 €', min: 29579, max: 84577, rate: 0.30 },
  { id: 4, label: 'De 84 578 € à 181 917 €', min: 84577, max: 181917, rate: 0.41 },
  { id: 5, label: 'Au-delà de 181 917 €', min: 181917, max: null, rate: 0.45 },
];

export const SOCIAL_LEVIES_RATE = 0.172; // 17.2% CSG/CRDS sur les revenus du patrimoine/foncier

/**
 * Calcul du nombre de parts fiscales selon la composition du foyer
 */
export function calculateHouseholdParts(config: HouseholdConfig): number {
  if (config.customParts && config.customParts > 0) {
    return config.customParts;
  }

  let parts = config.maritalStatus === 'married_pacsed' ? 2 : 1;

  // Enfants à charge classique
  const children = Math.max(0, config.childrenCount);
  if (children === 1) {
    parts += 0.5;
  } else if (children === 2) {
    parts += 1.0;
  } else if (children >= 3) {
    parts += 1.0 + (children - 2) * 1.0;
  }

  // Garde alternée (0.25 pour les 2 premiers, 0.5 ensuite)
  const shared = Math.max(0, config.sharedCustodyCount);
  for (let i = 1; i <= shared; i++) {
    const totalOrder = children + i;
    parts += totalOrder <= 2 ? 0.25 : 0.5;
  }

  // Parent isolé (+0.5 part sous condition)
  if (config.isolatedParent && config.maritalStatus === 'single' && (children > 0 || shared > 0)) {
    parts += 0.5;
  }

  return Math.round(parts * 100) / 100;
}

/**
 * Calcul des montants annuels pour une ligne de salaire basés strictement sur le BRUT
 */
export function calculateSalaryMetrics(salary: SalaryEntry) {
  const grossTotal = Math.max(0, salary.monthlyGross * salary.months);
  const pasRatio = Math.max(0, Math.min(100, salary.pasRate)) / 100;
  const pasPaid = grossTotal * pasRatio;

  return {
    grossTotal,
    pasPaid,
  };
}

/**
 * Moteur principal de calcul de l'impôt sur le revenu
 * Règle demandée : la base imposable salariale est calculée sur la valeur totale des salaires bruts annuels - 10%
 */
export function calculateTax(
  salaries: SalaryEntry[],
  rentals: RentalEntry[],
  household: HouseholdConfig
): TaxCalculationResult {
  // 1. Salaires basés strictement sur le BRUT
  let totalGrossSalaries = 0;
  let totalSalaryPASPaid = 0;

  salaries.forEach((s) => {
    const { grossTotal, pasPaid } = calculateSalaryMetrics(s);
    totalGrossSalaries += grossTotal;
    totalSalaryPASPaid += pasPaid;
  });

  // Règle demandée : retirer 10% sur les salaires bruts
  const deduction10Pct = totalGrossSalaries * 0.1;
  const taxableSalariesBase = Math.max(0, totalGrossSalaries - deduction10Pct);

  // 2. Revenus fonciers
  let totalRentalGross = 0;
  let rentalTaxableBase = 0;
  let rentalDeductions = 0;
  let totalRentalPASPaid = 0;

  rentals.forEach((r) => {
    const gross = Math.max(0, r.grossAnnualRent);
    totalRentalGross += gross;
    totalRentalPASPaid += Math.max(0, r.withheldPrelevement);

    if (r.regime === 'micro') {
      // Abattement forfaitaire de 30%
      const abattement = gross * 0.3;
      rentalDeductions += abattement;
      rentalTaxableBase += Math.max(0, gross - abattement);
    } else {
      // Régime réel
      const expenses = Math.max(0, r.deductibleExpenses);
      const taxable = Math.max(0, gross - expenses);
      rentalDeductions += expenses;
      rentalTaxableBase += taxable;
    }
  });

  const rentalSocialLevies = rentalTaxableBase * SOCIAL_LEVIES_RATE;

  // 3. Base imposable globale = (Salaires bruts * 0.90) + Foncier imposable
  const totalTaxableIncome = Math.round(taxableSalariesBase + rentalTaxableBase);
  const partsCount = calculateHouseholdParts(household);
  const incomePerPart = partsCount > 0 ? totalTaxableIncome / partsCount : totalTaxableIncome;

  // 4. Calcul de l'impôt brut selon les tranches officielles
  const bracketBreakdowns: BracketDetail[] = [];
  let grossIncomeTaxPerPart = 0;
  let marginalTaxRate = 0;
  let nextBracketDistance: number | null = null;

  for (let i = 0; i < OFFICIAL_TAX_BRACKETS.length; i++) {
    const b = OFFICIAL_TAX_BRACKETS[i];
    let taxableAmountInBracket = 0;

    if (incomePerPart > b.min) {
      if (b.max === null) {
        taxableAmountInBracket = incomePerPart - b.min;
      } else {
        taxableAmountInBracket = Math.min(incomePerPart, b.max) - b.min;
      }
    }

    taxableAmountInBracket = Math.max(0, taxableAmountInBracket);
    const taxAmountPerPart = taxableAmountInBracket * b.rate;
    const taxAmountTotal = taxAmountPerPart * partsCount;

    grossIncomeTaxPerPart += taxAmountPerPart;

    if (taxableAmountInBracket > 0) {
      marginalTaxRate = b.rate;
    }

    // Calcul de la distance à la prochaine tranche si on se trouve dans celle-ci
    if (b.max !== null && incomePerPart >= b.min && incomePerPart < b.max) {
      nextBracketDistance = Math.round((b.max - incomePerPart) * partsCount);
    }

    bracketBreakdowns.push({
      id: b.id,
      label: b.label,
      min: b.min,
      max: b.max,
      rate: b.rate,
      taxableAmountPerPart: taxableAmountInBracket,
      taxAmountPerPart,
      taxAmountTotal,
    });
  }

  const totalGrossIncomeTax = Math.round(grossIncomeTaxPerPart * partsCount);
  const totalSocialLevies = Math.round(rentalSocialLevies);
  const totalFiscalLiability = totalGrossIncomeTax + totalSocialLevies;

  const totalPASPaid = Math.round(totalSalaryPASPaid + totalRentalPASPaid);
  const netBalanceDue = totalFiscalLiability - totalPASPaid;
  const isRefund = netBalanceDue < 0;

  const averageTaxRate =
    totalTaxableIncome > 0
      ? (totalGrossIncomeTax / totalTaxableIncome) * 100
      : 0;

  return {
    totalGrossSalaries,
    deduction10Pct,
    taxableSalariesBase,
    totalSalaryPASPaid,

    totalRentalGross,
    rentalTaxableBase,
    rentalDeductions,
    rentalSocialLevies,
    totalRentalPASPaid,

    totalTaxableIncome,
    partsCount,
    incomePerPart,

    bracketBreakdowns,
    grossIncomeTaxPerPart,
    totalGrossIncomeTax,

    totalSocialLevies,
    totalPASPaid,
    totalFiscalLiability,

    netBalanceDue,
    isRefund,

    marginalTaxRate,
    averageTaxRate,
    nextBracketDistance,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatPreciseCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(rate);
}
