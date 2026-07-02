// Dashboard.jsx

export default function Dashboard({ totals, currentMonth, selectedYear }) {
  return (
    <>
      <div className="dashboard-header">
        <div>
          <h2>{currentMonth} {selectedYear}</h2>
        </div>
      </div>
      <div className="dashboard">
        <div className="card income">
        <p className="card-label">Income</p>
        <h3>₱{totals.income.toLocaleString()}</h3>
      </div>


      <div className="card expense">
        <p className="card-label">Expenses</p>
        <h3>₱{totals.expenses.toLocaleString()}</h3>
      </div>

      <div className="card saving">
        <p className="card-label">Savings</p>
        <h3>₱{totals.savings.toLocaleString()}</h3>
      </div>

      <div className="card balance">
        <p className="card-label">Balance</p>
        <h3>₱{totals.balance.toLocaleString()}</h3>
      </div>
    </div>
    </>
  );
}
