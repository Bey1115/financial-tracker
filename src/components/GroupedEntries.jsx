import React from "react";

export default function GroupedEntries({ entries = [], onRemoveEntry, onEditEntry }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="empty-state">
        <p>No entries yet. Click Add entry to begin tracking income, expenses, or savings.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      {entries.map((entry, idx) => (
        <article key={entry.id || idx} className="entry-card">
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div className="entry-meta">
                <span className="entry-type">{entry.type}</span>
                <span>{entry.date || "—"}</span>
              </div>
              <div className="entry-title">{entry.category || "Untitled"}</div>
              {entry.note && <div className="entry-note">{entry.note}</div>}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: 'center' }}>
              {onEditEntry && (
                <button
                  className="icon-button"
                  onClick={() => onEditEntry(entry)}
                  title="Edit entry"
                >
                  ✎
                </button>
              )}
              <button
                className="icon-button"
                onClick={() => onRemoveEntry && onRemoveEntry(entry)}
                title="Delete entry"
              >
                ✕
              </button>
            </div>
          </div>
          <div className={`entry-amount ${Number(entry.amount) < 0 ? 'negative' : 'positive'}`}>
            ₱{Number(entry.amount).toLocaleString()}
          </div>
        </article>
      ))}
    </div>
  );
}
