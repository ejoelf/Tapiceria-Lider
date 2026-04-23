import "./EmptyStateCard.css";

function EmptyStateCard({ title, description }) {
  return (
    <div className="empty-state-card">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default EmptyStateCard;