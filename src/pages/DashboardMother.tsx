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
} from "@ionic/react";
import {
  calendarOutline,
  heartOutline,
  bulbOutline,
  bandageOutline,
  leafOutline,
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
  const [healthRecord, setHealthRecord] = useState<HealthRecord | null>(null);
  const [immunizations, setImmunizations] = useState<ImmunizationItem[]>([]);
  const [showImmunizationModal, setShowImmunizationModal] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Wellness form state
  const [sleepHours, setSleepHours] = useState("");
  const [meals, setMeals] = useState("");
  const [exercise, setExercise] = useState("");
  const [mood, setMood] = useState("");
  const [vitamins, setVitamins] = useState("");

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
    if (!time || time === "00:00:00" || time === "00:00")
      return "To be announced";
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

  /** 🔹 Appointments */
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

  /** 🔹 Health Records */
  const fetchHealthRecords = async (motherId: string) => {
    const { data } = await supabase
      .from("health_records")
      .select("bp, weight, encounter_date, tt_status")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });
    if (data?.length) setHealthRecord(data[0]);
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
        status: found ? ("Completed" as const) : ("Pending" as const),
        date: found ? found.encounter_date : null,
      };
    });
    setImmunizations(immunizationList);
  };

  /** 🔹 Daily Tip */
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

  /** 🔹 Load All Data */
  const loadDashboardData = async () => {
    setLoading(true);
    const id = await fetchMotherProfile();
    if (id) {
      await Promise.all([
        fetchAppointments(id),
        fetchHealthRecords(id),
        fetchImmunization(id),
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
      <IonContent className="dashboard-content" scrollY>
        {/* Header */}
        <div className="header-gradient">
          <div className="header-text">
            <h2>
              Hello, <span>{motherName}</span>
            </h2>
            <p>Your journey to motherhood is beautiful</p>
          </div>
        </div>

        {/* 🌿 Wellness Card instead of Summary */}
        <div className="summary-section">
          <IonCard
            className="mother-card soft-green"
            button
            onClick={() => setShowWellnessModal(true)}
          >
            <IonCardContent>
              <IonIcon icon={leafOutline} className="card-icon" />
              <h3>Wellness Log</h3>
              <p>Keep track of your rest, meals, exercise, and mood 🌸</p>
            </IonCardContent>
          </IonCard>
        </div>

        {/* Cards Grid */}
        <div className="cards-grid">
          {/* Appointment */}
{/* Appointment */}
{appointment && new Date(appointment.date) >= new Date() ? (
  <IonCard
    className="mother-card soft-pink"
    button
    onClick={() => history.push("/motherscalendar")}
  >
    <IonCardContent>
      <IonIcon icon={calendarOutline} className="card-icon" />
      <h3>Appointments</h3>
      <p>
        {new Date(appointment.date).toLocaleDateString()} •{" "}
        {formatTime(appointment.time)}
      </p>
      <span className="status active-status">{appointment.status}</span>
    </IonCardContent>
  </IonCard>
) : (
  <IonCard
    className="mother-card soft-pink"
    button
    onClick={() => history.push("/motherscalendar")}
  >
    <IonCardContent>
      <IonIcon icon={calendarOutline} className="card-icon" />
      <h3>Appointments</h3>
      <p>No available appointments</p>
    </IonCardContent>
  </IonCard>
)}
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

        {/* 🩹 Immunization Modal */}
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

  {/* 🌿 Wellness Modal */}
<IonModal
  isOpen={showWellnessModal}
  onDidDismiss={() => setShowWellnessModal(false)}
  className="small-modal no-overlay"
>
  <div className="immunization-modal small">
    <h2>
      <IonIcon icon={leafOutline} /> Wellness Log
    </h2>
    <p className="wellness-desc">
      Track your daily rest, meals, mood, and activity to support a healthy pregnancy
    </p>

    <IonItem>
      <IonLabel position="stacked">Sleep Hours</IonLabel>
      <IonInput
        value={sleepHours}
        placeholder="e.g. 7 hours"
        onIonChange={(e) => setSleepHours(e.detail.value!)}
      />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Meals & Hydration</IonLabel>
      <IonInput
        value={meals}
        placeholder="e.g. 3 meals, 8 glasses of water"
        onIonChange={(e) => setMeals(e.detail.value!)}
      />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Light Exercise</IonLabel>
      <IonInput
        value={exercise}
        placeholder="e.g. 20 min walk"
        onIonChange={(e) => setExercise(e.detail.value!)}
      />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Mood</IonLabel>
      <IonSelect
        value={mood}
        placeholder="Select mood"
        onIonChange={(e) => setMood(e.detail.value!)}
      >
        <IonSelectOption value="Happy">Happy</IonSelectOption>
        <IonSelectOption value="Tired">Tired</IonSelectOption>
        <IonSelectOption value="Anxious">Anxious</IonSelectOption>
        <IonSelectOption value="Relaxed">Relaxed</IonSelectOption>
      </IonSelect>
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Vitamins Taken</IonLabel>
      <IonInput
        value={vitamins}
        placeholder="e.g. Prenatal Vitamin, Iron"
        onIonChange={(e) => setVitamins(e.detail.value!)}
      />
    </IonItem>

    <IonButton
      expand="block"
      color="success"
      style={{ marginTop: "1rem" }}
      onClick={async () => {
        try {
          const userId = localStorage.getItem("userId");
          if (!userId) {
            alert("User not logged in");
            return;
          }

          // Get mother_id
          const { data: mother } = await supabase
            .from("mothers")
            .select("mother_id")
            .eq("user_id", userId)
            .maybeSingle();

          if (!mother) {
            alert("Mother profile not found.");
            return;
          }

          // Insert new log
          const { error } = await supabase.from("wellness_logs").insert({
            mother_id: mother.mother_id,
            sleep_hours: sleepHours,
            meals,
            exercise,
            mood,
            vitamins,
          });

          if (error) throw error;

          alert("🌿 Wellness log saved successfully!");
          // Clear form
          setSleepHours("");
          setMeals("");
          setExercise("");
          setMood("");
          setVitamins("");
          setShowWellnessModal(false);
        } catch (err) {
          console.error(err);
          alert("Error saving wellness log.");
        }
      }}
    >
      Save Log
    </IonButton>

    <IonButton
      expand="block"
      color="medium"
      onClick={() => setShowWellnessModal(false)}
    >
      Close
    </IonButton>
  </div>
</IonModal>
      </IonContent>
    </MotherMainLayout>
  );
};

export default DashboardMother;
