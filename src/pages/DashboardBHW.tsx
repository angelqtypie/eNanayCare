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
  notificationsOutline,
  alertCircleOutline,
  clipboardOutline,
  eyeOutline,
  trashOutline,
} from "ionicons/icons";

import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import "./DashboardBHW.css";

const DashboardBHW: React.FC = () => {
  const [motherCount, setMotherCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const fullName = localStorage.getItem("full_name") || "BHW";

  useEffect(() => {
    const fetchMotherCount = async () => {
      try {
        const { count, error } = await supabase
          .from("mothers")
          .select("*", { count: "exact", head: true });

        if (error) throw error;
        setMotherCount(count ?? 0);
      } catch (err) {
        console.error("Error fetching mother count:", err);
        setMotherCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchMotherCount();
  }, []);

  return (
    <MainLayout>
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Good morning, {fullName}! 👋</h1>
        <p>
          Here’s an overview of maternal health activities in your barangay
          today.
        </p>
      </div>

      {/* GRID CARDS */}
      <div className="dashboard-grid">
        {/* Registered Mothers */}
        <IonCard className="stat-card success">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={peopleOutline} />
              Registered Mothers
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {loading ? (
              <IonSpinner name="dots" />
            ) : (
              <div className="stat-value">
                <strong>{motherCount}</strong>
                <span className="stat-change">↑ 8% from last month</span>
              </div>
            )}
          </IonCardContent>
        </IonCard>

        {/* Upcoming Appointments */}
        <IonCard className="stat-card info">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={calendarOutline} />
              Upcoming Appointments
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stat-value">
              <strong>12</strong>
              <span className="stat-change">↑ 3% from last month</span>
            </div>
          </IonCardContent>
        </IonCard>

        {/* Pending Reminders */}
        <IonCard className="stat-card warning">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={notificationsOutline} />
              Pending Reminders
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stat-value">
              <strong>8</strong>
              <span className="stat-change">Needs attention</span>
            </div>
          </IonCardContent>
        </IonCard>

        {/* High-Risk Cases */}
        <IonCard className="stat-card danger">
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={alertCircleOutline} />
              High-Risk Cases
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <div className="stat-value">
              <strong>3</strong>
              <span className="stat-change">Critical</span>
            </div>
          </IonCardContent>
        </IonCard>
      </div>

      {/* CONTENT SPLIT */}
      <div className="dashboard-content-split">
        {/* LEFT TABLE */}
        <div className="dashboard-left">
          <h2>Recent Mothers Registry</h2>
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Age / Pregnancy</th>
                <th>Next Appointment</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Empty state */}
              <tr>
                <td colSpan={6} className="empty-data">
                  No mothers registered yet.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* RIGHT LIST */}
        <div className="dashboard-right">
          <h2>Upcoming Appointments</h2>
          <ul className="appointments-list">
            {/* Empty */}
            <li className="empty-data">No upcoming appointments.</li>
          </ul>
        </div>
      </div>
    </MainLayout>
  );
};

export default DashboardBHW;