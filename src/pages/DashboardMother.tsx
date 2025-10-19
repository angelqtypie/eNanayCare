import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonModal,
  IonButton,
} from "@ionic/react";
import {
  calendarOutline,
  heartOutline,
  bulbOutline,
  bandageOutline,
  statsChartOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

interface Appointment {
  date: string;
  time: string | null;
  status: string;
}

interface HealthRecord {
  bp: string | null;
  weight: number | null;
  encounter_date: string;
  tt_status: string | null;
}

interface ImmunizationItem {
  name: string;
  status: "Completed" | "Pending";
  date: string | null;
}

const DashboardMother: React.FC = () => {
  const history = useHistory();

  const [motherName, setMotherName] = useState("Mommy");
  const [dailyTip, setDailyTip] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [pastVisits, setPastVisits] = useState<HealthRecord[]>([]);
  const [summary, setSummary] = useState({ totalVisits: 0, totalAppointments: 0 });
  const [immunizations, setImmunizations] = useState<ImmunizationItem[]>([]);
  const [showImmunizationModal, setShowImmunizationModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
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
  ];

  /** 🔹 Format Time */
  const formatTime = (time: string | null) => {
    if (!time || time === "00:00:00" || time === "00:00") return "To be announced";
    const [hour, minute] = time.split(":");
    const d = new Date();
    d.setHours(Number(hour), Number(minute));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  /** 🔹 Fetch Mother Info */
  const fetchMotherProfile = async (): Promise<string | null> => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return null;

      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (!mother) return null;

      const { data: settings } = await supabase
        .from("mother_settings")
        .select("nickname")
        .eq("mother_id", mother.mother_id)
        .maybeSingle();

      setMotherName(settings?.nickname || "Mommy");
      return mother.mother_id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /** 🔹 Next + Past Appointments */
  const fetchAppointments = async (motherId: string) => {
    const today = new Date().toISOString().split("T")[0];

    const { data: upcoming } = await supabase
      .from("appointments")
      .select("date, time, status")
      .eq("mother_id", motherId)
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(1)
      .maybeSingle();

    const { data: past } = await supabase
      .from("appointments")
      .select("date, time, status")
      .eq("mother_id", motherId)
      .lt("date", today)
      .order("date", { ascending: false });

    setAppointment(upcoming || null);
    setPastAppointments(past || []);
  };

  /** 🔹 Health Records + Past Visits */
  const fetchHealthRecords = async (motherId: string) => {
    const { data } = await supabase
      .from("health_records")
      .select("bp, weight, encounter_date, tt_status")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });

    if (data?.length) {
      setHealthRecord(data[0]);
      setPastVisits(data.slice(1));
      setSummary((s) => ({ ...s, totalVisits: data.length }));
    }
  };

  /** 🔹 Immunization (TT1, TT2) */
  const fetchImmunization = async (motherId: string) => {
    const { data } = await supabase
      .from("health_records")
      .select("tt_status, encounter_date")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });

    interface TTRecord {
      tt_status: string | null;
      encounter_date: string;
    }

    const ttList = ["TT1", "TT2"];
    const immunizationList: ImmunizationItem[] = ttList.map((tt) => {
      const found = (data as TTRecord[] | null)?.find(
        (d: TTRecord) => d.tt_status === tt
      );
      return {
        name: tt,
        status: found ? "Completed" : "Pending",
        date: found ? found.encounter_date : null,
      };
    });

    setImmunizations(immunizationList);
  };

  /** 🔹 Summary Count */
  const fetchSummary = async (motherId: string) => {
    const { count: totalAppointments } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true })
      .eq("mother_id", motherId);

    setSummary((s) => ({ ...s, totalAppointments: totalAppointments || 0 }));
  };

  /** 🔹 Daily Tip */
  const fetchDailyTip = async () => {
    const { data } = await supabase
      .from("educational_materials")
      .select("content")
      .eq("is_published", true)
      .ilike("category", "%Maternal Health%");

    if (data?.length) {
      const random = data[Math.floor(Math.random() * data.length)].content;
      setDailyTip(random);
    } else {
      setDailyTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
    }
  };

  /** 🔹 Load All Data */
  const loadDashboardData = async () => {
    setLoading(true);
    const id = await fetchMotherProfile();
    if (id) {
      await Promise.all([
        fetchAppointments(id),
        fetchHealthRecords(id),
        fetchImmunization(id),
        fetchSummary(id),
        fetchDailyTip(),
      ]);
    } else await fetchDailyTip();
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 60000);
    return () => clearInterval(interval);
  }, []);

  const latestTT = immunizations.find((i) => i.status === "Completed");

  return (
    <MotherMainLayout>
      <IonContent className="dashboard-content" scrollY>
        {/* Header */}
        <div className="header-gradient">
          <div className="header-text">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful 🌼</p>
          </div>
        </div>

        {/* Summary */}
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

        {/* Cards */}
        <div className="cards-grid">
          {/* Appointment */}
          <IonCard
            className="mother-card soft-pink"
            button
            onClick={() => setShowHistoryModal(true)}
          >
            <IonCardContent>
              <IonIcon icon={calendarOutline} className="card-icon" />
              <h3>Appointments</h3>
              {appointment ? (
                <>
                  <p>
                    {new Date(appointment.date).toLocaleDateString()} •{" "}
                    {formatTime(appointment.time)}
                  </p>
                  <span className="status">{appointment.status}</span>
                </>
              ) : (
                <p>No upcoming appointments</p>
              )}
            </IonCardContent>
          </IonCard>

          {/* Health Record */}
          <IonCard
            className="mother-card soft-lilac"
            button
            onClick={() => history.push("/motherhealthrecords")}
          >
            <IonCardContent>
              <IonIcon icon={heartOutline} className="card-icon" />
              <h3>Health Record</h3>
              {healthRecord ? (
                <p>
                  BP: {healthRecord.bp || "-"} | Weight:{" "}
                  {healthRecord.weight ? `${healthRecord.weight}kg` : "-"}
                </p>
              ) : (
                <p>No health data yet</p>
              )}
            </IonCardContent>
          </IonCard>

          {/* Daily Tip */}
          <IonCard className="mother-card clean-white">
            <IonCardContent>
              <IonIcon icon={bulbOutline} className="card-icon" />
              <h3>Tip for Today</h3>
              {loading ? <IonSpinner name="dots" /> : <p>{dailyTip}</p>}
            </IonCardContent>
          </IonCard>

          {/* Immunization */}
          <IonCard
            className="mother-card soft-rose"
            button
            onClick={() => setShowImmunizationModal(true)}
          >
            <IonCardContent>
              <IonIcon icon={bandageOutline} className="card-icon" />
              <h3>Immunization</h3>
              {latestTT ? (
                <p>
                  Last: {latestTT.name} •{" "}
                  {latestTT.date
                    ? new Date(latestTT.date).toLocaleDateString()
                    : ""}
                </p>
              ) : (
                <p>No TT record yet</p>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* ✅ Clean Small Immunization Modal */}
        <IonModal
          isOpen={showImmunizationModal}
          onDidDismiss={() => setShowImmunizationModal(false)}
          className="small-modal no-overlay"
        >
          <div className="immunization-modal small">
            <h2>
              <IonIcon icon={bandageOutline} /> TT Immunization
            </h2>
            <ul>
              {immunizations.map((item) => (
                <li
                  key={item.name}
                  className={item.status === "Completed" ? "done" : "pending"}
                >
                  <IonIcon
                    icon={
                      item.status === "Completed"
                        ? checkmarkCircleOutline
                        : closeCircleOutline
                    }
                  />
                  <div>
                    <strong>{item.name}</strong>
                    <p>
                      {item.status}{" "}
                      {item.date &&
                        `• ${new Date(item.date).toLocaleDateString()}`}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <IonButton
              expand="block"
              onClick={() => setShowImmunizationModal(false)}
            >
              Close
            </IonButton>
          </div>
        </IonModal>

        {/* History Modal */}
        <IonModal
          isOpen={showHistoryModal}
          onDidDismiss={() => setShowHistoryModal(false)}
        >
          <div className="history-modal">
            <h2>
              <IonIcon icon={calendarOutline} /> Appointment & Visit History
            </h2>

            <h3>Past Appointments</h3>
            {pastAppointments.length > 0 ? (
              <ul>
                {pastAppointments.map((a, i) => (
                  <li key={i}>
                    {new Date(a.date).toLocaleDateString()} •{" "}
                    {formatTime(a.time)} - {a.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No past appointments.</p>
            )}

            <h3>Past Visits</h3>
            {pastVisits.length > 0 ? (
              <ul>
                {pastVisits.map((v, i) => (
                  <li key={i}>
                    {new Date(v.encounter_date).toLocaleDateString()} • BP:{" "}
                    {v.bp || "-"} | Weight:{" "}
                    {v.weight ? `${v.weight}kg` : "-"}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No previous visits.</p>
            )}

            <IonButton expand="block" onClick={() => setShowHistoryModal(false)}>
              Close
            </IonButton>
          </div>
        </IonModal>
      </IonContent>
    </MotherMainLayout>
  );
};

export default DashboardMother;
