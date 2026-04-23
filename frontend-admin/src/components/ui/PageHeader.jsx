import "./PageHeader.css";

function PageHeader({ title, description, actionLabel, onAction }) {
  return (
    <div className="page-header">
      <div className="page-header__content">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>

      {actionLabel ? (
        <button className="page-header__button" onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export default PageHeader;