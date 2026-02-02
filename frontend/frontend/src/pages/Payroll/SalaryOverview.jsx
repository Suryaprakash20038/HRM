import React from "react";

export default function SalaryOverview() {
  const data = [
    { name: "John", basic: 30000, hra: 10000, bonus: 2000, deductions: 1500 },
    { name: "Anita", basic: 28000, hra: 9000, bonus: 3000, deductions: 1200 },
  ];

  return (
    <div className="p-3 bg-white rounded shadow-sm">
      <h4 className="mb-3 fw-bold">Salary Overview</h4>

      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Basic</th>
            <th>HRA</th>
            <th>Bonus</th>
            <th>Deductions</th>
            <th>Net</th>
          </tr>
        </thead>
        <tbody>
          {data.map((emp, i) => {
            const net = emp.basic + emp.hra + emp.bonus - emp.deductions;
            return (
              <tr key={i}>
                <td>{emp.name}</td>
                <td>₹ {emp.basic}</td>
                <td>₹ {emp.hra}</td>
                <td>₹ {emp.bonus}</td>
                <td>₹ {emp.deductions}</td>
                <td className="fw-bold">₹ {net}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
