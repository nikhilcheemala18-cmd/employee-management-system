function StatusBadge({ status }) {
  const normalizedStatus = status === "Inactive" ? "Inactive" : "Active";

  return (
    <span className={`status-badge ${normalizedStatus === "Active" ? "status-badge--active" : "status-badge--inactive"}`}>
      {normalizedStatus}
    </span>
  );
}

export default StatusBadge;
