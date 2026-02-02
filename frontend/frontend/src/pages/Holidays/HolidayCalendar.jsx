import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HolidayCalendar({ holidays, month, year, setMonth, setYear }) {

  const monthName = new Date(year, month).toLocaleString("default", { month: "long" });

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  // 🔥 FIX: Only holidays **in this month**
  const monthlyHolidays = holidays.filter((h) => {
    const d = new Date(h.date);
    return d.getMonth() === month && d.getFullYear() === year;
  });

  // 🔥 FIX: No timezone shift (read local date)
  const holidayMap = monthlyHolidays.reduce((acc, h) => {
    const day = new Date(h.date).getDate();
    acc[day] = h;
    return acc;
  }, {});

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };

  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)', padding: '24px' }} className="mb-5">

      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <button className="btn p-2 border-0" onClick={goPrev} style={{ color: '#663399' }}>
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="fw-bold m-0 text-center" style={{ color: '#2E1A47', minWidth: '200px' }}>
          {monthName} {year}
        </h3>

        <button className="btn p-2 border-0" onClick={goNext} style={{ color: '#663399' }}>
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Weekdays */}
      <div className="row g-0 text-center mb-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="col fw-bold small text-uppercase" style={{ color: '#A3779D', letterSpacing: '0.5px' }}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="row g-2 text-center" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
        {/* Empty cells */}
        {Array(firstDay).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className="p-2"></div>
        ))}

        {/* Actual Dates */}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const holiday = holidayMap[day];

          return (
            <div key={day} className="p-1">
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  margin: '0 auto',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                  backgroundColor: holiday
                    ? (holiday.type === "Public" ? '#663399' : '#E6C7E6')
                    : 'transparent',
                  color: holiday
                    ? (holiday.type === "Public" ? '#ffffff' : '#663399')
                    : '#2E1A47',
                  border: holiday ? 'none' : '1px solid transparent',
                }}
                className={!holiday ? "hover-date" : ""}
              >
                {day}
              </div>

              {holiday && (
                <div className="x-small mt-2 fw-bold" style={{ color: holiday.type === "Public" ? '#663399' : '#A3779D', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {holiday.holidayName}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .hover-date:hover {
          background-color: #fdfbff !important;
          border-color: #E6C7E6 !important;
          color: #663399 !important;
        }
      `}</style>
    </div>
  );
}
