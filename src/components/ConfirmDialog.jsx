import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Confirm' }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-sm">
      {description && <p className="text-sm text-ink-300 mb-5">{description}</p>}
      <div className="flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
