import { useEffect, useState } from "react";

export default function TemplateModal({ isOpen, onClose, templates = [], onSaveTemplate, onDeleteTemplate, onUpdateTemplate }) {
  const [templateName, setTemplateName] = useState("");
  const [itemType, setItemType] = useState("expenses");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [direction, setDirection] = useState("IOwe");
  const [debtAction, setDebtAction] = useState("Borrow");
  const [entries, setEntries] = useState([]);
  const [editingTemplateId, setEditingTemplateId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTemplateName("");
      setItemType("expenses");
      setCategory("");
      setAmount("");
      setNote("");
      setDirection("IOwe");
      setDebtAction("Borrow");
      setEntries([]);
      setEditingTemplateId(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleAddTemplateItem = () => {
    if (!category || !amount) return;
    setEntries((current) => [
      ...current,
      {
        type: itemType,
        category,
        amount: Number(amount),
        note,
        direction: itemType === "debts" ? direction : undefined,
        debtAction: itemType === "debts" ? debtAction : undefined,
      },
    ]);
    setCategory("");
    setAmount("");
    setNote("");
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim() || entries.length === 0) return;
    const template = {
      id: editingTemplateId || Date.now().toString(),
      name: templateName.trim(),
      entries,
    };

    if (editingTemplateId && onUpdateTemplate) {
      onUpdateTemplate(template);
    } else if (onSaveTemplate) {
      onSaveTemplate(template);
    }
    onClose();
  };

  const handleEditTemplate = (template) => {
    setEditingTemplateId(template.id);
    setTemplateName(template.name);
    setEntries(template.entries || []);
  };

  const handleRemoveTemplateItem = (index) => {
    setEntries((current) => current.filter((_, idx) => idx !== index));
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="subtitle">Template manager</p>
            <h2>Create or update template entries</h2>
          </div>
          <button className="icon-button" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-form">
          <label>
            Template name
            <input
              type="text"
              value={templateName}
              onChange={(event) => setTemplateName(event.target.value)}
              placeholder="Monthly essentials"
            />
          </label>

          <div className="form-row">
            <label className="type-label">
              Entry type
              <div className="type-select">
                {[
                  { value: "income", label: "Income" },
                  { value: "expenses", label: "Expense" },
                  { value: "savings", label: "Savings" },
                  { value: "debts", label: "Debt" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={option.value === itemType ? "type-chip active" : "type-chip"}
                    onClick={() => setItemType(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </label>

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
          </div>

          <label>
            Category
            <input
              type="text"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              placeholder="e.g. Rent, Salary"
            />
          </label>

          <label>
            Note
            <input
              type="text"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional note for template"
            />
          </label>

          {itemType === "debts" && (
            <div className="form-row">
              <label>
                Debt direction
                <select value={direction} onChange={(event) => setDirection(event.target.value)}>
                  <option value="IOwe">I owe it to others</option>
                  <option value="TheyOwe">Others owe it to me</option>
                </select>
              </label>
              <label>
                Debt action
                <div className="type-select">
                  {[
                    { value: "Borrow", label: "Borrow" },
                    { value: "Pay", label: "Pay" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={option.value === debtAction ? "type-chip active" : "type-chip"}
                      onClick={() => setDebtAction(option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </label>
            </div>
          )}

          <div className="form-actions" style={{ justifyContent: "flex-start" }}>
            <button type="button" className="secondary-button" onClick={handleAddTemplateItem}>
              + Add template item
            </button>
          </div>

          {entries.length > 0 && (
            <div className="entry-grid" style={{ marginTop: 16 }}>
              {entries.map((entry, index) => (
                <article key={`${entry.category}-${index}`} className="entry-card">
                  <div className="entry-meta">
                    <span className="entry-type">{entry.type}</span>
                  </div>
                  <div className="entry-title">{entry.category}</div>
                  <div className="entry-note">{entry.note || "No note"}</div>
                  {entry.type === "debts" && (
                    <div style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
                      {entry.direction} • {entry.debtAction}
                    </div>
                  )}
                  <div className={`entry-amount ${entry.type === "expenses" ? "negative" : "positive"}`}>
                    ₱{Number(entry.amount).toLocaleString()}
                  </div>
                  <button type="button" className="secondary-button" onClick={() => handleRemoveTemplateItem(index)}>
                    Remove item
                  </button>
                </article>
              ))}
            </div>
          )}

          <div className="form-actions">
            <button type="button" className="secondary-button" onClick={onClose}>
              Close
            </button>
            <button type="button" className="primary-button" onClick={handleSaveTemplate}>
              {editingTemplateId ? "Update template" : "Save template"}
            </button>
          </div>

          {templates.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h3>Saved templates</h3>
              <div className="month-list">
                {templates.map((template) => (
                  <div key={template.id} className="template-row">
                    <span>{template.name}</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button type="button" className="secondary-button" onClick={() => handleEditTemplate(template)}>
                        Edit
                      </button>
                      <button type="button" className="icon-button" onClick={() => onDeleteTemplate(template.id)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
