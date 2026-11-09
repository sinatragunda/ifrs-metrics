import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateInitialLeaseLiability,
  calculateLeaseSchedule,
  validateLeaseInputs,
} from "./lease-schedule.ts";

test("calculates present value and an annual lease liability roll-forward", () => {
  const inputs = { termYears: 4, annualPayment: 30_000, discountRate: 8 };
  const schedule = calculateLeaseSchedule(inputs);

  assert.equal(calculateInitialLeaseLiability(inputs), 99_363.81);
  assert.equal(schedule.length, 4);
  assert.equal(schedule[0].openingLiability, 99_363.81);
  assert.equal(schedule[0].interest, 7_949.1);
  assert.equal(schedule[0].payment, 30_000);
  assert.equal(schedule[0].closingLiability, 77_312.91);
  assert.equal(schedule.at(-1).closingLiability, 0);
});

test("supports a zero discount rate without dividing by zero", () => {
  const inputs = { termYears: 3, annualPayment: 1_000, discountRate: 0 };

  assert.equal(calculateInitialLeaseLiability(inputs), 3_000);
  assert.deepEqual(
    calculateLeaseSchedule(inputs).map(({ interest, payment, closingLiability }) => ({
      interest,
      payment,
      closingLiability,
    })),
    [
      { interest: 0, payment: 1_000, closingLiability: 2_000 },
      { interest: 0, payment: 1_000, closingLiability: 1_000 },
      { interest: 0, payment: 1_000, closingLiability: 0 },
    ],
  );
});

test("provides field-specific errors for invalid assumptions", () => {
  assert.deepEqual(
    validateLeaseInputs({ termYears: 1.5, annualPayment: 0, discountRate: 120 }),
    {
      termYears: "Enter a whole number of years.",
      annualPayment: "Annual payment must be greater than zero.",
      discountRate: "Enter a discount rate from 0% to 100%.",
    },
  );
});

test("rejects invalid inputs instead of returning a misleading schedule", () => {
  assert.throws(
    () => calculateLeaseSchedule({ termYears: 0, annualPayment: 1_000, discountRate: 5 }),
    RangeError,
  );
});
