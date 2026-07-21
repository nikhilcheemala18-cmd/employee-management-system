function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="stat-card">
      {Icon && (
        <div className="stat-card__icon">
          <Icon size={20} />
        </div>
      )}
      <div>
        <p className="stat-card__label">{label}</p>
        <p className="stat-card__value">{value}</p>
      </div>
    </div>
  );
}

export default StatCard;
