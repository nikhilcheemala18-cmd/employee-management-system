function DashboardPanel({ eyebrow, title, subtitle, actions, children, className = "" }) {
  return (
    <section className={`dashboard-card ${className}`.trim()}>
      <div className="dashboard-card__header">
        <div>
          {eyebrow && <p className="dashboard-card__eyebrow">{eyebrow}</p>}
          <h3>{title}</h3>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {actions && <div className="dashboard-card__actions">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export default DashboardPanel;
