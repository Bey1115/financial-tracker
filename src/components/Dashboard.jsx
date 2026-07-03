const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toggleFilter = (current, value, onFilterChange) => {
  onFilterChange(current === value ? "all" : value);
};

export default function Dashboard({
  totals,
  currentMonth,
  selectedYear,
  activeCutoffLabel,
  entryFilter,
  onFilterChange,
}) {
  return (
    <>
      <div className="dashboard-header desktop-only">
        <div>
          <h2>
            {currentMonth} {selectedYear}
          </h2>
        </div>
      </div>

      <div className="mobile-balance-card mobile-only">
        <div className="mobile-balance-icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v.01M12 14v.01M16 14v.01M8 18v.01M12 18v.01M16 18v.01" />
          </svg>
        </div>
        <div className="mobile-balance-content">
          <p className="mobile-balance-label">Total balance</p>
          <h2 className="mobile-balance-amount">₱{formatMoney(totals.balance)}</h2>
          <p className="mobile-balance-sub">
            {activeCutoffLabel} · {currentMonth} {selectedYear}
          </p>
        </div>
      </div>

      <section className="overview-section mobile-only">
        <h3 className="overview-title">Overview</h3>
        <div className="overview-grid">
          <button
            type="button"
            className={`overview-card filter-card${entryFilter === "income" ? " active" : ""}`}
            onClick={() => toggleFilter(entryFilter, "income", onFilterChange)}
          >
            <div className="overview-icon income-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </div>
            <p className="overview-label">Income</p>
            <p className="overview-value income-text">₱{formatMoney(totals.income)}</p>
          </button>
          <button
            type="button"
            className={`overview-card filter-card${entryFilter === "expenses" ? " active" : ""}`}
            onClick={() => toggleFilter(entryFilter, "expenses", onFilterChange)}
          >
            <div className="overview-icon expense-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M19 12l-7 7-7-7" />
              </svg>
            </div>
            <p className="overview-label">Expenses</p>
            <p className="overview-value expense-text">₱{formatMoney(totals.expenses)}</p>
          </button>
          <button
            type="button"
            className={`overview-card filter-card${entryFilter === "savings" ? " active" : ""}`}
            onClick={() => toggleFilter(entryFilter, "savings", onFilterChange)}
          >
            <div className="overview-icon savings-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 11c0 4.418-3.582 8-8 8S3 15.418 3 11s3.582-8 8-8 8 3.582 8 8z" />
                <path d="M12 7v8M9 10h6" />
              </svg>
            </div>
            <p className="overview-label">Savings</p>
            <p className="overview-value savings-text">₱{formatMoney(totals.savings)}</p>
          </button>
        </div>
      </section>

      <div className="dashboard desktop-only">
        <button
          type="button"
          className={`card income filter-card${entryFilter === "income" ? " active" : ""}`}
          onClick={() => toggleFilter(entryFilter, "income", onFilterChange)}
        >
          <p className="card-label">Income</p>
          <h3>₱{totals.income.toLocaleString()}</h3>
        </button>

        <button
          type="button"
          className={`card expense filter-card${entryFilter === "expenses" ? " active" : ""}`}
          onClick={() => toggleFilter(entryFilter, "expenses", onFilterChange)}
        >
          <p className="card-label">Expenses</p>
          <h3>₱{totals.expenses.toLocaleString()}</h3>
        </button>

        <button
          type="button"
          className={`card saving filter-card${entryFilter === "savings" ? " active" : ""}`}
          onClick={() => toggleFilter(entryFilter, "savings", onFilterChange)}
        >
          <p className="card-label">Savings</p>
          <h3>₱{totals.savings.toLocaleString()}</h3>
        </button>

        <div className="card balance">
          <p className="card-label">Balance</p>
          <h3>₱{totals.balance.toLocaleString()}</h3>
        </div>
      </div>
    </>
  );
}
