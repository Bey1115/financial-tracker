// Sidebar.jsx

export default function Sidebar({
  isOpen = true,
  user = "User",
  years = [],
  selectedYear,
  onSelectYear,
  onAddYear,
  months = [],
  selectedMonth,
  onSelectMonth,
  onAddMonth,
  templates = [],
  onApplyTemplate,
  onDeleteTemplate,
  overallSavings = [],
  overallDebts = [],
}) {
  return (
    <aside className={`sidebar ${!isOpen ? 'hidden' : ''}`}>
      <div className="brand">
      <span className="brand-dot" />
      <div>
        <p className="brand-overline">{user.toUpperCase()} MONEY MANAGER</p>
      </div>
    </div>

    <div>
      <div className="menu-title">Templates</div>
        <div className="month-list">
          {templates.length === 0 && <div style={{ color: '#94a3b8' }}>No templates yet</div>}
          {templates.map((template) => (
            <div key={template.id} className="template-row">
              <button type="button" className="month" onClick={() => onApplyTemplate && onApplyTemplate(template.id)}>
                {template.name}
              </button>
              <button type="button" className="icon-button" onClick={() => onDeleteTemplate && onDeleteTemplate(template.id)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="menu-title">Year</div>
        <div className="month-list">
          {years.map((year) => (
            <button
              key={year}
              type="button"
              className={`month${String(year) === String(selectedYear) ? " active" : ""}`}
              onClick={() => onSelectYear(year)}
            >
              {year}
            </button>
          ))}
          <button type="button" className="month add-action" onClick={onAddYear}>
            + Add year
          </button>
        </div>
      </div>

      <div>
        <div className="menu-title">Months</div>
        <div className="month-list">
          {months.length === 0 && <div style={{ color: '#94a3b8' }}>No months yet</div>}
          {months.map((month) => (
            <button
              key={month}
              type="button"
              className={`month${month === selectedMonth ? " active" : ""}`}
              onClick={() => onSelectMonth(month)}
            >
              {month}
            </button>
          ))}
          <button type="button" className="month add-action" onClick={onAddMonth}>
            + Add month
          </button>
        </div>
      </div>

      {/* Sidebar summary sections removed as requested */}
    </aside>
  );
}
