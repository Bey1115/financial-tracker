const cutoffTabs = [
  { id: "firstCutoff", label: "First Cut-Off" },
  { id: "secondCutoff", label: "Second Cut-Off" },
];

export default function CutoffTabs({ activeCutoff, setActiveCutoff }) {
  return (
    <div className="cutoff-tabs-inner">
      {cutoffTabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={activeCutoff === tab.id ? "tab-button active" : "tab-button"}
          onClick={() => setActiveCutoff(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
