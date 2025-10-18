import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonButton,
  IonRouterLink,
} from "@ionic/react";
import {
  peopleOutline,
  calendarOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  eyeOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import { motion } from "framer-motion";
import "./DashboardBHW.css";

const DashboardBHW: React.FC = () => {
  const [motherCount, setMotherCount] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [highRiskCount, setHighRiskCount] = useState(0);
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [mothers, setMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = localStorage.getItem("full_name") || "Barangay Health Worker";
  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      try {
        // Mothers
        const { count: mCount, data: mData } = await supabase
          .from("mothers")
          .select("*", { count: "exact" });
        setMotherCount(mCount ?? 0);
        setMothers(mData ?? []);

        // Appointments
        const { data: apptData } = await supabase
          .from("appointments")
          .select(`id, mother_id, date, time, location, notes, status, mothers(name)`)
          .gte("date", today)
          .order("date", { ascending: true });
        setAppointments(apptData ?? []);

        // High Risk
        const { count: riskCount } = await supabase
          .from("risk_monitoring")
          .select("*", { count: "exact" })
          .eq("risk_level", "High");
        setHighRiskCount(riskCount ?? 0);

        // Visits today — count from health_records
        const { count: todayVisits } = await supabase
          .from("health_records")
          .select("*", { count: "exact" })
          .eq("encounter_date", today);
        setTodayVisitCount(todayVisits ?? 0);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getNextAppointment = (motherId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const next = appointments
      .filter((a) => a.mother_id === motherId && a.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    return next ? `${next.date} ${next.time || ""}` : "None";
  };

  const goToPage = (path: string) => history.push(path);

  return (
    <MainLayout>
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-header">
          <h1>Hi, {fullName}! 👋</h1>
          <p>Here’s your updated maternal health overview.</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-grid">
          <IonCard className="stat-card success" onClick={() => goToPage("/mothers")}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={peopleOutline} /> Registered Mothers
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading ? <IonSpinner name="dots" /> : <strong>{motherCount}</strong>}
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card info" onClick={() => goToPage("/appointments")}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={calendarOutline} /> Upcoming Appointments
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{appointments.length}</strong>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card primary" onClick={() => goToPage("/visitrecords")}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={checkmarkCircleOutline} /> Visits Today
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{todayVisitCount}</strong>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card danger" onClick={() => goToPage("/riskmonitoring")}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={alertCircleOutline} /> High-Risk Cases
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{highRiskCount}</strong>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Recent Mothers */}
        <div className="dashboard-content-split">
          <div className="dashboard-left">
            <h2>Recent Mothers</h2>
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Next Appointment</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mothers.length === 0 ? (
                  <tr>
                    <td colSpan={3}>No data</td>
                  </tr>
                ) : (
                  mothers.slice(0, 5).map((m) => (
                    <tr key={m.id}>
                      <td>{m.name}</td>
                      <td>{getNextAppointment(m.id)}</td>
                      <td>
                        <IonIcon
                          icon={eyeOutline}
                          className="action-icon view"
                          onClick={() => goToPage(`/mothers/${m.id}`)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Appointments */}
          <div className="dashboard-right">
            <h2>Upcoming Appointments</h2>
            <ul className="appointments-list">
              {appointments.length === 0 ? (
                <li>No upcoming appointments</li>
              ) : (
                appointments.slice(0, 6).map((a) => (
                  <motion.li key={a.id} whileHover={{ scale: 1.02 }}>
                    <strong>{a.mothers?.name || "Unknown"}</strong>
                    <br />
                    {a.date} {a.time && `• ${a.time}`}
                    <br />
                    <small>{a.location}</small>
                  </motion.li>
                ))
              )}
            </ul>
            <IonRouterLink routerLink="/appointments">
              <IonButton expand="block" fill="clear">
                View All →
              </IonButton>
            </IonRouterLink>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default DashboardBHW;
