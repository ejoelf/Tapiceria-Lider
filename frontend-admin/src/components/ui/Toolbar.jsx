import "./Toolbar.css";

function Toolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters = [],
  actions = [],
}) {
  return (
    <div className="toolbar">
      <div className="toolbar__left">
        {onSearchChange ? (
          <input
            className="toolbar__search"
            type="text"
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
          />
        ) : null}

        {filters.map((filter) => (
          <select
            key={filter.key}
            className="toolbar__select"
            value={filter.value}
            onChange={(event) => filter.onChange(event.target.value)}
          >
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="toolbar__right">
        {actions.map((action) => (
          <button
            key={action.label}
            className={`toolbar__button ${
              action.variant === "secondary"
                ? "toolbar__button--secondary"
                : "toolbar__button--primary"
            }`}
            onClick={action.onClick}
            type="button"
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Toolbar;