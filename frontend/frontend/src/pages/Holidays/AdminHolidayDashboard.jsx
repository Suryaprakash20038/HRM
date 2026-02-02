import React, { useEffect, useState, useMemo } from "react";
import HolidayStats from "./HolidayStats";
import HolidayCalendar from "./HolidayCalendar";
import HolidayFilters from "./HolidayFilters";
import HolidayTable from "./HolidayTable";
import HolidayModal from "./HolidayModal";

const API_BASE_URL = "http://localhost:5000/api/holidays";

export default function AdminHolidayDashboard() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState("All");
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear());

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const [month, setMonth] = useState(new Date().getMonth());
  const [year, setYear] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    holidayName: "",
    date: "",
    type: "Public",
    description: "",
  });

  // ==========================================
  // FETCH HOLIDAYS
  // ==========================================
  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE_URL}?year=${yearFilter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (data.status === "success") {
        setHolidays(data.data.holidays);
      } else {
        console.error("Failed to load:", data.message);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch when dropdown year changes
  useEffect(() => {
    fetchHolidays();
  }, [yearFilter]);

  // Sync dropdown → calendar
  useEffect(() => {
    if (yearFilter !== year) {
      setYear(yearFilter);
      setMonth(0); // reset to January when switching year ✔
    }
  }, [yearFilter]);

  // Sync calendar → dropdown
  useEffect(() => {
    if (year !== yearFilter) {
      setYearFilter(year);
    }
  }, [year]);

  // ==========================================
  // DELETE HOLIDAY
  // ==========================================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this holiday?")) return;

    const token = localStorage.getItem("token");

    await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    fetchHolidays();
  };

  // ==========================================
  // EDIT HOLIDAY
  // ==========================================
  // ==========================================
  // EDIT HOLIDAY
  // ==========================================
  const handleEdit = (holiday) => {
    setEditingHoliday(holiday);
    setForm({
      holidayName: holiday.holidayName,
      type: holiday.type,
      date: holiday.date.split("T")[0],
      description: holiday.description || "",
      image: null,
    });
    setShowModal(true);
  };

  // ==========================================
  // ADD NEW HOLIDAY
  // ==========================================
  const handleAdd = () => {
    setEditingHoliday(null);
    setForm({
      holidayName: "",
      date: "",
      type: "Public",
      description: "",
      image: null,
    });
    setShowModal(true);
  };

  // ==========================================
  // SUBMIT HOLIDAY (ADD/UPDATE)
  // ==========================================
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");

    const url = editingHoliday
      ? `${API_BASE_URL}/${editingHoliday._id}`
      : API_BASE_URL;

    const method = editingHoliday ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("holidayName", form.holidayName);
    formData.append("date", form.date);
    formData.append("type", form.type);
    formData.append("description", form.description);
    if (form.image) {
      formData.append("image", form.image);
    }

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await res.json();

    if (data.status === "success") {
      setShowModal(false);
      fetchHolidays();
    } else {
      console.error("Save error:", data.message);
    }
  };

  // ==========================================
  // FILTER FOR TABLE ONLY
  // ==========================================
  const filteredHolidays = useMemo(() => {
    return holidays.filter((h) => {
      const hYear = new Date(h.date).getFullYear();
      if (hYear !== Number(yearFilter)) return false;

      if (filterType === "All") return true;
      return h.type === filterType;
    });
  }, [holidays, filterType, yearFilter]);


  // ==========================================
  // COUNT for selected year only (stats)
  // ==========================================
  const yearHolidays = holidays.filter(
    (h) => new Date(h.date).getFullYear() === Number(yearFilter)
  );

  const counts = {
    total: yearHolidays.length,
    statutory: yearHolidays.filter((h) => h.type === "Public").length,
    floating: yearHolidays.filter((h) => h.type === "Optional").length,
  };

  // Next holiday from filtered list
  const nextHoliday = filteredHolidays.find(
    (h) => new Date(h.date) >= new Date()
  );

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading)
    return (
      <div className="text-center text-lg p-20">⏳ Loading holidays...</div>
    );

  return (
    <div className="holiday-page" style={{ padding: '30px', paddingBottom: 80 }}>
      {/* BACKGROUND STYLES */}
      <style>{`
        .holiday-page {
            background-color: #ffffff;
            background-image:
                radial-gradient(at 0% 0%, rgba(102, 51, 153, 0.05) 0px, transparent 50%),
                radial-gradient(at 100% 0%, rgba(163, 119, 157, 0.05) 0px, transparent 50%);
            min-height: 100vh;
        }
      `}</style>

      <div className="mb-5">
        <h2 className="fw-bold m-0" style={{ color: '#2E1A47' }}>Company Holiday Calendar {yearFilter}</h2>
        <p className="text-muted small m-0" style={{ color: '#A3779D' }}>Manage and communicate company-wide holidays and observances</p>
      </div>

      {/* Stats */}
      <HolidayStats counts={counts} nextHoliday={nextHoliday} />

      {/* Calendar uses ALL holidays */}
      <HolidayCalendar
        holidays={holidays}
        month={month}
        year={year}
        setMonth={setMonth}
        setYear={setYear}
      />

      {/* Filters */}
      <HolidayFilters
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        filterType={filterType}
        setFilterType={setFilterType}
        onAdd={handleAdd}
      />

      {/* Table */}
      <HolidayTable
        holidays={filteredHolidays}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      <HolidayModal
        open={showModal}
        onClose={() => setShowModal(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        editing={editingHoliday}
      />
    </div>
  );
}
