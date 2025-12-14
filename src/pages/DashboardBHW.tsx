// src/pages/DashboardBHW.tsx
import React, { useEffect, useState } from "react";
import {
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonModal,
  IonButton,
} from "@ionic/react";
import {
  peopleOutline,
  calendarOutline,
  checkmarkCircleOutline,
  alertCircleOutline,
  megaphoneOutline,
  closeCircleOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";
import "./DashboardBHW.css";

interface BarangayUpdate {
  id: number;
  title: string;
  description: string;
  date_posted: string;
}

interface RiskReport {
  id: number;
  mother_id: number;
  mother_name: string;
  risk_type: string;
  status: string;
  created_at: string;
  address?: string;
}

const DashboardBHW: React.FC = () => {
  const history = useHistory();

  const [motherCount, setMotherCount] = useState(0);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [todayVisitCount, setTodayVisitCount] = useState(0);
  const [riskReports, setRiskReports] = useState<RiskReport[]>([]);
  const [updates, setUpdates] = useState<BarangayUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskReport | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fullName = localStorage.getItem("full_name") || "Barangay Health Worker";
  const bhwZone = localStorage.getItem("zone") || ""; // e.g., "Zone 1"

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
        // === Mothers filtered by BHW zone ===
        const { count: mCount } = await supabase
          .from("mothers")
          .select("*", { count: "exact" })
          .eq("address", bhwZone);
        setMotherCount(mCount ?? 0);

        // === Appointments filtered by zone ===
        const { data: apptData } = await supabase
        .from("appointments")
        .select("*, mothers!inner(address)")
        .eq("mothers.address", bhwZone)
        .gte("date", today);      
        setAppointments(apptData ?? []);

        // === Health Records filtered by zone ===
        const { count: visitCount } = await supabase
        .from("health_records")
        .select("*, mothers!inner(address)", { count: "exact" })
        .eq("encounter_date", today)
        .eq("mothers.address", bhwZone);      
        setTodayVisitCount(visitCount ?? 0);

        // === Risk Reports filtered based on mother's address ===
        const { data: riskData } = await supabase
          .from("risk_reports")
          .select("*, mothers!inner(address)")
          .eq("status", "Pending")
          .eq("mothers.address", bhwZone)
          .order("created_at", { ascending: false });

        const typedRiskData = (riskData ?? []) as RiskReport[];
        const uniqueRisks = Array.from(
          new Map(typedRiskData.map((r: RiskReport) => [r.mother_id, r])).values()
        );
        setRiskReports(uniqueRisks);

        // === Barangay Updates (all zones visible) ===
        const { data: updatesData } = await supabase
          .from("barangay_updates")
          .select("*")
          .order("date_posted", { ascending: false })
          .limit(5);
        setUpdates((updatesData ?? []) as BarangayUpdate[]);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [bhwZone]);

  const handleRiskClick = (risk: RiskReport) => {
    setSelectedRisk(risk);
    setShowModal(true);
  };

  return (
    <MainLayout>
      <motion.div
        className="dashboard-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="dashboard-header">
          <h1>
            {getGreeting()}, <span>{fullName}!</span>
          </h1>
          <p className="sub-text">
            Monitoring mothers in <strong>{bhwZone}</strong>. Keep them safe and well.
          </p>
        </div>

        {/* === Top Stats Section === */}
        <div className="dashboard-grid">
          <IonCard
            className="stat-card clickable"
            onClick={() => history.push("/mothers")}
          >
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
            className="stat-card clickable"
            onClick={() => history.push("/appointments")}
          >
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

        {/* === Risk & Updates Section === */}
        <div className="dashboard-bottom">
          <div className="updates-card">
            <h2>
              <IonIcon icon={megaphoneOutline} /> Barangay Updates
            </h2>
            {updates.length === 0 ? (
              <p className="empty-text">No updates available.</p>
            ) : (
              <ul className="update-list">
                {updates.map((update) => (
                  <li key={update.id}>
                    <strong>{update.title}</strong> — {update.description}
                    <br />
                    <small>{new Date(update.date_posted).toLocaleDateString()}</small>
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
