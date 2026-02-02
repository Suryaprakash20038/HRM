import React from "react";

export default function HolidayStats({ counts, nextHoliday }) {
  return (
    <div className="row g-4 mb-5">

      <div className="col-md-3">
        <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }} className="p-4 h-100">
          <p className="small mb-1 fw-bold" style={{ color: '#A3779D' }}>Public Holidays</p>
          <p className="h2 fw-bold mb-1" style={{ color: '#663399' }}>{counts.statutory}</p>
          <p className="x-small mb-0" style={{ color: '#A3779D', fontSize: '0.75rem' }}>Mandatory paid days off</p>
        </div>
      </div>

      <div className="col-md-3">
        <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }} className="p-4 h-100">
          <p className="small mb-1 fw-bold" style={{ color: '#A3779D' }}>Optional Holidays</p>
          <p className="h2 fw-bold mb-1" style={{ color: '#D97706' }}>{counts.floating}</p>
          <p className="x-small mb-0" style={{ color: '#A3779D', fontSize: '0.75rem' }}>Employee choice holidays</p>
        </div>
      </div>

      <div className="col-md-3">
        <div style={{ background: '#ffffff', borderRadius: 20, border: '1px solid #E6C7E6', boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.1)' }} className="p-4 h-100">
          <p className="small mb-1 fw-bold" style={{ color: '#A3779D' }}>Total Holidays (Year)</p>
          <p className="h2 fw-bold mb-1" style={{ color: '#2E1A47' }}>{counts.total}</p>
          <p className="x-small mb-0" style={{ color: '#A3779D', fontSize: '0.75rem' }}>Total company-wide events</p>
        </div>
      </div>

      <div className="col-md-3">
        <div style={{ background: '#663399', borderRadius: 20, boxShadow: '0 10px 30px -10px rgba(102, 51, 153, 0.3)' }} className="p-4 h-100 text-white">
          <p className="small mb-1 fw-bold opacity-75">Next Upcoming Holiday</p>
          {nextHoliday ? (
            <>
              <p className="h4 fw-bold mb-1">
                {nextHoliday.holidayName}
              </p>
              <p className="small mb-0 opacity-75">
                {new Date(nextHoliday.date).toDateString()}
              </p>
            </>
          ) : (
            <p className="small mb-0 opacity-75">No upcoming holidays scheduled</p>
          )}
        </div>
      </div>

    </div>
  );
}
