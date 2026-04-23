import "./Modal.css";

function Modal({ open, title, onClose, children }) {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal__backdrop" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>

        <div className="modal__body">{children}</div>
      </div>
    </div>
  );
}

export default Modal;