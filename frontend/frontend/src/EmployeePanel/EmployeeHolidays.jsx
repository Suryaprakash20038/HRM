import React, { useEffect, useState } from "react";
import { EMP_THEME } from "./theme";

const API_BASE_URL = "http://localhost:5000/api/holidays";

// Normalize date to YYYY-MM-DD (timezone-proof)
const normalize = (d) => new Date(d).toISOString().split("T")[0];

export default function EmployeeHolidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const token = localStorage.getItem("token");

  // Fetch holidays
  const fetchHolidays = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}?year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      console.log("Employee Holiday API:", json);

      // Correct status check
      if (json.status === "success") {
        setHolidays(json.data.holidays || []);
      } else {
        console.error("Failed to load holidays:", json.message);
      }

    } catch (err) {
      console.error("Employee holiday fetch error:", err);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchHolidays();
  }, [year]);

  // Normalize today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = normalize(today);

  // Counters
  const counts = {
    total: holidays.length,
    statutory: holidays.filter((h) => h.type === "Statutory").length,
    floating: holidays.filter((h) => h.type === "Floating").length,
  };

  // Next Holiday
  const nextHoliday =
    holidays.find((h) => normalize(h.date) >= todayStr) || null;

  // Calendar helpers
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const totalDays = daysInMonth(year, month);

  // Month switch logic
  const changeMonth = (direction) => {
    setMonth((prev) => {
      if (direction === "prev") {
        if (prev === 0) {
          setYear((y) => y - 1);
          return 11;
        }
        return prev - 1;
      } else {
        if (prev === 11) {
          setYear((y) => y + 1);
          return 0;
        }
        return prev + 1;
      }
    });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-6" style={{ color: EMP_THEME.midnightPlum }}>My Company Holidays</h2>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 shadow">
          <h4 className="font-semibold" style={{ color: EMP_THEME.midnightPlum }}>Total Company Holidays</h4>
          <p className="text-3xl font-bold" style={{ color: EMP_THEME.royalAmethyst }}>{counts.total}</p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h4 className="font-semibold" style={{ color: EMP_THEME.midnightPlum }}>Statutory Holidays</h4>
          <p className="text-3xl font-bold" style={{ color: EMP_THEME.royalAmethyst }}>
            {counts.statutory}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 shadow">
          <h4 className="font-semibold" style={{ color: EMP_THEME.midnightPlum }}>Next Upcoming Holiday</h4>
          <p className="font-bold mt-2" style={{ color: EMP_THEME.softViolet }}>
            {nextHoliday ? (
              <>
                <span style={{ color: EMP_THEME.royalAmethyst }}>{nextHoliday.holidayName}</span> –{" "}
                {new Date(nextHoliday.date).toDateString()}
              </>
            ) : (
              "No upcoming holidays"
            )}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => changeMonth("prev")} className="text-lg">
            ←
          </button>

          <h3 className="text-xl font-bold">
            {new Date(year, month).toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <button onClick={() => changeMonth("next")} className="text-lg">
            →
          </button>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 text-center font-semibold mb-2">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div>
          <div>Thu</div><div>Fri</div><div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 text-center gap-2">

          {/* Empty cells for starting day */}
          {[...Array(firstDayOfMonth)].map((_, i) => (
            <div key={"empty" + i}></div>
          ))}

          {/* Actual days */}
          {[...Array(totalDays)].map((_, i) => {
            const day = i + 1;

            const cellDate = new Date(year, month, day).toISOString().split("T")[0];
            const isToday = cellDate === todayStr;

            // Fix: timezone-safe match
            const holiday = holidays.find(h => {
              const d = new Date(h.date);
              const local = new Date(d.getFullYear(), d.getMonth(), d.getDate());
              return local.toISOString().split("T")[0] === cellDate;
            });

            return (
              <div
                key={day}
                className={`
                  p-2 rounded-xl border flex flex-col items-center justify-center
                  transition-all duration-200
                `}
                style={{
                  ...(holiday ? (
                    holiday.type === "Statutory"
                      ? { backgroundColor: `${EMP_THEME.royalAmethyst}20`, borderColor: EMP_THEME.royalAmethyst, color: EMP_THEME.royalAmethyst }
                      : { backgroundColor: '#d1fae5', borderColor: '#10b981', color: '#047857' } // Keeping green for Floating
                  ) : { backgroundColor: '#f9fafb', borderColor: '#e5e7eb', color: '#374151' }),
                  ...(isToday ? { boxShadow: `0 0 0 2px ${EMP_THEME.royalAmethyst}` } : {})
                }}
              >
                <div className="font-semibold text-lg">{day}</div>

                {holiday && (
                  <div className="text-[10px] mt-1 font-medium">
                    {holiday.holidayName}
                  </div>
                )}

                {isToday && (
                  <div className="w-2 h-2 rounded-full mt-1" style={{ backgroundColor: EMP_THEME.royalAmethyst }}></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 text-sm items-center">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: EMP_THEME.royalAmethyst }}></span>
            <span>Statutory</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-500 rounded-full"></span>
            <span>Floating</span>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: EMP_THEME.royalAmethyst, boxShadow: `0 0 0 2px ${EMP_THEME.lilacMist}` }}></span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Holiday List */}
      <div className="bg-white rounded-xl shadow p-6 mb-10">
        <h3 className="text-xl font-bold mb-4">Holiday List</h3>

        <table className="w-full table-auto">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Image</th>
              <th className="text-left p-2">Date</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Description</th>
            </tr>
          </thead>

          <tbody>
            {holidays.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center p-4 text-gray-500">
                  No holidays added yet.
                </td>
              </tr>
            ) : (
              holidays.map((h) => (
                <tr key={h._id} className="border-b">
                  <td className="p-2">
                    {h.imageUrl ? (
                      <img
                        src={h.imageUrl}
                        alt={h.holidayName}
                        className="w-10 h-10 object-cover rounded-md border"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-100 rounded-md border flex items-center justify-center text-xs text-gray-400">
                        No Img
                      </div>
                    )}
                  </td>
                  <td className="p-2">
                    {new Date(h.date).toDateString()}
                  </td>
                  <td className="p-2">{h.holidayName}</td>
                  <td className="p-2">{h.type}</td>
                  <td className="p-2 text-gray-600">
                    {h.description || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
