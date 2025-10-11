import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  peopleOutline,
  calendarOutline,
  alertCircleOutline,
  eyeOutline,
  trashOutline,
} from "ionicons/icons";

import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import "./DashboardBHW.css";

const DashboardBHW: React.FC = () => {
  const [motherCount, setMotherCount] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fullName = localStorage.getItem("full_name") || "BHW";

  // Fetch mother count + list
  useEffect(() => {
    const fetchMothers = async () => {
      const { count, data, error } = await supabase
        .from("mothers")
        .select("*", { count: "exact" });
      if (error) console.error(error);
      setMotherCount(count ?? 0);
      setMothers(data ?? []);
    };
    fetchMothers();
  }, []);

  // Fetch appointments (upcoming only)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const today = new Date().toISOString().split("T")[0];
        const { data, error } = await supabase
          .from("appointments")
          .select(
            `id, mother_id, date, time, location, notes, status, mothers(name)`
          ) // join mother name
          .gte("date", today)
          .eq("status", "Scheduled")
          .order("date", { ascending: true });
        if (error) throw error;
        setAppointments(data ?? []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  // Helper: find next appointment for a mother
  const getNextAppointment = (motherId: string) => {
    const next = appointments
      .filter((a) => a.mother_id === motherId)
      .sort(
        (a, b) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
      )[0];
    return next ? `${next.date} ${next.time || ""}` : "None";
  };

  return (
    <MainLayout>
      <div className="dashboard-header">
        <h1>Good morning, {fullName}! 👋</h1>
        <p>
          Here’s an overview of maternal health activities in your barangay
          today.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="dashboard-grid">
        {/* Registered Mothers */}
        <IonCard className="stat-card success">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={peopleOutline} /> Registered Mothers
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {loading ? (
              <IonSpinner name="dots" />
            ) : (
              <div className="stat-value">
                <strong>{motherCount}</strong>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Upcoming Appointments */}
        <IonCard className="stat-card info">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={calendarOutline} /> Upcoming Appointments
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stat-value">
              <strong>{appointments.length}</strong>
              <span className="stat-change">
                Next: {appointments[0]?.date || "None"}
              </span>
            </div>
          </IonCardContent>
        </IonCard>

        {/* High-Risk Cases */}
        <IonCard className="stat-card danger">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={alertCircleOutline} /> High-Risk Cases
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stat-value">
              <strong>3</strong>
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      {/* Content Split */}
      <div className="dashboard-content-split">
        {/* LEFT TABLE */}
        <div className="dashboard-left">
          <h2>Recent Mothers Registry</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Next Appointment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {mothers.length === 0 ? (
                <tr>
                  <td colSpan={3} className="empty-data">
                    No mothers registered yet.
                  </td>
                </tr>
              ) : (
                mothers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{getNextAppointment(m.id)}</td>
                    <td>
                      <IonIcon
                        icon={eyeOutline}
                        className="action-icon view"
                      />
                      <IonIcon
                        icon={trashOutline}
                        className="action-icon delete"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* RIGHT LIST */}
        <div className="dashboard-right">
          <h2>Upcoming Appointments</h2>
          <ul className="appointments-list">
            {appointments.length === 0 ? (
              <li className="empty-data">No upcoming appointments.</li>
            ) : (
              appointments.map((appt) => (
                <li key={appt.id}>
                  <strong>{appt.mothers?.name || "Unknown"}</strong>
                  <br />
                  {appt.date} {appt.time && `• ${appt.time}`}
                  <br />
                  <small>{appt.location}</small>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardBHW;
