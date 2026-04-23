import "./SearchBar.css";

function SearchBar({ value, onChange, placeholder = "Buscar..." }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  );
}

export default SearchBar;