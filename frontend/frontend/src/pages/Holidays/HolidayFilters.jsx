export default function HolidayFilters({
  yearFilter,
  setYearFilter,
  filterType,
  setFilterType,
  onAdd,
}) {
  const years = [
    Number(yearFilter) - 1,
    Number(yearFilter),
    Number(yearFilter) + 1,
  ];

  return (
    <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)', padding: '24px' }} className="d-flex flex-wrap items-center justify-content-between gap-4 mb-5">

      <div className="d-flex align-items-center gap-3">
        <select
          className="form-select border shadow-sm"
          style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px', width: 'auto' }}
          value={yearFilter}
          onChange={(e) => setYearFilter(Number(e.target.value))}
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className="form-select border shadow-sm"
          style={{ borderColor: '#E6C7E6', color: '#663399', fontWeight: 600, borderRadius: '12px', width: 'auto' }}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option>All</option>
          <option>Statutory</option>
          <option>Floating</option>
        </select>
      </div>

      <button
        onClick={onAdd}
        className="btn shadow-sm px-4"
        style={{ backgroundColor: '#663399', color: '#ffffff', fontWeight: 600, borderRadius: '12px', border: 'none' }}
      >
        + Add New Holiday
      </button>
    </div>
  );
}
