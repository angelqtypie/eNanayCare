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
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [mothers, setMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = localStorage.getItem("full_name") || "Barangay Health Worker";
  const history = useHistory();

  // ✅ Local date helper (fixes UTC offset issue)
  const getLocalDate = (): string => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1000);
    return local.toISOString().split("T")[0];
  };

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // ✅ Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = getLocalDate();

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
          .select(
            `
            id,
            mother_id,
            date,
            time,
            location,
            notes,
            status,
            mothers (
              first_name,
              last_name
            )
          `
          )
          .gte("date", today)
          .order("date", { ascending: true });
        setAppointments(apptData ?? []);

        // ✅ Visits (use local date)
        const { count: todayVisits } = await supabase
          .from("health_records")
          .select("*", { count: "exact" })
          .eq("encounter_date", today);
        setTodayVisitCount(todayVisits ?? 0);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Format readable date/time
  const formatAppointmentDateTime = (date: string, time?: string) => {
    try {
      const d = new Date(date);
      const formattedDate = d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      let formattedTime = "";
      if (time) {
        const t = time.length === 5 ? `${time}:00` : time;
        const dt = new Date(`1970-01-01T${t}`);
        formattedTime = dt.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }

      return formattedTime ? `${formattedDate} • ${formattedTime}` : formattedDate;
    } catch {
      return `${date} ${time || ""}`;
    }
  };

  // Get next appointment per mother
  const getNextAppointment = (motherId: string) => {
    const today = getLocalDate();
    const next = appointments
      .filter((a) => a.mother_id === motherId && a.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
    return next ? formatAppointmentDateTime(next.date, next.time) : "No appointment";
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
        {/* Header */}
        <div className="dashboard-header">
          <h1>
            {getGreeting()}, <span>{fullName}!</span>
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-grid">
          <IonCard className="stat-card mothers" onClick={() => goToPage("/mothers")}>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={peopleOutline} /> Registered Mothers
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading ? <IonSpinner name="dots" /> : <strong>{motherCount}</strong>}
            </IonCardContent>
          </IonCard>

          <IonCard
            className="stat-card appointments"
            onClick={() => goToPage("/appointments")}
          >
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={calendarOutline} /> Upcoming Appointments
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{appointments.length}</strong>
            </IonCardContent>
          </IonCard>

          <IonCard
            className="stat-card visits"
            onClick={() => goToPage("/visitrecords")}
          >
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={checkmarkCircleOutline} /> Visits Today
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{todayVisitCount}</strong>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Main Content Split */}
        <div className="dashboard-content-split">
          {/* Left: Recent Mothers */}
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
                    <td colSpan={3} className="empty-data">
                      No registered mothers.
                    </td>
                  </tr>
                ) : (
                  mothers.slice(0, 5).map((m) => (
                    <tr key={m.mother_id}>
                      <td>{`${m.first_name} ${m.last_name}`}</td>
                      <td>{getNextAppointment(m.mother_id)}</td>
                      <td>
                        <IonIcon
                          icon={eyeOutline}
                          className="action-icon view"
                          onClick={() => goToPage(`/mothers/${m.mother_id}`)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Right: Appointments */}
          <div className="dashboard-right">
            <h2>Upcoming Appointments</h2>
            <ul className="appointments-list">
              {appointments.length === 0 ? (
                <li className="empty-data">No upcoming appointments</li>
              ) : (
                appointments.slice(0, 5).map((a) => (
                  <motion.li key={a.id} whileHover={{ scale: 1.02 }}>
                    <strong>
                      {a.mothers
                        ? `${a.mothers.first_name} ${a.mothers.last_name}`
                        : "Unknown"}
                    </strong>
                    <br />
                    {formatAppointmentDateTime(a.date, a.time)}
                    <br />
                    <small>{a.location || "No location specified"}</small>
                  </motion.li>
                ))
              )}
            </ul>
            <IonRouterLink routerLink="/appointments">
              <IonButton expand="block" fill="clear" className="view-all-btn">
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
