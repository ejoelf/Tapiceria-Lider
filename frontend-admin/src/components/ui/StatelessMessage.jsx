import "./StatelessMessage.css";

function StatelessMessage({ type = "default", children }) {
  return (
    <div className={`stateless-message stateless-message--${type}`}>
      {children}
    </div>
  );
}

export default StatelessMessage;