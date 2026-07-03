import { useMemo, useState } from "react";

const monthOrder = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function ExpensesStatistics({ financeData = {}, selectedYear = "", currentMonth = "" }) {
  const availableYears = useMemo(() => Object.keys(financeData.years || {}).sort(), [financeData]);
  const initialYear = selectedYear || availableYears[0] || "";
  const [period, setPeriod] = useState("all");
  const [yearFilter, setYearFilter] = useState(initialYear);
  const [monthFilter, setMonthFilter] = useState(currentMonth || "");

  const monthsForYear = useMemo(() => {
    const months = Object.keys(financeData.years?.[yearFilter]?.months || {});
    return months.sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b));
  }, [financeData, yearFilter]);

  const allExpenses = useMemo(() => {
    return Object.entries(financeData.years || {}).flatMap(([year, yearData]) =>
      Object.entries(yearData.months || {}).flatMap(([month, monthData]) =>
        Object.entries(monthData || {}).flatMap(([cutoff, cutoffData]) =>
          (cutoffData.expenses || [])
            .filter((entry) => entry.included !== false && !entry.fundFromOverall && !entry.transferEntry)
            .map((entry) => ({
              ...entry,
              type: "expenses",
              year,
              month,
              cutoff,
            })),
        ),
      ),
    );
  }, [financeData]);

  const filteredExpenses = allExpenses.filter((entry) => {
    if (period === "year") return String(entry.year) === String(yearFilter);
    if (period === "month") {
      return String(entry.year) === String(yearFilter) && entry.month === monthFilter;
    }
    return true;
  });

  const expensesByCategory = filteredExpenses.reduce((acc, entry) => {
    const category = entry.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { total: 0, entries: [] };
    }
    acc[category].total += Number(entry.amount || 0);
    acc[category].entries.push(entry);
    return acc;
  }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, cat) => sum + cat.total, 0);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([category, data]) => ({ category, ...data }));

  const periodLabel =
    period === "year"
      ? yearFilter
      : period === "month"
        ? (monthFilter || "Select month") + " " + yearFilter
        : "Consolidated";

  return (
    <div className="expenses-statistics-page" style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Expenses Statistics</h1>

      <div className="stats-filter-panel">
        <label>
          View
          <select value={period} onChange={(event) => setPeriod(event.target.value)}>
            <option value="all">Consolidated</option>
            <option value="year">By year</option>
            <option value="month">By month</option>
          </select>
        </label>

        {period !== "all" && (
          <label>
            Year
            <select
              value={yearFilter}
              onChange={(event) => {
                const nextYear = event.target.value;
                const nextMonths = Object.keys(financeData.years?.[nextYear]?.months || {});
                setYearFilter(nextYear);
                if (!nextMonths.includes(monthFilter)) {
                  setMonthFilter(nextMonths[0] || "");
                }
              }}
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
        )}

        {period === "month" && (
          <label>
            Month
            <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
              {monthsForYear.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="card expense" style={{ marginBottom: 28 }}>
        <p className="card-label">{periodLabel} Expenses</p>
        <h3>₱{totalExpenses.toLocaleString()}</h3>
      </div>

      <div className="stats-category-panel">
        <h2 style={{ marginBottom: 16 }}>{periodLabel} — Categorized Expenses</h2>

        {sortedCategories.length === 0 ? (
          <div className="empty-state">
            <p>No expenses tracked for this period.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedCategories.map(({ category, total, entries: categoryEntries }) => {
              const percentage = totalExpenses ? ((total / totalExpenses) * 100).toFixed(1) : "0.0";

              return (
                <div key={category} className="stats-category-row">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{category}</div>
                    <div style={{ fontWeight: 700, color: "#f8fafc", whiteSpace: "nowrap" }}>₱{total.toLocaleString()}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#94a3b8", fontSize: "0.9rem" }}>
                    <span>{categoryEntries.length} entries</span>
                    <span>{percentage}%</span>
                  </div>

                  <div className="stats-progress-track">
                    <div
                      className="stats-progress-fill"
                      style={{
                        background: "hsl(" + (200 - percentage * 2) + ", 100%, 50%)",
                        width: percentage + "%",
                      }}
                    />
                  </div>

                  {period === "all" && (
                    <div className="stats-period-breakdown">
                      {Object.entries(
                        categoryEntries.reduce((acc, entry) => {
                          const key = entry.month + " " + entry.year;
                          acc[key] = (acc[key] || 0) + Number(entry.amount || 0);
                          return acc;
                        }, {}),
                      ).map(([label, amount]) => (
                        <span key={label}>{label}: ₱{amount.toLocaleString()}</span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
