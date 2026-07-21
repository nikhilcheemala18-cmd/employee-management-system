import { Inbox } from "lucide-react";

function EmptyState({ title, message }) {
  return (
    <div className="empty-state">
      <Inbox size={34} />
      <h3>{title}</h3>
      {message && <p>{message}</p>}
    </div>
  );
}

export default EmptyState;
