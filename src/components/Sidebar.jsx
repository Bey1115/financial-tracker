// Sidebar.jsx

import { useRef, useState } from "react";

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
  onManageTemplates,
  onExportData,
  onImportData,
  onLogout,
  onClose,
}) {
  const fileInputRef = useRef(null);
  const [touchStartX, setTouchStartX] = useState(null);

  const handleTouchStart = (event) => {
    setTouchStartX(event.touches[0]?.clientX);
  };

  const handleTouchMove = (event) => {
    if (touchStartX == null) return;
    const currentX = event.touches[0]?.clientX;
    const diff = currentX - touchStartX;
    if (diff < -60 && onClose) {
      onClose();
      setTouchStartX(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStartX(null);
  };

  return (
    <aside
      className={`sidebar ${!isOpen ? 'hidden' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
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

      <div>
        <div className="menu-title">Actions</div>
        <div className="bottom-menu">
          <button type="button" className="nav-item" onClick={onManageTemplates}>
            Manage templates
          </button>
          <button type="button" className="nav-item" onClick={onExportData}>
            Export data
          </button>
          <button type="button" className="nav-item" onClick={() => fileInputRef.current?.click()}>
            Import data
          </button>
          <button type="button" className="nav-item" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        style={{ display: "none" }}
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file || !onImportData) return;
          const text = await file.text();
          onImportData(text);
          event.target.value = "";
        }}
      />

      {/* Sidebar summary sections removed as requested */}
    </aside>
  );
}
