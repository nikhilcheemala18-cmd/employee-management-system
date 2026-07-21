function ConfirmDialog({ open, title, message, confirmText = "Confirm", cancelText = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop-custom">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p className="text-muted">{message}</p>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button type="button" className="app-button" onClick={onCancel}>
            {cancelText}
          </button>
          <button type="button" className="app-button app-button--danger" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
