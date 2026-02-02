import { FiSearch } from "react-icons/fi";

const SearchBar = () => {
  return (
    <div className="position-relative">
      <input
        type="text"
        className="form-control ps-5"
        placeholder="Search..."
      />
      <FiSearch className="position-absolute top-50 translate-middle-y ms-2 text-secondary" />
    </div>
  );
};

export default SearchBar;
