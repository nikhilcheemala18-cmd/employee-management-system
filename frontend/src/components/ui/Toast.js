function Toast({ message, type = "success" }) {
  if (!message) return null;

  return (
    <div className="toast-stack">
      <div className={`app-toast app-toast--${type}`}>{message}</div>
    </div>
  );
}

export default Toast;
