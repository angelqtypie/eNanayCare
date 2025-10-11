import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToast,
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
} from "@ionic/react";
import {
  chatbubbleOutline,
  close,
  send,
  homeOutline,
  calendarOutline,
  personOutline,
  logOutOutline,
  heartOutline,
  medkitOutline,
  clipboardOutline,
  schoolOutline,
  listOutline,
  pinOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
import "./DashboardMother.css";

interface Appointment {
  id: string;
  date: string;
  time?: string;
  location?: string;
  status?: string;
  purpose?: string;
  notes?: string;
}

interface HealthRecord {
  id: string;
  blood_pressure?: string;
  weight?: number;
}

interface Immunization {
  id: string;
  vaccine_name?: string;
  date?: string;
}

interface BhwNote {
  id: string;
  bhw_name?: string;
  note?: string;
}

const DashboardMother: React.FC = () => {
  const history = useHistory();
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [notes, setNotes] = useState<BhwNote[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Nanay";

  useEffect(() => {
    if (userId) fetchMotherProfile();
  }, [userId]);

  const fetchMotherProfile = async () => {
    const { data: mother, error } = await supabase
      .from("mothers")
      .select("id")
      .eq("auth_user_id", userId)
      .single();

    if (error) console.error("Error fetching mother:", error);
    if (mother) fetchAllData(mother.id);
  };

  const fetchAllData = async (motherId: string) => {
    const { data: appts } = await supabase
      .from("appointments")
      .select("*")
      .eq("mother_id", motherId)
      .order("date", { ascending: true });

    const today = new Date();
    const upcoming = (appts || []).find(
      (a: Appointment) => new Date(a.date) >= today && a.status === "Scheduled"
    );
    setNextAppointment(upcoming || null);

    const { data: recs } = await supabase
      .from("health_records")
      .select("*")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });

    const { data: imms } = await supabase
      .from("immunizations")
      .select("*")
      .eq("mother_id", motherId)
      .order("date_administered", { ascending: false });

    const { data: bhw } = await supabase
      .from("health_worker_notes")
      .select("*")
      .eq("mother_id", motherId)
      .order("created_at", { ascending: false });

    setHealthRecords(recs || []);
    setImmunizations(imms || []);
    setNotes(bhw || []);
  };

  const handleLogout = () => {
    localStorage.clear();
    history.push("/landingpage");
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const text = input.trim();
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");

    setTimeout(() => {
      let reply = "Try asking about nutrition, danger signs, or exercise.";
      const q = text.toLowerCase();

      if (q.includes("nutrition"))
        reply = "Eat iron-rich foods like malunggay, fish, and green vegetables.";
      else if (q.includes("exercise"))
        reply = "Prenatal yoga or light walking is safe if approved by your doctor.";
      else if (q.includes("hello"))
        reply = `Hello ${fullName}! I'm MAMABOT here to assist you.`;
      else if (q.includes("danger"))
        reply = "Seek help immediately if you have bleeding, headache, or blurry vision.";

      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 600);
  };

  const goTo = (path: string) => history.push(path);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="header-toolbar">
          <IonButton fill="clear">
            <IonIcon icon={listOutline} />
          </IonButton>
          <IonTitle className="ion-text-center">eNanayCare</IonTitle>
          <IonButton fill="clear" slot="end" color="danger" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} /> Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        <div className="welcome-section">
          <h1>
            Welcome, <span>{fullName}</span>
          </h1>
          <p>Track your appointments, immunizations, and pregnancy health records.</p>
        </div>

        <IonGrid className="cards-grid">
          <IonRow>
            {/* Appointments */}
            <IonCol size="6">
              <IonCard className="glass-card pink" button onClick={() => goTo("/motherscalendar")}>
                <IonCardContent>
                  <IonIcon icon={calendarOutline} className="card-icon" />
                  <h2>Appointment</h2>
                  {nextAppointment ? (
                    <div className="appt-minimal">
                      <p className="appt-date">
                        {new Date(nextAppointment.date).toLocaleDateString()}{" "}
                        {nextAppointment.time && `• ${nextAppointment.time.replace(":00", "")} am`}
                      </p>
                      <p className="appt-location">
                        <IonIcon icon={pinOutline} /> {nextAppointment.location || "Health Center"}
                      </p>
                      <p className="appt-status">
                        <b>Status:</b>{" "}
                        <span
                          style={{
                            color: nextAppointment.status === "Scheduled" ? "green" : "gray",
                            fontWeight: 500,
                          }}
                        >
                          {nextAppointment.status}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="muted">No upcoming appointments.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Health Records */}
            <IonCol size="6">
              <IonCard className="glass-card purple">
                <IonCardContent>
                  <IonIcon icon={heartOutline} className="card-icon" />
                  <h2>Health Records</h2>
                  {healthRecords.length ? (
                    healthRecords.slice(0, 2).map((r) => (
                      <p key={r.id}>
                        BP: {r.blood_pressure || "-"} | Wt: {r.weight ? `${r.weight}kg` : "-"}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No health records yet.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* Immunizations */}
            <IonCol size="6">
              <IonCard className="glass-card teal">
                <IonCardContent>
                  <IonIcon icon={medkitOutline} className="card-icon" />
                  <h2>Immunizations</h2>
                  {immunizations.length ? (
                    immunizations.slice(0, 2).map((im) => (
                      <p key={im.id}>
                        {im.vaccine_name} — {new Date(im.date || "").toLocaleDateString()}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No immunizations recorded.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* BHW Notes */}
            <IonCol size="6">
              <IonCard className="glass-card orange">
                <IonCardContent>
                  <IonIcon icon={clipboardOutline} className="card-icon" />
                  <h2>BHW Notes</h2>
                  {notes.length ? (
                    notes.slice(0, 2).map((n) => (
                      <p key={n.id}>
                        <b>{n.bhw_name}</b>: {n.note}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No notes yet.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Educational Materials */}
        <div className="education-section">
          <h2>
            <IonIcon icon={schoolOutline} /> Educational Materials
          </h2>
          <IonList>
            <IonItem>
              <IonLabel>
                <h3>Healthy Pregnancy Nutrition</h3>
                <p>Eat balanced meals and stay hydrated every day.</p>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>
                <h3>Exercise During Pregnancy</h3>
                <p>Try light stretching or walking daily if approved by your doctor.</p>
              </IonLabel>
            </IonItem>
          </IonList>
        </div>

        {/* Floating Chatbot */}
        {showChat && (
          <div className="chat-box small">
            <div className="chat-header">
              <b>MAMABOT</b>
              <IonIcon icon={close} onClick={() => setShowChat(false)} className="close-icon" />
            </div>
            <div className="chat-body">
              {messages.length === 0 ? (
                <div className="msg bot">
                  Hi <b>{fullName}</b>! 👋 I'm MAMABOT, your pregnancy assistant 🤰
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.text}
                  </div>
                ))
              )}
            </div>
            <div className="chat-floating-input">
              <IonInput
                placeholder="Ask something..."
                value={input}
                onIonChange={(e) => setInput(e.detail.value!)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />
              <IonButton fill="clear" color="primary" onClick={handleSend}>
                <IonIcon icon={send} />
              </IonButton>
            </div>
          </div>
        )}

        {!showChat && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton color="primary" onClick={() => setShowChat(true)}>
              <IonIcon icon={chatbubbleOutline} />
            </IonFabButton>
          </IonFab>
        )}

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg ?? ""}
          duration={2500}
          color="success"
          onDidDismiss={() => setToastMsg(null)}
        />
      </IonContent>

      <IonFooter className="ion-no-border dashboard-footer">
        <IonToolbar>
          <IonSegment value="dashboard" className="footer-segment">
            <IonSegmentButton value="dashboard" onClick={() => goTo("/dashboardmother")}>
              <IonIcon icon={homeOutline} />
              <IonLabel>Dashboard</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="calendar" onClick={() => goTo("/motherscalendar")}>
              <IonIcon icon={calendarOutline} />
              <IonLabel>Calendar</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="profile">
              <IonIcon icon={personOutline} />
              <IonLabel>Profile</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default DashboardMother;
