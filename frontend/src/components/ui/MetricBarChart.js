function MetricBarChart({ title, subtitle, items = [], valueLabel = "Employees", emptyMessage = "No data available yet." }) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <section className="dashboard-card dashboard-card--chart">
      <div className="dashboard-card__header">
        <div>
          <p className="dashboard-card__eyebrow">Workforce overview</p>
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
      </div>

      {items.length ? (
        <div className="metric-bar-chart">
          {items.map((item) => (
            <div className="metric-bar-chart__row" key={item.label}>
              <div className="metric-bar-chart__labels">
                <span title={item.label}>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
              <div className="metric-bar-chart__track" aria-label={`${item.label}: ${item.value} ${valueLabel}`}>
                <span style={{ width: `${Math.max((item.value / maxValue) * 100, 5)}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="dashboard-card__empty">{emptyMessage}</p>
      )}
    </section>
  );
}

export default MetricBarChart;
