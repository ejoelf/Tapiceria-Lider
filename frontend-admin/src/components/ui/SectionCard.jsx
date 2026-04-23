import "./SectionCard.css";

function SectionCard({ title, children, actions = null }) {
  return (
    <section className="section-card">
      {(title || actions) && (
        <div className="section-card__header">
          {title ? <h3>{title}</h3> : <div />}
          {actions ? <div className="section-card__actions">{actions}</div> : null}
        </div>
      )}

      <div className="section-card__body">{children}</div>
    </section>
  );
}

export default SectionCard;