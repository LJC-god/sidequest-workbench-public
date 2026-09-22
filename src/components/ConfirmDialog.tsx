import { Modal } from './Modal';

interface ConfirmDialogProps {
  title: string;
  body: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({ title, body, confirmLabel, onConfirm, onClose }: ConfirmDialogProps) {
  return (
    <Modal labelledBy="confirm-dialog-title" onClose={onClose}>
      <h2 id="confirm-dialog-title" className="modal-title">{title}</h2>
      <p className="modal-body">{body}</p>
      <div className="modal-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>取消</button>
        <button type="button" className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
