import "./ActionButton.css";

function ActionButton({
  children,
  onClick,
  variant = "primary",
  type = "button",
}) {
  return (
    <button
      type={type}
      className={`action-button action-button--${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default ActionButton;