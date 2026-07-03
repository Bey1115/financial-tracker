import { useState } from "react";

export default function OverallDebts({ overallDebts = [], financeData = {}, activeCutoff, currentMonth, selectedYear, onArchiveCategory, onRestoreCategory, onAdd, onRemoveEntry }) {
  const [activeTab, setActiveTab] = useState("myDebts"); // myDebts or theirDebts
  const [expanded, setExpanded] = useState({}); // track expanded categories

  const signAmount = (debt) => (debt.debtAction === "Pay" ? -Number(debt.amount) : Number(debt.amount));

  const filterByTab = (list) =>
    list.filter((d) => (activeTab === "myDebts" ? d.direction === "IOwe" : d.direction === "TheyOwe"));

  const filterByCutoff = (list) =>
    (list || []).filter((debt) => {
      if (debt.cutoff && debt.month === currentMonth && String(debt.year) === String(selectedYear) && debt.cutoff === activeCutoff) {
        return true;
      }
      if (!debt.cutoff && activeCutoff === "firstCutoff" && debt.date) {
        const parsed = new Date(debt.date);
        return (
          !Number.isNaN(parsed.getTime()) &&
          parsed.getMonth() === new Date(`${currentMonth} 1, ${selectedYear}`).getMonth() &&
          parsed.getFullYear() === Number(selectedYear)
        );
      }
      return false;
    });

  const currentCutoffDebts = filterByCutoff((overallDebts || []).filter((d) => !d.archived));
  const visibleDebts = filterByTab((overallDebts || []).filter((d) => !d.archived));
  const archivedDebts = filterByTab((financeData.overallDebtsArchived || []).slice().reverse());

  const debtsToShow = visibleDebts;

  // group by category
  const grouped = debtsToShow.reduce((acc, debt) => {
    const key = debt.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(debt);
    return acc;
  }, {});

  const groupedArchived = archivedDebts.reduce((acc, debt) => {
    const key = debt.category || "Uncategorized";
    if (!acc[key]) acc[key] = [];
    acc[key].push(debt);
    return acc;
  }, {});

  const totalsByTab = (list) => list.reduce((sum, d) => sum + signAmount(d), 0);
  const myDebtsTotal = totalsByTab(visibleDebts.filter((d) => d.direction === "IOwe"));
  const theirDebtsTotal = totalsByTab(visibleDebts.filter((d) => d.direction === "TheyOwe"));
  const currentCutoffMyDebtsTotal = totalsByTab(currentCutoffDebts.filter((d) => d.direction === "IOwe"));
  const currentCutoffTheirDebtsTotal = totalsByTab(currentCutoffDebts.filter((d) => d.direction === "TheyOwe"));

  const toggleCategory = (cat) => setExpanded((s) => ({ ...s, [cat]: !s[cat] }));

  const [showAddForm, setShowAddForm] = useState(false);
  const [addDate, setAddDate] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addNote, setAddNote] = useState("");
  const [paymentAmounts, setPaymentAmounts] = useState({}); // track payment amounts by category

  const resetAddForm = () => {
    setAddDate("");
    setAddAmount("");
    setAddNote("");
  };

  const handlePaymentSubmit = (category) => {
    const paymentAmount = paymentAmounts[category];
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      window.alert("Please enter a payment amount.");
      return;
    }
    const payload = {
      type: "debts",
      category: category,
      amount: Number(paymentAmount),
      note: `Payment – ${category}`,
      date: new Date().toISOString().split("T")[0],
      direction: activeTab === "myDebts" ? "IOwe" : "TheyOwe",
      debtAction: "Pay",
    };
    if (onAdd) onAdd(payload);
    setPaymentAmounts((s) => {
      const next = { ...s };
      delete next[category];
      return next;
    });
  };

  const handleAddDebt = () => {
    if (!addAmount) {
      window.alert("Please enter an amount.");
      return;
    }
    const payload = {
      type: "debts",
      category: addNote || "Debt",
      amount: Number(addAmount),
      note: addNote,
      date: addDate || undefined,
      direction: activeTab === "myDebts" ? "IOwe" : "TheyOwe",
      debtAction: "Borrow",
    };
    if (onAdd) onAdd(payload);
    resetAddForm();
    setShowAddForm(false);
  };

  return (
    <div className="overall-debts-page" style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Overall Debts</h1>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          borderBottom: "1px solid rgba(148, 163, 184, 0.12)",
          paddingBottom: 12,
        }}
      >
        <button
          className={activeTab === "myDebts" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("myDebts")}
        >
          I Owe
        </button>
        <button
          className={activeTab === "theirDebts" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("theirDebts")}
        >
          Owed to Me
        </button>
      </div>

      {/* Totals */}
      <div className="debt-total-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {activeTab === "myDebts" ? (
          <div className="card balance" style={{ marginBottom: 28, flex: 1 }}>
            <p className="card-label">Total I Owe</p>
            <h3>₱{myDebtsTotal.toLocaleString()}</h3>
          </div>
        ) : (
          <div className="card saving" style={{ marginBottom: 28, flex: 1 }}>
            <p className="card-label">Total Owed to Me</p>
            <h3>₱{theirDebtsTotal.toLocaleString()}</h3>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            type="button"
            className="primary-button debt-add-button"
            onClick={() => setShowAddForm((s) => !s)}
            style={{ padding: '10px 14px' }}
          >
            + Add
          </button>
        </div>
      </div>

      {showAddForm && (
        <div
          style={{
            marginTop: 12,
            marginBottom: 18,
            padding: 16,
            borderRadius: 12,
            background: 'rgba(255,255,255,0.02)',
            display: 'grid',
            gap: 12,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Date
              <input type="date" value={addDate} onChange={(e) => setAddDate(e.target.value)} />
            </label>
            <label>
              Amount
              <input type="number" min="0" value={addAmount} onChange={(e) => setAddAmount(e.target.value)} placeholder="0.00" />
            </label>
          </div>

          <label>
            Description
            <input type="text" value={addNote} onChange={(e) => setAddNote(e.target.value)} placeholder="Optional description" />
          </label>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="secondary-button" onClick={() => { resetAddForm(); setShowAddForm(false); }}>
              Cancel
            </button>
            <button type="button" className="primary-button" onClick={handleAddDebt}>
              Add
            </button>
          </div>
        </div>
      )}

      {/* Grouped list */}
      {Object.keys(grouped).length === 0 ? (
        <div className="empty-state">
          <p>No debts found for this view.</p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 12,
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(148, 163, 184, 0.12)",
            borderRadius: 20,
            padding: 16,
          }}
        >
          {Object.entries(grouped).map(([cat, list]) => {
            const catTotal = list.reduce((s, d) => s + signAmount(d), 0);
            const isOpen = !!expanded[cat];
            return (
              <div key={cat} style={{ borderRadius: 12, overflow: "hidden" }}>
                <div
                  className="debt-category-header"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 18px",
                    background: "rgba(17,24,39,0.6)",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleCategory(cat)}
                >
                  <div>
                    <div style={{ fontWeight: 800 }}>{cat}</div>
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{list.length} entries</div>
                  </div>
                  <div className="debt-group-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button
                      className="secondary-button debt-group-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onArchiveCategory) onArchiveCategory(cat, activeTab === "myDebts" ? "IOwe" : "TheyOwe");
                      }}
                    >
                      Archive
                    </button>
                    <div className="debt-payment-control" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input
                        type="number"
                        min="0"
                        placeholder="Paid"
                        className="debt-payment-input"
                        value={paymentAmounts[cat] || ""}
                        onChange={(e) => setPaymentAmounts((s) => ({ ...s, [cat]: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.stopPropagation();
                            handlePaymentSubmit(cat);
                          }
                        }}
                        style={{
                          width: 80,
                          padding: "6px 8px",
                          borderRadius: 6,
                          border: "1px solid rgba(148, 163, 184, 0.3)",
                          background: "rgba(255,255,255,0.05)",
                          color: "#e2e8f0",
                          fontSize: "0.9rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaymentSubmit(cat);
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "none",
                          background: "#2563eb",
                          color: "#f8fafc",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        ✓
                      </button>
                    </div>
                    <div className="debt-group-total" style={{ fontWeight: 800, color: catTotal < 0 ? "#34d399" : "#f87171" }}>
                      {catTotal < 0 ? "-" : ""}₱{Math.abs(catTotal).toLocaleString()}
                    </div>
                    <div className="debt-chevron" style={{ color: "#94a3b8" }}>{isOpen ? "▾" : "▸"}</div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: 12, display: "grid", gap: 12 }}>
                    {list.map((debt) => {
                      const amount = signAmount(debt);
                      const isPaid = debt.debtAction === "Pay";
                      return (
                        <div
                          key={debt.id}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: isPaid ? "rgba(52, 211, 153, 0.08)" : "rgba(255,255,255,0.02)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            borderLeft: isPaid ? "3px solid #34d399" : "none",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{debt.note || debt.category || "Debt"}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Date: {debt.date || "-"}</div>
                          </div>
                          <div className="debt-entry-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ fontWeight: 800, color: isPaid ? "#34d399" : "#f87171" }}>
                              {isPaid ? "-" : ""}₱{Math.abs(amount).toLocaleString()}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                if (onRemoveEntry) onRemoveEntry(debt);
                              }}
                              style={{
                                padding: "6px 10px",
                                borderRadius: 6,
                                border: "1px solid rgba(148, 163, 184, 0.3)",
                                background: "transparent",
                                color: "#f87171",
                                cursor: "pointer",
                                fontSize: "1rem",
                                fontWeight: 600,
                              }}
                              title="Delete"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Archived section */}
      {Object.keys(groupedArchived).length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h2 style={{ marginBottom: 12 }}>Archived Debts</h2>
          <div
            style={{
              display: "grid",
              gap: 12,
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(148, 163, 184, 0.08)",
              borderRadius: 16,
              padding: 12,
            }}
          >
            {Object.entries(groupedArchived).map(([cat, list]) => {
              const catTotal = list.reduce((s, d) => s + signAmount(d), 0);
              const archivedKey = `archived-${cat}`;
              const isOpen = !!expanded[archivedKey];
              return (
                <div key={cat} style={{ borderRadius: 12, overflow: "hidden" }}>
                  <div
                    className="debt-category-header"
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "14px 18px",
                      background: "rgba(17,24,39,0.5)",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleCategory(archivedKey)}
                  >
                    <div>
                      <div style={{ fontWeight: 800 }}>{cat}</div>
                      <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{list.length} archived entries</div>
                    </div>
                    <div className="debt-group-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button
                        className="primary-button debt-group-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRestoreCategory) onRestoreCategory(cat, activeTab === "myDebts" ? "IOwe" : "TheyOwe");
                        }}
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          list.forEach((debt) => {
                            if (onRemoveEntry) onRemoveEntry(debt);
                          });
                        }}
                        style={{
                          padding: "6px 10px",
                          borderRadius: 6,
                          border: "1px solid rgba(148, 163, 184, 0.3)",
                          background: "transparent",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "1.2rem",
                          fontWeight: 600,
                        }}
                        title="Delete entire group"
                      >
                        ✕
                      </button>
                      <div className="debt-payment-control" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input
                          type="number"
                          min="0"
                          placeholder="Paid"
                          className="debt-payment-input"
                          value={paymentAmounts[cat] || ""}
                          onChange={(e) => setPaymentAmounts((s) => ({ ...s, [cat]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.stopPropagation();
                              handlePaymentSubmit(cat);
                            }
                          }}
                          style={{
                            width: 80,
                            padding: "6px 8px",
                            borderRadius: 6,
                            border: "1px solid rgba(148, 163, 184, 0.3)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#e2e8f0",
                            fontSize: "0.9rem",
                          }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePaymentSubmit(cat);
                          }}
                          style={{
                            padding: "6px 10px",
                            borderRadius: 6,
                            border: "none",
                            background: "#2563eb",
                            color: "#f8fafc",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          ✓
                        </button>
                      </div>
                      <div className="debt-group-total" style={{ fontWeight: 800, color: catTotal < 0 ? "#34d399" : "#f87171" }}>
                        {catTotal < 0 ? "-" : ""}₱{Math.abs(catTotal).toLocaleString()}
                      </div>
                      <div className="debt-chevron" style={{ color: "#94a3b8" }}>{isOpen ? "▾" : "▸"}</div>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: 12, display: "grid", gap: 12 }}>
                      {list.map((debt) => {
                        const isPaid = debt.debtAction === "Pay";
                        return (
                          <div
                            key={debt.id}
                            style={{
                              padding: 12,
                              borderRadius: 10,
                              background: isPaid ? "rgba(52, 211, 153, 0.08)" : "rgba(255,255,255,0.02)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              borderLeft: isPaid ? "3px solid #34d399" : "none",
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700 }}>{debt.note || debt.category || "Debt"}</div>
                              <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Date: {debt.date || "-"}</div>
                            </div>
                            <div className="debt-entry-actions" style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{ fontWeight: 800, color: isPaid ? "#34d399" : "#f87171" }}>
                                {isPaid ? "-" : ""}₱{Math.abs(signAmount(debt)).toLocaleString()}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  if (onRemoveEntry) onRemoveEntry(debt);
                                }}
                                style={{
                                  padding: "6px 10px",
                                  borderRadius: 6,
                                  border: "1px solid rgba(148, 163, 184, 0.3)",
                                  background: "transparent",
                                  color: "#f87171",
                                  cursor: "pointer",
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                }}
                                title="Delete"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
