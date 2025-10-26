import React, { useEffect, useState } from "react";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonModal,
  IonButton,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonItem,
  IonLabel,
  IonCheckbox,
} from "@ionic/react";
import {
  calendarOutline,
  heartOutline,
  bulbOutline,
  bandageOutline,
  leafOutline,
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

interface HealthRecordRow {
  tt_status: string | null;
  encounter_date: string;
}

interface WellnessLogRow {
  created_at: string;
}

const vitaminList = [ "Iron", "Calcium", "Folic Acid", "Vitamin D"];

const DashboardMother: React.FC = () => {
  const history = useHistory();

  const [motherName, setMotherName] = useState("Mommy");
  const [dailyTip, setDailyTip] = useState("");
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [immunizations, setImmunizations] = useState<ImmunizationItem[]>([]);
  const [showImmunizationModal, setShowImmunizationModal] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasWellnessLog, setHasWellnessLog] = useState(false);

  // Wellness states
  const [sleepHours, setSleepHours] = useState("");
  const [meals, setMeals] = useState("");
  const [hydration, setHydration] = useState("");
  const [exercise, setExercise] = useState("");
  const [mood, setMood] = useState("");
  const [vitamins, setVitamins] = useState<string[]>([]);

  const handleVitaminToggle = (vit: string) =>
    setVitamins((prev) =>
      prev.includes(vit) ? prev.filter((v) => v !== vit) : [...prev, vit]
    );

  const fallbackTips = [
    "Stay hydrated — drink at least 8 glasses of water daily.",
    "Eat more fruits and vegetables for a balanced diet.",
    "Avoid skipping prenatal vitamins.",
    "Take short naps to fight fatigue.",
    "Walk for at least 20 minutes daily (if approved by your doctor).",
    "Avoid stress — meditation and calm music help.",
    "Talk to your baby — it helps bonding early.",
  ];

  const formatTime = (time: string | null) => {
    if (!time || time === "00:00:00" || time === "00:00")
      return "To be announced";
    const [hour, minute] = time.split(":");
    const d = new Date();
    d.setHours(Number(hour), Number(minute));
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
    setAppointment(upcoming || null);
  };

  const fetchHealthRecords = async (motherId: string) => {
    const { data } = await supabase
      .from("health_records")
      .select("bp, weight, encounter_date, tt_status")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });
    if (data?.length) setHealthRecord(data[0]);
  };

  const fetchImmunization = async (motherId: string) => {
    const { data } = await supabase
      .from("health_records")
      .select("tt_status, encounter_date")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });

    const ttList = ["TT1", "TT2"];
    const immunizationList: ImmunizationItem[] = ttList.map((tt: string) => {
      const found = data?.find(
        (record: HealthRecordRow) => record.tt_status === tt
      );
      return {
        name: tt,
        status: found ? "Completed" : "Pending",
        date: found ? found.encounter_date : null,
      };
    });
    setImmunizations(immunizationList);
  };

  const fetchDailyTip = async () => {
    const { data } = await supabase
      .from("educational_materials")
      .select("content")
      .eq("is_published", true)
      .ilike("category", "%Maternal Health%");
    if (data?.length)
      setDailyTip(data[Math.floor(Math.random() * data.length)].content);
    else
      setDailyTip(fallbackTips[Math.floor(Math.random() * fallbackTips.length)]);
  };

  const checkWellnessLog = async (motherId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("wellness_logs")
      .select("id, created_at")
      .eq("mother_id", motherId);
    const todayLog = data?.find(
      (log: WellnessLogRow) => log.created_at.split("T")[0] === today
    );
    setHasWellnessLog(!!todayLog);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    const id = await fetchMotherProfile();
    if (id) {
      await Promise.all([
        fetchAppointments(id),
        fetchHealthRecords(id),
        fetchImmunization(id),
        checkWellnessLog(id),
        fetchDailyTip(),
      ]);
    } else await fetchDailyTip();
    setLoading(false);
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const latestTT = immunizations.find((i) => i.status === "Completed");

  return (
    <MotherMainLayout>
      <IonContent className="dashboard-content" fullscreen>
        <div className="dashboard-wrapper">
          <div className="header-gradient">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful</p>
          </div>

          <div className="summary-section">
            <IonCard
              className={`mother-card wellness-card ${
                hasWellnessLog ? "completed" : ""
              }`}
              button
              onClick={() => setShowWellnessModal(true)}
            >
              <IonCardContent>
                <IonIcon icon={leafOutline} className="card-icon" />
                <h3>Wellness Log {hasWellnessLog && "✔"}</h3>
                <p>Track your sleep, meals, hydration, and mood</p>
              </IonCardContent>
            </IonCard>
          </div>

          <div className="cards-grid centered">
            <IonCard
              className="mother-card soft-pink"
              button
              onClick={() => history.push("/motherscalendar")}
            >
              <IonCardContent>
                <IonIcon icon={calendarOutline} className="card-icon" />
                <h3>Appointments</h3>
                {appointment ? (
                  <p>
                    {new Date(appointment.date).toLocaleDateString()} •{" "}
                    {formatTime(appointment.time)}
                  </p>
                ) : (
                  <p>No upcoming appointments</p>
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
                <h3>Health Record</h3>
                {healthRecord ? (
                  <p>
                    BP: {healthRecord.bp || "-"} | Weight:{" "}
                    {healthRecord.weight ? `${healthRecord.weight}kg` : "-"}
                  </p>
                ) : (
                  <p>No records yet</p>
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
              onClick={() => setShowImmunizationModal(true)}
            >
              <IonCardContent>
                <IonIcon icon={bandageOutline} className="card-icon" />
                <h3>Immunization</h3>
                {latestTT ? (
                  <p>
                    Last: {latestTT.name} •{" "}
                    {latestTT.date &&
                      new Date(latestTT.date).toLocaleDateString()}
                  </p>
                ) : (
                  <p>No TT record yet</p>
                )}
              </IonCardContent>
            </IonCard>
          </div>

          {/* Immunization Modal */}
          <IonModal isOpen={showImmunizationModal} onDidDismiss={() => setShowImmunizationModal(false)}>
            <IonContent className="modal-scroll">
              <div className="modal-inner fixed-modal">
                <IonButton fill="clear" className="close-btn" onClick={() => setShowImmunizationModal(false)}>
                  <IonIcon icon={closeCircleOutline} />
                </IonButton>
                <h2>
                  <IonIcon icon={bandageOutline} /> Immunization
                </h2>
                {immunizations.length ? (
                  <ul className="immunization-list">
                    {immunizations.map((item, i) => (
                      <li key={i}>
                        <b>{item.name}</b> — {item.status}
                        {item.date && (
                          <span className="date">
                            ({new Date(item.date).toLocaleDateString()})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No immunization records yet.</p>
                )}
              </div>
            </IonContent>
          </IonModal>

          {/* Wellness Log Modal */}
          <IonModal isOpen={showWellnessModal} onDidDismiss={() => setShowWellnessModal(false)}>
            <IonContent className="modal-scroll">
              <div className="modal-inner fixed-modal">
                <IonButton fill="clear" className="close-btn" onClick={() => setShowWellnessModal(false)}>
                  <IonIcon icon={closeCircleOutline} />
                </IonButton>
                <h2>
                  <IonIcon icon={leafOutline} /> Daily Wellness Log
                </h2>
                <p className="wellness-desc">Fill in your daily wellness details</p>

                <IonItem>
                  <IonLabel position="stacked">Sleep Hours</IonLabel>
                  <IonInput type="number" placeholder="e.g., 8" value={sleepHours} onIonChange={(e) => setSleepHours(e.detail.value!)} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Meals Today</IonLabel>
                  <IonInput type="number" placeholder="e.g., 3" value={meals} onIonChange={(e) => setMeals(e.detail.value!)} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Water (glasses)</IonLabel>
                  <IonInput type="number" placeholder="e.g., 8" value={hydration} onIonChange={(e) => setHydration(e.detail.value!)} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Exercise / Movement</IonLabel>
                  <IonInput placeholder="e.g., 20-min walk" value={exercise} onIonChange={(e) => setExercise(e.detail.value!)} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Mood</IonLabel>
                  <IonSelect placeholder="Select mood" value={mood} onIonChange={(e) => setMood(e.detail.value!)}>
                    <IonSelectOption value="Happy">Happy</IonSelectOption>
                    <IonSelectOption value="Tired">Tired</IonSelectOption>
                    <IonSelectOption value="Anxious">Anxious</IonSelectOption>
                    <IonSelectOption value="Relaxed">Relaxed</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <div className="vitamins-section">
                  <IonLabel>Vitamins Taken</IonLabel>
                  {vitaminList.map((vit) => (
                    <IonItem key={vit}>
                      <IonCheckbox
                        checked={vitamins.includes(vit)}
                        onIonChange={() => handleVitaminToggle(vit)}
                      />
                      <IonLabel>{vit}</IonLabel>
                    </IonItem>
                  ))}
                </div>

                <IonButton
                  expand="block"
                  color="primary"
                  onClick={async () => {
                    try {
                      const userId = localStorage.getItem("userId");
                      if (!userId) {
                        alert("User not logged in");
                        return;
                      }

                      const { data: mother } = await supabase
                        .from("mothers")
                        .select("mother_id")
                        .eq("user_id", userId)
                        .maybeSingle();

                      if (!mother) {
                        alert("Mother profile not found.");
                        return;
                      }

                      const { error } = await supabase.from("wellness_logs").insert({
                        mother_id: mother.mother_id,
                        sleep_hours: sleepHours,
                        meals,
                        hydration,
                        exercise,
                        mood,
                        vitamins: vitamins.join(", "),
                      });

                      if (error) throw error;

                      alert("Wellness log saved successfully!");
                      setHasWellnessLog(true);
                      setShowWellnessModal(false);
                    } catch (err) {
                      console.error(err);
                      alert("Error saving wellness log.");
                    }
                  }}
                >
                  Save Log
                </IonButton>
              </div>
            </IonContent>
          </IonModal>
        </div>
      </IonContent>
    </MotherMainLayout>
  );
};

export default DashboardMother;
