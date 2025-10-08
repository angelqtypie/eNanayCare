import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
} from "@ionic/react";
import {
  chatbubbleOutline,
  send,
  close,
  logOutOutline,
  calendarOutline,
  heartOutline,
  medkitOutline,
  clipboardOutline,
  schoolOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

const DashboardMother: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const userId = localStorage.getItem("userId");
  const fullName = localStorage.getItem("fullName") || "Nanay";

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchAllData();
  }, [userId]);

  const fetchAllData = async () => {
    try {
      const [appt, records, immu, bhwNotes, edu] = await Promise.all([
        supabase.from("appointments").select("*").eq("mother_id", userId),
        supabase.from("health_records").select("*").eq("mother_id", userId),
        supabase.from("immunizations").select("*").eq("mother_id", userId),
        supabase.from("health_worker_notes").select("*").eq("mother_id", userId),
        supabase.from("educational_materials").select("*"),
      ]);

      setAppointments(appt.data || []);
      setHealthRecords(records.data || []);
      setImmunizations(immu.data || []);
      setNotes(bhwNotes.data || []);
      setMaterials(edu.data || []);
    } catch (error) {
      setError("Failed to fetch data");
    }
  };

  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    history.push("/landingpage");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user" as const, text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const botReply = getMAMABOTReply(input);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      scrollChatToBottom();
    }, 700);
  };

  const scrollChatToBottom = () => {
    setTimeout(() => {
      const chatBody = document.getElementById("chatBody");
      if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
    }, 100);
  };

  const getMAMABOTReply = (msg: string): string => {
    msg = msg.toLowerCase();
    if (msg.includes("nutrition") || msg.includes("eat"))
      return "Eat iron-rich foods like malunggay, fish, and green vegetables. Avoid caffeine and alcohol.";
    if (msg.includes("exercise"))
      return "Prenatal yoga, walking, and light stretching are safe for most mothers.";
    if (msg.includes("danger") || msg.includes("sign"))
      return "Seek help if you have severe headaches, bleeding, blurred vision, or swelling.";
    if (msg.includes("hello") || msg.includes("hi"))
      return "Hello Nanay! I'm MAMABOT, your pregnancy care assistant. How can I help today?";
    return "You can ask me about nutrition, vaccines, exercise, or pregnancy warning signs.";
  };

  return (
    <IonPage>
      <IonHeader translucent>
        <IonToolbar className="header-toolbar">
          <IonTitle>Mother Dashboard</IonTitle>
          <IonButton fill="clear" slot="end" color="danger" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} /> Logout
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        {error && <IonText color="danger">{error}</IonText>}

        <div className="welcome-section">
          <h1>
            Welcome, <span>{fullName}</span>
          </h1>
          <p>Track your appointments, immunizations, and pregnancy health records.</p>
        </div>

        <IonGrid className="cards-grid">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard className="glass-card pink">
                <IonCardContent>
                  <IonIcon icon={calendarOutline} className="card-icon" />
                  <h2>Appointments</h2>
                  {appointments.length ? (
                    appointments.map((a, i) => (
                      <p key={i}>{new Date(a.appointment_date).toLocaleDateString()} — {a.purpose}</p>
                    ))
                  ) : (
                    <p className="muted">No upcoming appointments.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard className="glass-card purple">
                <IonCardContent>
                  <IonIcon icon={heartOutline} className="card-icon" />
                  <h2>Health Records</h2>
                  {healthRecords.length ? (
                    healthRecords.map((r, i) => (
                      <p key={i}>
                        BP: {r.blood_pressure || "-"} — Weight: {r.weight}kg
                      </p>
                    ))
                  ) : (
                    <p className="muted">No health records yet.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard className="glass-card teal">
                <IonCardContent>
                  <IonIcon icon={medkitOutline} className="card-icon" />
                  <h2>Immunizations</h2>
                  {immunizations.length ? (
                    immunizations.map((im, i) => (
                      <p key={i}>
                        {im.vaccine_name} — {new Date(im.date).toLocaleDateString()}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No immunizations recorded.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="6">
              <IonCard className="glass-card orange">
                <IonCardContent>
                  <IonIcon icon={clipboardOutline} className="card-icon" />
                  <h2>BHW Notes</h2>
                  {notes.length ? (
                    notes.map((n, i) => (
                      <p key={i}>
                        <b>{n.bhw_name}:</b> {n.note}
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

        <div className="education-section">
          <h2>
            <IonIcon icon={schoolOutline} /> Educational Materials
          </h2>
          <IonList>
            {materials.length ? (
              materials.map((m, i) => (
                <IonItem key={i}>
                  <IonLabel>
                    <h3>{m.title}</h3>
                    <p>{m.content}</p>
                  </IonLabel>
                </IonItem>
              ))
            ) : (
              <IonItem>
                <IonLabel>No educational materials available.</IonLabel>
              </IonItem>
            )}
          </IonList>
        </div>

        {/* Chatbot Floating */}
        <div className="mamabot">
          {showChat ? (
            <div className="chat-box">
              <div className="chat-header">
                <b>MAMABOT</b>
                <IonIcon
                  icon={close}
                  className="close-icon"
                  onClick={() => setShowChat(false)}
                />
              </div>

              <div className="chat-body" id="chatBody">
                {messages.length === 0 && (
                  <div className="msg bot">
                    Hello <b>Nanay!</b> I'm <b>MAMABOT</b> — your pregnancy assistant.
                    You can ask about nutrition, exercise, or warning signs.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <IonInput
                  placeholder="Ask something..."
                  value={input}
                  onIonChange={(e) => setInput(e.detail.value!)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                />
                <IonButton fill="clear" onClick={handleSend}>
                  <IonIcon icon={send} />
                </IonButton>
              </div>
            </div>
          ) : (
            <button className="chat-fab" onClick={() => setShowChat(true)}>
              <IonIcon icon={chatbubbleOutline} />
            </button>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default DashboardMother;
