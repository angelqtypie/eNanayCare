// src/components/appointments/AppointmentCard.tsx
import React from "react";

interface Appointment {
  motherName: string;
  date: string;
  time: string;
  notes: string;
}

export default function AppointmentCard({ data }: { data: Appointment[] }) {
  return (
    <div className="mobile-only appointments-cards">
      {data.map((a, i) => (
        <div key={i} className="appointment-card">
          <p><strong>{a.motherName}</strong></p>
          <p>{a.date} at {a.time}</p>
          <p>{a.notes}</p>
        </div>
      ))}
    </div>
  );
}
