import { useState } from "react";

export default function OverallDebts({ overallDebts = [], financeData = {}, activeCutoff, currentMonth, selectedYear, onArchiveCategory, onRestoreCategory }) {
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

  return (
    <div style={{ padding: "20px" }}>
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
          My Debts
        </button>
        <button
          className={activeTab === "theirDebts" ? "tab-button active" : "tab-button"}
          onClick={() => setActiveTab("theirDebts")}
        >
          Their Debts
        </button>
      </div>

      {/* Totals */}
      {activeTab === "myDebts" ? (
        <div className="card balance" style={{ marginBottom: 28 }}>
          <p className="card-label">Total I Owe</p>
          <h3>₱{myDebtsTotal.toLocaleString()}</h3>
        </div>
      ) : (
        <div className="card saving" style={{ marginBottom: 28 }}>
          <p className="card-label">Total They Owe</p>
          <h3>₱{theirDebtsTotal.toLocaleString()}</h3>
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
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <button
                      className="secondary-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onArchiveCategory) onArchiveCategory(cat, activeTab === "myDebts" ? "IOwe" : "TheyOwe");
                      }}
                    >
                      Archive group
                    </button>
                    <div style={{ fontWeight: 800, color: catTotal < 0 ? "#34d399" : "#f87171" }}>
                      {catTotal < 0 ? "-" : ""}₱{Math.abs(catTotal).toLocaleString()}
                    </div>
                    <div style={{ color: "#94a3b8" }}>{isOpen ? "▾" : "▸"}</div>
                  </div>
                </div>

                {isOpen && (
                  <div style={{ padding: 12, display: "grid", gap: 12 }}>
                    {list.map((debt) => {
                      const amount = signAmount(debt);
                      return (
                        <div
                          key={debt.id}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.02)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: 700 }}>{debt.note || debt.category || "Debt"}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Date: {debt.date || "-"}</div>
                            <div style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: 4 }}>
                              {debt.debtAction === "Pay" ? "Payment" : "Borrowed"}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                            <div style={{ fontWeight: 800, color: amount < 0 ? "#34d399" : "#f87171" }}>
                              {amount < 0 ? "-" : ""}₱{Math.abs(amount).toLocaleString()}
                            </div>
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
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                      <button
                        className="primary-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onRestoreCategory) onRestoreCategory(cat, activeTab === "myDebts" ? "IOwe" : "TheyOwe");
                        }}
                      >
                        Restore group
                      </button>
                      <div style={{ fontWeight: 800, color: catTotal < 0 ? "#34d399" : "#f87171" }}>
                        {catTotal < 0 ? "-" : ""}₱{Math.abs(catTotal).toLocaleString()}
                      </div>
                      <div style={{ color: "#94a3b8" }}>{isOpen ? "▾" : "▸"}</div>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: 12, display: "grid", gap: 12 }}>
                      {list.map((debt) => (
                        <div
                          key={debt.id}
                          style={{
                            padding: 12,
                            borderRadius: 10,
                            background: "rgba(255,255,255,0.02)",
                            display: "grid",
                            gap: 6,
                          }}
                        >
                          <div style={{ fontWeight: 700 }}>{debt.note || debt.category || "Debt"}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>Date: {debt.date || "-"}</div>
                          <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                            {debt.debtAction === "Pay" ? "Payment" : "Borrowed"}
                          </div>
                          <div style={{ fontWeight: 800, color: signAmount(debt) < 0 ? "#34d399" : "#f87171" }}>
                            {signAmount(debt) < 0 ? "-" : ""}₱{Math.abs(signAmount(debt)).toLocaleString()}
                          </div>
                        </div>
                      ))}
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
