// financeData.js

const createBlankCutoff = () => ({
  income: [],
  expenses: [],
  savings: [],
  debts: [],
  transfers: [],
  otherIncome: [],
});

const createBlankMonth = () => ({
  firstCutoff: createBlankCutoff(),
  secondCutoff: createBlankCutoff(),
});

const default2026Months = {
  May: createBlankMonth(),
  June: createBlankMonth(),
  July: createBlankMonth(),
  August: createBlankMonth(),
  September: createBlankMonth(),
  October: createBlankMonth(),
  November: createBlankMonth(),
  December: createBlankMonth(),
};

export const defaultData = {
  years: {
    2026: {
      months: default2026Months,
    },
  },
  overallSavings: [],
  overallDebts: [],
  templates: [],
};

export const sampleData = {
  years: {
    2026: {
      months: {
        May: {
          firstCutoff: {
            income: [{ category: "Salary", amount: 45000, note: "Monthly salary", date: "05/10/2026" }],
            expenses: [{ category: "Groceries", amount: 8200, note: "Weekly groceries", date: "05/12/2026" }],
            savings: [{ category: "Emergency fund", amount: 5000, note: "Planned savings", date: "05/08/2026" }],
            debts: [{ category: "Loan payment", amount: 3000, note: "Car loan", date: "05/09/2026" }],
            transfers: [],
            otherIncome: [{ category: "Freelance", amount: 5200, note: "Bonus", date: "05/15/2026" }],
          },
          secondCutoff: {
            income: [{ category: "Investment", amount: 6200, note: "Dividend", date: "05/25/2026" }],
            expenses: [{ category: "Utilities", amount: 2100, note: "Bills", date: "05/27/2026" }],
            savings: [{ category: "Vacation", amount: 3000, note: "Travel fund", date: "05/24/2026" }],
            debts: [],
            transfers: [],
            otherIncome: [],
          },
        },
        June: {
          firstCutoff: {
            income: [{ category: "Salary", amount: 45000, note: "Monthly salary", date: "06/10/2026" }],
            expenses: [{ category: "Rent", amount: 12500, note: "Monthly rent", date: "06/05/2026" }],
            savings: [{ category: "Emergency fund", amount: 6000, note: "Reserve", date: "06/08/2026" }],
            debts: [{ category: "Credit card", amount: 4000, note: "Payment", date: "06/12/2026" }],
            transfers: [],
            otherIncome: [],
          },
          secondCutoff: {
            income: [],
            expenses: [{ category: "Dining", amount: 4200, note: "Eating out", date: "06/20/2026" }],
            savings: [{ category: "Investment", amount: 3500, note: "Future growth", date: "06/22/2026" }],
            debts: [],
            transfers: [],
            otherIncome: [],
          },
        },
      },
    },
  },
  overallSavings: [],
  overallDebts: [],
  templates: [],
};
