export default function ExpensesStatistics({ entries = [], currentMonth = "" }) {
  // Group expenses by category
  const allExpenses = entries.filter((e) => e.type === "expenses");

  const expensesByCategory = allExpenses.reduce((acc, entry) => {
    const category = entry.category || "Uncategorized";
    if (!acc[category]) {
      acc[category] = { total: 0, entries: [] };
    }
    acc[category].total += Number(entry.amount);
    acc[category].entries.push(entry);
    return acc;
  }, {});

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, cat) => sum + cat.total, 0);

  const sortedCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b.total - a.total)
    .map(([category, data]) => ({ category, ...data }));

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Expenses Statistics</h1>

      {/* Overall Summary */}
      <div className="card expense" style={{ marginBottom: 28 }}>
        <p className="card-label">Total Expenses</p>
        <h3>₱{totalExpenses.toLocaleString()}</h3>
      </div>

      {/* Current Period Summary */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          border: "1px solid rgba(148, 163, 184, 0.12)",
          borderRadius: 20,
          padding: 24,
          marginBottom: 28,
        }}
      >
        <h2 style={{ marginBottom: 16 }}>
          {currentMonth} — Categorized Expenses
        </h2>

        {sortedCategories.length === 0 ? (
          <div className="empty-state">
            <p>No expenses tracked for this period.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {sortedCategories.map(({ category, total, entries: categoryEntries }) => {
              const percentage = totalExpenses ? ((total / totalExpenses) * 100).toFixed(1) : "0.0";

              return (
                <div key={category} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontWeight: 700 }}>{category}</div>
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>₱{total.toLocaleString()}</div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, color: "#94a3b8", fontSize: "0.9rem" }}>
                    <span>{categoryEntries.length} entries</span>
                    <span>{percentage}%</span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      background: "rgba(255, 255, 255, 0.1)",
                      borderRadius: 8,
                      height: 12,
                      overflow: "hidden",
                      marginTop: 8,
                    }}
                  >
                    <div
                      style={{
                        background: `hsl(${200 - (percentage * 2)}, 100%, 50%)`,
                        height: "100%",
                        width: `${percentage}%`,
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
