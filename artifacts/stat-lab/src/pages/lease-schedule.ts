export type LeaseInputName = "termYears" | "annualPayment" | "discountRate";

export type LeaseInputs = Record<LeaseInputName, number>;
export type LeaseInputErrors = Partial<Record<LeaseInputName, string>>;

export interface LeaseScheduleRow {
  year: number;
  openingLiability: number;
  interest: number;
  payment: number;
  closingLiability: number;
}

const MAX_LEASE_TERM_YEARS = 50;
const MAX_ANNUAL_PAYMENT = 1_000_000_000_000;

function presentValueOfPayments(inputs: LeaseInputs): number {
  const periodicRate = inputs.discountRate / 100;
  return periodicRate === 0
    ? inputs.annualPayment * inputs.termYears
    : inputs.annualPayment * (1 - (1 + periodicRate) ** -inputs.termYears) / periodicRate;
}

export function validateLeaseInputs(inputs: LeaseInputs): LeaseInputErrors {
  const errors: LeaseInputErrors = {};

  if (!Number.isFinite(inputs.termYears) || !Number.isInteger(inputs.termYears)) {
    errors.termYears = "Enter a whole number of years.";
  } else if (inputs.termYears < 1 || inputs.termYears > MAX_LEASE_TERM_YEARS) {
    errors.termYears = `Enter a lease term from 1 to ${MAX_LEASE_TERM_YEARS} years.`;
  }

  if (!Number.isFinite(inputs.annualPayment)) {
    errors.annualPayment = "Enter a valid annual payment.";
  } else if (inputs.annualPayment <= 0) {
    errors.annualPayment = "Annual payment must be greater than zero.";
  } else if (inputs.annualPayment > MAX_ANNUAL_PAYMENT) {
    errors.annualPayment = "Enter an annual payment no greater than 1,000,000,000,000.";
  }

  if (!Number.isFinite(inputs.discountRate)) {
    errors.discountRate = "Enter a valid discount rate.";
  } else if (inputs.discountRate < 0 || inputs.discountRate > 100) {
    errors.discountRate = "Enter a discount rate from 0% to 100%.";
  }

  return errors;
}

function roundToCents(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateLeaseSchedule(inputs: LeaseInputs): LeaseScheduleRow[] {
  const errors = validateLeaseInputs(inputs);
  if (Object.keys(errors).length > 0) {
    throw new RangeError("Cannot calculate a lease schedule from invalid inputs.");
  }

  const periodicRate = inputs.discountRate / 100;
  let openingLiability = roundToCents(presentValueOfPayments(inputs));

  return Array.from({ length: inputs.termYears }, (_, index) => {
    const interest = roundToCents(openingLiability * periodicRate);
    const isFinalYear = index === inputs.termYears - 1;
    const payment = isFinalYear
      ? roundToCents(openingLiability + interest)
      : roundToCents(inputs.annualPayment);
    const closingLiability = isFinalYear
      ? 0
      : roundToCents(openingLiability + interest - payment);

    const row = {
      year: index + 1,
      openingLiability,
      interest,
      payment,
      closingLiability,
    };
    openingLiability = closingLiability;
    return row;
  });
}

export function calculateInitialLeaseLiability(inputs: LeaseInputs): number {
  const errors = validateLeaseInputs(inputs);
  if (Object.keys(errors).length > 0) {
    throw new RangeError("Cannot calculate lease liability from invalid inputs.");
  }

  return roundToCents(presentValueOfPayments(inputs));
}
