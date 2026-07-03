const formatMoney = (value) =>
  Number(value || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const typeLabel = (type) => {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("income")) return "income";
  if (normalized.includes("saving")) return "savings";
  return "expenses";
};

export default function GroupedEntries({ entries = [], onRemoveEntry, onEditEntry, onToggleIncluded }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="empty-state">
        <p>No entries yet. Click Add entry to begin tracking income, expenses, or savings.</p>
      </div>
    );
  }

  return (
    <div className="entries-list">
      {entries.map((entry, idx) => {
        const entryType = typeLabel(entry.type);
        const amount = Number(entry.amount || 0);
        const isPositive = entryType === "income";

        return (
          <article key={entry.id || idx} className={`entry-card transaction-row${entry.included === false ? " excluded" : ""}`}>
            <div className="transaction-row-inner">
              <label className="transaction-checkbox-wrap">
                <input
                  type="checkbox"
                  className="transaction-checkbox"
                  checked={entry.included !== false}
                  onChange={(e) => onToggleIncluded && onToggleIncluded(entry, e.target.checked)}
                  title="Include in dashboard and tracker totals"
                />
              </label>

              <div className={`transaction-type-icon ${entryType}-type`} aria-hidden="true">
                {entryType === "income" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                ) : entryType === "savings" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 11c0 4.418-3.582 8-8 8S3 15.418 3 11s3.582-8 8-8 8 3.582 8 8z" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 5v14M19 12l-7 7-7-7" />
                  </svg>
                )}
              </div>

              <div className="transaction-details">
                <div className="entry-meta desktop-only">
                  <span className="entry-type">{entry.type}</span>
                  <span>{entry.date || "—"}</span>
                </div>
                <div className="entry-title">{entry.category || "Untitled"}</div>
                {entry.note && <div className="entry-note">{entry.note}</div>}
                <div className="transaction-date mobile-only">{formatDate(entry.date)}</div>
              </div>

              <div className="transaction-amount-col">
                <div className={`entry-amount ${isPositive ? "positive" : "negative"}`}>
                  {isPositive ? "+" : "-"}₱{formatMoney(Math.abs(amount))}
                </div>
              </div>

              <div className="transaction-actions">
                {onEditEntry && (
                  <button className="transaction-action-btn" onClick={() => onEditEntry(entry)} title="Edit entry">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
                <button className="transaction-action-btn" onClick={() => onRemoveEntry && onRemoveEntry(entry)} title="Delete entry">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                </button>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
