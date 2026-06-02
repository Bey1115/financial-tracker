import { useState } from "react";

export default function OverallSavings({ overallSavings = [], savingsGoals = [], onCreateGoal, onCompleteGoal, onRemoveEntry, onReactivateGoal }) {
  const [goalName, setGoalName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [expandedGoal, setExpandedGoal] = useState(null);

  const totalSavings = (overallSavings || []).reduce((s, it) => s + Number(it.amount || 0), 0);

  const activeGoals = (savingsGoals || []).filter((g) => !g.completed);
  const completedGoals = (savingsGoals || []).filter((g) => g.completed);

  const handleCreateLocalGoal = () => {
    if (!goalName.trim() || !targetAmount) {
      alert("Please provide a goal name and target amount");
      return;
    }
    const goal = {
      id: Date.now().toString(),
      name: goalName,
      target: Number(targetAmount),
      targetDate: targetDate || "",
      createdDate: new Date().toISOString().split("T")[0],
      completed: false,
      completedDate: null,
    };
    if (onCreateGoal) onCreateGoal(goal);
    setGoalName("");
    setTargetAmount("");
    setTargetDate("");
  };

  const handleComplete = (id) => {
    if (onCompleteGoal) onCompleteGoal(id);
  };

  const daysUntil = (dateStr) => {
    try {
      const target = new Date(dateStr);
      const now = new Date();
      const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
      return diff;
    } catch (e) {
      return null;
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: 24 }}>Overall Savings</h1>

      <div className="card saving" style={{ marginBottom: 28 }}>
        <p className="card-label">Overall Savings</p>
        <h3>₱{Number(totalSavings).toLocaleString()}</h3>
      </div>

      {/* Active Goal */}
      {activeGoals.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ marginBottom: 12 }}>Active Goal</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {activeGoals.map((goal) => {
              const normalize = (value) => String(value || "").toLowerCase().trim();
              const goalKey = normalize(goal.name);
              const goalSavings = (overallSavings || []).filter((s) => {
                const category = normalize(s.category);
                const note = normalize(s.note);
                return (
                  category === goalKey ||
                  note === goalKey ||
                  category.includes(goalKey) ||
                  note.includes(goalKey)
                );
              });
              const actual = goalSavings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
              const progress = Math.min((actual / goal.target) * 100, 100);
              const days = daysUntil(goal.targetDate);
              return (
                <div key={goal.id} style={{ padding: 16, borderRadius: 12, background: 'rgba(56,189,248,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{goal.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Target: ₱{Number(goal.target).toLocaleString()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₱{Number(actual).toLocaleString()} / ₱{Number(goal.target).toLocaleString()}</div>
                      <div style={{ color: '#94a3b8' }}>
                        {goal.targetDate ? `${goal.targetDate}${days !== null ? ` • ${days} days` : ''}` : ''}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.1)', height: 10, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ background: '#60a5fa', height: '100%', width: `${progress}%`, transition: 'width 0.3s ease' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                    <button className="secondary-button" onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}>Toggle details</button>
                    <button className="secondary-button" onClick={() => handleComplete(goal.id)}>Mark Complete</button>
                  </div>

                  {expandedGoal === goal.id && (
                    <div style={{ marginTop: 12 }}>
                      <h4>Related savings (drill down)</h4>
                      <div style={{ display: 'grid', gap: 8 }}>
                        {goalSavings.length > 0 ? (
                          goalSavings.map((s) => (
                            <div key={s.id || s.date} style={{ display: 'grid', gap: 4, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>{s.category || s.note || 'Savings'}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <div>₱{Number(s.amount).toLocaleString()}</div>
                                  {onRemoveEntry && (
                                    <button className="secondary-button" onClick={() => onRemoveEntry(s)}>Remove</button>
                                  )}
                                </div>
                              </div>
                              {s.note && s.category !== s.note && (
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.note}</div>
                              )}
                              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.date || s.month || ''}</div>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: '#94a3b8' }}>No savings linked to this goal yet</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create Goal */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Create a Goal</h2>
        <div className="modal-form" style={{ maxHeight: 'none' }}>
          <label>
            Goal name
            <input type="text" value={goalName} onChange={(e) => setGoalName(e.target.value)} placeholder="e.g., Emergency Fund" />
          </label>
          <label>
            Target amount
            <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0" min="0" />
          </label>
          <label>
            Target completion date (optional)
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
          </label>
          <button className="primary-button" onClick={handleCreateLocalGoal}>Create Goal</button>
        </div>
      </div>

      {/* Completed Goals */}
      {completedGoals.length > 0 && (
        <div>
          <h2 style={{ marginBottom: 12 }}>Completed Goal</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {completedGoals.map((goal) => {
              const normalize = (value) => String(value || "").toLowerCase().trim();
              const goalKey = normalize(goal.name);
              const goalSavings = (overallSavings || []).filter((s) => {
                const category = normalize(s.category);
                const note = normalize(s.note);
                return (
                  category === goalKey ||
                  note === goalKey ||
                  category.includes(goalKey) ||
                  note.includes(goalKey)
                );
              });
              const actual = goalSavings.reduce((sum, item) => sum + Number(item.amount || 0), 0);
              return (
                <div key={goal.id} style={{ padding: 16, borderRadius: 12, background: 'rgba(34,197,94,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>✓ {goal.name}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Completed: {goal.completedDate}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700 }}>₱{Number(actual).toLocaleString()}</div>
                      <div style={{ color: '#86efac' }}>Actual amount</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                    <button
                      className="secondary-button"
                      onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                    >
                      View history
                    </button>
                    {onReactivateGoal && (
                      <button className="secondary-button" onClick={() => onReactivateGoal(goal.id)} style={{ marginLeft: 8 }}>
                        Move to active
                      </button>
                    )}
                  </div>

                  {expandedGoal === goal.id && (
                    <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12 }}>
                      <div style={{ marginBottom: 12, fontWeight: 600 }}>Savings history</div>
                      {goalSavings.length > 0 ? (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {goalSavings.map((s) => (
                            <div key={s.id || s.date} style={{ display: 'grid', gap: 4, padding: 8, borderRadius: 10, background: 'rgba(255,255,255,0.06)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>{s.category || s.note || 'Savings'}</div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                  <div>₱{Number(s.amount).toLocaleString()}</div>
                                  {onRemoveEntry && (
                                    <button className="secondary-button" onClick={() => onRemoveEntry(s)}>Remove</button>
                                  )}
                                </div>
                              </div>
                              {s.note && s.category !== s.note && (
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.note}</div>
                              )}
                              <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{s.date || s.month || ''}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ color: '#94a3b8' }}>No history available for this completed goal.</div>
                      )}
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
