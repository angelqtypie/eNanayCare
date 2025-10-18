// src/pages/DashboardMother.tsx
import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import {
  calendarOutline,
  heartOutline,
  bulbOutline,
  bandageOutline,
  statsChartOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

const DashboardMother: React.FC = () => {
  const history = useHistory();

  const [motherName, setMotherName] = useState("Mommy");
  const [dailyTip, setDailyTip] = useState("");
  const [appointment, setAppointment] = useState<any>(null);
  const [healthRecord, setHealthRecord] = useState<any>(null);
  const [summary, setSummary] = useState({ totalVisits: 0, totalAppointments: 0 });
  const [loading, setLoading] = useState(true);

  const fallbackTips = [
    "Stay hydrated — drink at least 8 glasses of water daily.",
    "Eat more fruits and vegetables for a balanced diet.",
    "Take short naps to fight fatigue.",
    "Avoid skipping prenatal vitamins.",
    "Walk for at least 20 minutes a day (if approved by your doctor).",
    "Always keep your prenatal check-up schedule.",
    "Avoid stress — meditation and calm music help.",
    "Talk to your baby — it helps bonding early.",
    "Get enough sleep — your body needs rest.",
    "Eat iron-rich foods like spinach and red meat to prevent anemia.",
  ];

  /** Get mother_id and nickname */
  const fetchMotherProfile = async (): Promise<string | null> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return null;

      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (motherError || !mother) return null;

      const { data: settings } = await supabase
        .from("mother_settings")
        .select("nickname")
        .eq("mother_id", mother.mother_id)
        .maybeSingle();

      setMotherName(settings?.nickname || "Mommy");
      return mother.mother_id;
    } catch (err) {
      console.error("fetchMotherProfile error:", err);
      return null;
    }
  };

  /** Get next upcoming appointment */
  const fetchNextAppointment = async (motherId: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("appointments")
        .select("date, time, status")
        .eq("mother_id", motherId)
        .gte("date", today)
        .order("date", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setAppointment(data);
    } catch (err) {
      console.error("fetchNextAppointment error:", err);
      setAppointment(null);
    }
  };

  /** Get latest health record */
  const fetchLatestHealthRecord = async (motherId: string) => {
    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("bp, weight, encounter_date")
        .eq("mother_id", motherId)
        .order("encounter_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setHealthRecord(data);
    } catch (err) {
      console.error("fetchLatestHealthRecord error:", err);
      setHealthRecord(null);
    }
  };

  /** Fetch visit summary (appointments & visits) */
  const fetchSummary = async (motherId: string) => {
    try {
      const [{ count: totalAppointments }, { count: totalVisits }] =
        await Promise.all([
          supabase
            .from("appointments")
            .select("*", { count: "exact", head: true })
            .eq("mother_id", motherId),
          supabase
            .from("visit_records")
            .select("*", { count: "exact", head: true })
            .eq("mother_id", motherId),
        ]);
      setSummary({
        totalAppointments: totalAppointments || 0,
        totalVisits: totalVisits || 0,
      });
    } catch (err) {
      console.error("fetchSummary error:", err);
    }
  };

  /** Random maternal health tip */
  const fetchDailyTip = async () => {
    try {
      const { data, error } = await supabase
        .from("educational_materials")
        .select("content")
        .eq("is_published", true)
        .ilike("category", "%Maternal Health%");

      if (error || !data?.length) {
        setDailyTip(
          fallbackTips[Math.floor(Math.random() * fallbackTips.length)]
        );
      } else {
        const randomTip = data[Math.floor(Math.random() * data.length)].content;
        setDailyTip(randomTip);
      }
    } catch (err) {
      console.error("fetchDailyTip error:", err);
      setDailyTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
    }
  };

  /** Load all data */
  const loadDashboardData = async () => {
    setLoading(true);
    const motherId = await fetchMotherProfile();
    if (motherId) {
      await Promise.all([
        fetchNextAppointment(motherId),
        fetchLatestHealthRecord(motherId),
        fetchSummary(motherId),
        fetchDailyTip(),
      ]);
    } else {
      await fetchDailyTip();
    }
    setLoading(false);
  };

  /** Initial load + auto-refresh every 60s */
  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <MotherMainLayout>
      <IonContent className="dashboard-content" scrollY={true} forceOverscroll={false}>
        <div className="header-gradient">
          <div className="floating-decor decor-1"></div>
          <div className="floating-decor decor-2"></div>
          <div className="floating-decor decor-3"></div>
          <div className="floating-decor decor-4"></div>

          <div className="header-text">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful 🌼</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="summary-section">
          <IonCard className="summary-card">
            <IonCardContent>
            <IonIcon icon={statsChartOutline} />
              <div className="summary-stats">
                <div>
                  <h4>{summary.totalAppointments}</h4>
                  <p>Appointments</p>
                </div>
                <div>
                  <h4>{summary.totalVisits}</h4>
                  <p>Visits</p>
                </div>
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Functional Cards */}
        <div className="cards-grid">
          <IonCard
            className="mother-card soft-pink"
            button
            onClick={() => history.push("/motherscalendar")}
          >
            <IonCardContent>
              <IonIcon icon={calendarOutline} className="card-icon" />
              <h3>Appointment</h3>
              {appointment ? (
                <>
                  <p>
                    Next check-up:{" "}
                    {new Date(appointment.date).toLocaleDateString()} •{" "}
                    {appointment.time || "TBA"}
                  </p>
                  <span className="status">{appointment.status}</span>
                </>
              ) : (
                <p>No appointment scheduled</p>
              )}
            </IonCardContent>
          </IonCard>

          <IonCard
            className="mother-card soft-lilac"
            button
            onClick={() => history.push("/motherhealthrecords")}
          >
            <IonCardContent>
              <IonIcon icon={heartOutline} className="card-icon" />
              <h3>Health Records</h3>
              {healthRecord ? (
                <p>
                  BP: {healthRecord.bp || "-"} | Weight:{" "}
                  {healthRecord.weight ? `${healthRecord.weight}kg` : "-"}
                </p>
              ) : (
                <p>No recent records</p>
              )}
            </IonCardContent>
          </IonCard>

          <IonCard className="mother-card clean-white">
            <IonCardContent>
              <IonIcon icon={bulbOutline} className="card-icon" />
              <h3>Tip for Today</h3>
              {loading ? <IonSpinner name="dots" /> : <p>{dailyTip}</p>}
            </IonCardContent>
          </IonCard>

          <IonCard
            className="mother-card soft-rose"
            button
            onClick={() => history.push("/motherimmunization")}
          >
            <IonCardContent>
              <IonIcon icon={bandageOutline} className="card-icon" />
              <h3>Immunization</h3>
              <p>Check upcoming vaccines</p>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </MotherMainLayout>
  );
};

export default DashboardMother;
