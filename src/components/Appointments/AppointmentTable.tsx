// src/components/appointments/AppointmentTable.tsx
import React from "react";

interface Appointment {
  motherName: string;
  date: string;
  time: string;
  notes: string;
}

export default function AppointmentTable({ data }: { data: Appointment[] }) {
  if (!data.length) return <p className="empty-text">No appointments scheduled yet.</p>;

  return (
    <div className="table-wrapper">
      {/* Desktop Table */}
      <table className="appointments-table desktop-only">
        <thead>
          <tr>
            <th>Mother</th>
            <th>Date</th>
            <th>Time</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {data.map((a, i) => (
            <tr key={i}>
              <td>{a.motherName}</td>
              <td>{a.date}</td>
              <td>{a.time}</td>
              <td>{a.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
