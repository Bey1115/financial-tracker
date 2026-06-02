import { useEffect, useState } from "react";

export default function AddModal({ isOpen, onClose, onAdd, onUpdate, entryToEdit, activeCutoff, currentMonth, selectedYear, savingsCategoryOptions = [] }) {
  const [type, setType] = useState("expenses");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isInitialSavings, setIsInitialSavings] = useState(false);
  const [fundFromOverall, setFundFromOverall] = useState(false);
  const [debtDirection, setDebtDirection] = useState("IOwe");
  const [debtAction, setDebtAction] = useState("Borrow");
  const [paymentDestination, setPaymentDestination] = useState("currentCutoff");
  const [splitRows, setSplitRows] = useState([{ category: "", customCategory: "", amount: "" }]);
  const [splitCategoriesError, setSplitCategoriesError] = useState("");

  const typeOptions = [
    { value: "income", label: "Income" },
    { value: "expenses", label: "Expense" },
    { value: "savings", label: "Savings" },
    { value: "debts", label: "Debt" },
  ];

  const categoryOptions = [...new Set([...(savingsCategoryOptions || []), "Custom"])];

  useEffect(() => {
    if (isOpen) {
      setType("expenses");
      setCategory("");
      setAmount("");
      setNote("");
      setIsInitialSavings(false);
      setFundFromOverall(false);
      setDebtDirection("IOwe");
      setDebtAction("Borrow");
      setPaymentDestination("currentCutoff");
      setSplitRows([{ category: "", customCategory: "", amount: "" }]);
      setSplitCategoriesError("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (type !== "savings") {
      setIsInitialSavings(false);
    }
  }, [type]);

  useEffect(() => {
    if (entryToEdit) {
      setType(entryToEdit.type || "expenses");
      setCategory(entryToEdit.category || "");
      setAmount(entryToEdit.amount || "");
      setNote(entryToEdit.note || "");
      setIsInitialSavings(Boolean(entryToEdit.isInitialSavings));
      setFundFromOverall(Boolean(entryToEdit.fundFromOverall));
      setDebtDirection(entryToEdit.direction || "IOwe");
      setDebtAction(entryToEdit.debtAction || "Borrow");
      setPaymentDestination(
        ["currentCutoff", "split"].includes(entryToEdit.paymentDestination)
          ? entryToEdit.paymentDestination
          : "currentCutoff"
      );
      if (Array.isArray(entryToEdit.splitCategories) && entryToEdit.splitCategories.length > 0) {
        setSplitRows(
          entryToEdit.splitCategories.map((item) => {
            const categoryValue = typeof item === "object" ? item.category || "" : String(item || "");
            const isCustom = categoryValue && !categoryOptions.includes(categoryValue);
            return {
              category: isCustom ? "Custom" : categoryValue,
              customCategory: isCustom ? categoryValue : "",
              amount: typeof item === "object" ? item.amount ?? "" : "",
            };
          })
        );
      } else {
        setSplitRows([{ category: "", customCategory: "", amount: "" }]);
      }
    }
  }, [entryToEdit]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!category || !amount) {
      window.alert("Please enter both category and amount.");
      return;
    }

    const payload = {
      type,
      category,
      amount,
      note,
      isInitialSavings,
      fundFromOverall,
      direction: type === "debts" ? debtDirection : undefined,
      debtAction: type === "debts" ? debtAction : undefined,
      paymentDestination: type === "debts" ? paymentDestination : undefined,
      splitCategories:
        type === "debts" && paymentDestination === "split"
          ? splitRows.map((row) => {
              const category = row.category === "Custom" ? row.customCategory.trim() : row.category;
              return {
                category,
                amount: Number(row.amount),
              };
            })
          : undefined,
    };

    if (!entryToEdit) {
      payload.month = currentMonth;
      payload.year = selectedYear;
      payload.cutoff = activeCutoff;
    }

    if (type === "debts" && paymentDestination === "split") {
      const splitItems = payload.splitCategories || [];
      const invalidSplit = splitItems.some((item) => !item.category || !Number.isFinite(item.amount) || item.amount <= 0);
      if (invalidSplit) {
        setSplitCategoriesError("Enter a valid category and amount for every split row.");
        return;
      }
      const splitTotal = splitItems.reduce((sum, item) => sum + item.amount, 0);
      if (splitTotal !== Number(amount)) {
        setSplitCategoriesError(`Split amounts must total ₱${Number(amount).toLocaleString()}`);
        return;
      }
    }

    if (entryToEdit && onUpdate) {
      onUpdate({ ...entryToEdit, ...payload });
    } else if (onAdd) {
      onAdd(payload);
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="subtitle">Add new entry</p>
            <h2>
              {currentMonth} — {activeCutoff === "firstCutoff" ? "First Cut-Off" : "Second Cut-Off"}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label className="type-label">
              Type
              <div className="type-select">
                {typeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={option.value === type ? "type-chip active" : "type-chip"}
                    onClick={() => setType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </label>

            <label>
              Category
              <input
                type="text"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="e.g. Grocery"
              />
            </label>
          </div>

          <div className="form-row">
            <label>
              Amount
              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
              />
            </label>

            <label>
              Note
              <input
                type="text"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Optional description"
              />
            </label>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 6 }}>

            {type === "savings" && (
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={isInitialSavings} onChange={(e) => setIsInitialSavings(e.target.checked)} />
                Initial savings
              </label>
            )}

            {type === "debts" && (
              <div style={{ display: 'grid', gap: 12 }}>
                <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  Debt direction
                  <select value={debtDirection} onChange={(e) => setDebtDirection(e.target.value)}>
                    <option value="IOwe">I owe it to others</option>
                    <option value="TheyOwe">Others owe it to me</option>
                  </select>
                </label>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={debtAction === 'Borrow' ? 'type-chip active' : 'type-chip'}
                    onClick={() => setDebtAction('Borrow')}
                  >
                    Borrow
                  </button>
                  <button
                    type="button"
                    className={debtAction === 'Pay' ? 'type-chip active' : 'type-chip'}
                    onClick={() => setDebtAction('Pay')}
                  >
                    Pay
                  </button>
                </div>

                {debtAction === 'Pay' && debtDirection === 'TheyOwe' && (
                  <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ fontWeight: 600 }}>Deposit received to</div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <input
                        type="radio"
                        name="paymentDestination"
                        value="currentCutoff"
                        checked={paymentDestination === 'currentCutoff'}
                        onChange={(e) => setPaymentDestination(e.target.value)}
                      />
                      Current income cutoff
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
                      <input
                        type="radio"
                        name="paymentDestination"
                        value="split"
                        checked={paymentDestination === 'split'}
                        onChange={(e) => setPaymentDestination(e.target.value)}
                      />
                      Split across categories
                    </label>

                    {paymentDestination === 'split' && (
                      <div style={{ display: 'grid', gap: 12, paddingRight: 4 }}>
                        <div style={{ fontWeight: 600 }}>Savings categories to split</div>
                        {splitRows.map((row, index) => (
                          <div
                            key={index}
                            style={{
                              display: 'grid',
                              gap: 8,
                              padding: '0.75rem',
                              border: '1px solid rgba(148,163,184,0.4)',
                              borderRadius: 8,
                            }}
                          >
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <label style={{ flex: 1, minWidth: 180 }}>
                                Category
                                <select
                                  value={row.category}
                                  onChange={(event) => {
                                    const nextRows = [...splitRows];
                                    nextRows[index] = {
                                      ...nextRows[index],
                                      category: event.target.value,
                                      customCategory: event.target.value === 'Custom' ? '' : nextRows[index].customCategory,
                                    };
                                    setSplitRows(nextRows);
                                    setSplitCategoriesError('');
                                  }}
                                >
                                  <option value="">Select category</option>
                                  {categoryOptions.map((option) => (
                                    <option value={option} key={option}>
                                      {option === 'Custom' ? 'Other / custom' : option}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label style={{ flex: 1, minWidth: 180 }}>
                                Amount
                                <input
                                  type="number"
                                  min="0"
                                  value={row.amount}
                                  onChange={(event) => {
                                    const nextRows = [...splitRows];
                                    nextRows[index] = { ...nextRows[index], amount: event.target.value };
                                    setSplitRows(nextRows);
                                    setSplitCategoriesError('');
                                  }}
                                  placeholder="0.00"
                                />
                              </label>
                              {splitRows.length > 1 && (
                                <button
                                  type="button"
                                  className="secondary-button"
                                  aria-label="Remove split row"
                                  style={{
                                    width: 36,
                                    height: 36,
                                    padding: 0,
                                    fontSize: '1rem',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignSelf: 'flex-end',
                                  }}
                                  onClick={() => {
                                    setSplitRows(splitRows.filter((_, rowIndex) => rowIndex !== index));
                                  }}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            {row.category === 'Custom' && (
                              <label>
                                Custom category
                                <input
                                  type="text"
                                  value={row.customCategory}
                                  onChange={(event) => {
                                    const nextRows = [...splitRows];
                                    nextRows[index] = { ...nextRows[index], customCategory: event.target.value };
                                    setSplitRows(nextRows);
                                    setSplitCategoriesError('');
                                  }}
                                  placeholder="Enter custom category"
                                />
                              </label>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="secondary-button"
                          onClick={() => setSplitRows([...splitRows, { category: '', customCategory: '', amount: '' }])}
                        >
                          Add savings category
                        </button>
                        {splitCategoriesError && (
                          <div style={{ color: '#fca5a5', fontSize: '0.9rem' }}>{splitCategoriesError}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {type === "expenses" && (
              <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="checkbox" checked={fundFromOverall} onChange={(e) => setFundFromOverall(e.target.checked)} />
                Fund from overall savings (do not count in cutoff)
              </label>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="primary-button">
              Save entry
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

