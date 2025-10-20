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
  checkmarkCircleOutline,
  leafOutline,
  alertCircleOutline,
  megaphoneOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";
import "./DashboardBHW.css";

interface BarangayUpdate {
  id: number;
  title: string;
  description: string;
  date_posted: string;
}

const DashboardBHW: React.FC = () => {
  const [motherCount, setMotherCount] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [wellnessCount, setWellnessCount] = useState(0);
  const [riskCount, setRiskCount] = useState(0);
  const [updates, setUpdates] = useState<BarangayUpdate[]>([]);
  const [loading, setLoading] = useState(true);

  const fullName = localStorage.getItem("full_name") || "Barangay Health Worker";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getLocalDate = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const local = new Date(today.getTime() - offset * 60 * 1000);
    return local.toISOString().split("T")[0];
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const today = getLocalDate();

      try {
        const { count: mCount } = await supabase
          .from("mothers")
          .select("*", { count: "exact" });
        setMotherCount(mCount ?? 0);

        const { data: apptData } = await supabase
          .from("appointments")
          .select("*")
          .gte("date", today);
        setAppointments(apptData ?? []);

        const { count: visitCount } = await supabase
          .from("health_records")
          .select("*", { count: "exact" })
          .eq("encounter_date", today);
        setTodayVisitCount(visitCount ?? 0);

        const { count: wellCount } = await supabase
          .from("wellness_logs")
          .select("*", { count: "exact" })
          .eq("date", today);
        setWellnessCount(wellCount ?? 0);

        const { count: riskCount } = await supabase
          .from("risk_reports")
          .select("*", { count: "exact" })
          .eq("status", "Pending");
        setRiskCount(riskCount ?? 0);

        // 🆕 Fetch Barangay Updates
        const { data: updatesData, error: updatesError } = await supabase
          .from("barangay_updates")
          .select("*")
          .order("date_posted", { ascending: false })
          .limit(5);

        if (updatesError) throw updatesError;
        setUpdates(updatesData ?? []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <MainLayout>
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="dashboard-header">
          <h1>
            {getGreeting()}, <span>{fullName}!</span>
          </h1>
          <p className="sub-text">
            Thank you for your service today Keep our pregnant moms safe and well.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="dashboard-grid">
          <IonCard className="stat-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={peopleOutline} /> Registered Mothers
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading ? <IonSpinner name="dots" /> : <strong>{motherCount}</strong>}
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={calendarOutline} /> Appointments
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <strong>{appointments.length}</strong>
            </IonCardContent>
          </IonCard>

          <IonCard className="stat-card">
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

        {/* Wellness + Updates Row */}
        <div className="wellness-updates-row">
          <div className="left-col">
            <IonCard className="stat-card">
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={leafOutline} /> Wellness Logs
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <strong>{wellnessCount}</strong>
              </IonCardContent>
            </IonCard>

            <div className="risk-card">
              <h2>
                <IonIcon icon={alertCircleOutline} /> Risk Reports
              </h2>
              {riskCount > 0 ? (
                <p className="alert-text">
                  You have <b>{riskCount}</b> pending risk reports to review.
                </p>
              ) : (
                <p className="alert-text safe">All mothers are safe and stable</p>
              )}
            </div>
          </div>

          <div className="updates-card">
            <h2>
              <IonIcon icon={megaphoneOutline} /> Barangay Updates
            </h2>

            {updates.length === 0 ? (
              <p className="empty-text">No barangay updates available.</p>
            ) : (
              <ul>
                {updates.map((update) => (
                  <li key={update.id}>
                    <strong>{update.title}</strong> — {update.description}
                    <br />
                    <small>
                      {new Date(update.date_posted).toLocaleDateString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
};

export default DashboardBHW;
