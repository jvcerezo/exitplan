/**
 * Philippine housing affordability and Pag-IBIG loan calculations.
 */

export interface LoanAmortization {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  loanAmount: number;
  annualRate: number;
  termYears: number;
}

/** Calculate monthly amortization using standard PMT formula. */
export function calculateAmortization(
  loanAmount: number,
  annualRate: number,
  termYears: number
): LoanAmortization {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  let monthlyPayment: number;
  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / numPayments;
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  }

  monthlyPayment = Math.round(monthlyPayment * 100) / 100;
  const totalPaid = Math.round(monthlyPayment * numPayments * 100) / 100;

  return {
    monthlyPayment,
    totalPaid,
    totalInterest: Math.round((totalPaid - loanAmount) * 100) / 100,
    loanAmount,
    annualRate,
    termYears,
  };
}

export interface RentVsBuyComparison {
  years: number;
  totalRent: number;
  totalBuyCost: number;
  buyEquity: number;
  rentAdvantage: number; // positive = renting is cheaper
  breakEvenYear: number | null;
}

/** Compare total costs of renting vs buying over multiple time horizons. */
export function compareRentVsBuy(params: {
  propertyPrice: number;
  downPaymentPercent: number;
  loanRate: number;
  loanTermYears: number;
  monthlyRent: number;
  annualRentIncrease: number;
  annualPropertyAppreciation: number;
  monthlyAssociationDues: number;
  annualPropertyTaxRate: number;
}): RentVsBuyComparison[] {
  const {
    propertyPrice,
    downPaymentPercent,
    loanRate,
    loanTermYears,
    monthlyRent,
    annualRentIncrease,
    annualPropertyAppreciation,
    monthlyAssociationDues,
    annualPropertyTaxRate,
  } = params;

  const downPayment = propertyPrice * (downPaymentPercent / 100);
  const loanAmount = propertyPrice - downPayment;
  const loan = calculateAmortization(loanAmount, loanRate, loanTermYears);

  const horizons = [5, 10, 15, 20, 30];
  let breakEvenYear: number | null = null;

  return horizons.map((years) => {
    // Rent total
    let totalRent = 0;
    let currentRent = monthlyRent;
    for (let y = 0; y < years; y++) {
      totalRent += currentRent * 12;
      currentRent *= 1 + annualRentIncrease;
    }
    totalRent = Math.round(totalRent);

    // Buy total (down payment + amortization + dues + property tax)
    const amortMonths = Math.min(years * 12, loanTermYears * 12);
    const amortCost = loan.monthlyPayment * amortMonths;
    const duesCost = monthlyAssociationDues * years * 12;
    const taxCost = propertyPrice * annualPropertyTaxRate * years;
    const totalBuyCost = Math.round(downPayment + amortCost + duesCost + taxCost);

    // Equity built (property appreciation)
    const propertyValue = propertyPrice * Math.pow(1 + annualPropertyAppreciation, years);
    const buyEquity = Math.round(propertyValue);

    const rentAdvantage = totalBuyCost - totalRent;

    // Find break-even year
    if (breakEvenYear === null && rentAdvantage < 0) {
      breakEvenYear = years;
    }

    return { years, totalRent, totalBuyCost, buyEquity, rentAdvantage, breakEvenYear };
  });
}
