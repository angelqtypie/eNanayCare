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
  IonModal,
  IonFooter,
  IonSegment,
  IonSegmentButton,
  IonItemDivider,
  IonTextarea,
  IonToast,
  IonFab,
  IonFabButton,
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
  createOutline,
  personOutline,
  homeOutline,
  listOutline,
  callOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

// ---------- ✅ Types ----------
interface EducationalMaterial {
  id: string | number;
  title: string;
  content: string;
  url?: string | null;
}

interface Appointment {
  id: string | number;
  appointment_date?: string;
  purpose?: string;
}

interface HealthRecord {
  id: string | number;
  blood_pressure?: string;
  weight?: number;
}

interface Immunization {
  id: string | number;
  vaccine_name?: string;
  date?: string;
}

interface BhwNote {
  id: string | number;
  bhw_name?: string;
  note?: string;
}

interface MotherProfile {
  id?: string;
  full_name?: string;
  address?: string;
  contact_number?: string;
  expected_delivery?: string;
  notes?: string;
}

// ---------- ✅ Static Educational Materials ----------
const STATIC_MATERIALS: EducationalMaterial[] = [
  {
    id: 1,
    title: "Healthy Pregnancy Nutrition",
    content:
      "Eat a balanced diet rich in fruits, vegetables, and protein. Drink plenty of water and take your prenatal vitamins daily.",
    url: "https://www.who.int/news-room/fact-sheets/detail/healthy-diet",
  },
  {
    id: 2,
    title: "Exercise During Pregnancy",
    content:
      "Light exercises such as walking and stretching can help you stay healthy and ease delivery, unless advised otherwise by your doctor.",
    url: "https://www.cdc.gov/physical-activity-basics/guidelines/adults/pregnant-or-postpartum.html",
  },
  {
    id: 3,
    title: "Immunization Schedule for Mothers",
    content:
      "Make sure to receive your tetanus toxoid (TT) vaccines as recommended by your health provider to protect you and your baby.",
    url: "https://www.who.int/immunization/diseases/maternal/en/",
  },
];

const DashboardMother: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [immunizations, setImmunizations] = useState<Immunization[]>([]);
  const [notes, setNotes] = useState<BhwNote[]>([]);
  const [materials, setMaterials] = useState<EducationalMaterial[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<MotherProfile>({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const history = useHistory();

  const userId = localStorage.getItem("userId");
  const fullName = (localStorage.getItem("fullName") || "Nanay").trim() || "Nanay";

  useEffect(() => {
    setMaterials(STATIC_MATERIALS);
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchAllData();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      setAppointments((appt.data as Appointment[]) || []);
      setHealthRecords((records.data as HealthRecord[]) || []);
      setImmunizations((immu.data as Immunization[]) || []);
      setNotes((bhwNotes.data as BhwNote[]) || []);

      const dbMaterials = (edu.data as EducationalMaterial[]) || [];
      if (dbMaterials.length) {
        const normalized = dbMaterials.map((m, idx) => ({
          id: m.id ?? `db-${idx}`,
          title: m.title ?? "Untitled",
          content: m.content ?? "",
          url: m.url ?? null,
        }));
        setMaterials((prev) => [...normalized, ...prev]);
      }
    } catch (err) {
      console.error("fetchAllData error:", err);
      setError("Failed to fetch data");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data } = await supabase
        .from("mothers")
        .select("*")
        .eq("id", userId)
        .single();

      if (data) setProfile(data);
    } catch (err) {
      console.error("fetchProfile error:", err);
    }
  };

  const saveProfile = async () => {
    try {
      if (!userId) {
        setToastMsg("You must be logged in to save profile.");
        return;
      }

      const updates = {
        id: userId,
        full_name: profile.full_name ?? fullName,
        address: profile.address ?? null,
        contact_number: profile.contact_number ?? null,
        expected_delivery: profile.expected_delivery ?? null,
        notes: profile.notes ?? null,
      };

      const { error: upErr } = await supabase.from("mothers").upsert(updates);

      if (upErr) {
        console.error("saveProfile error:", upErr);
        setToastMsg("Failed to save profile.");
        return;
      }

      setShowProfileModal(false);
      setToastMsg("Profile saved.");
      if (updates.full_name) localStorage.setItem("fullName", updates.full_name);
    } catch (err) {
      console.error("saveProfile exception:", err);
      setToastMsg("Failed to save profile.");
    }
  };

  const goTo = (path: string) => history.push(path);

  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    history.push("/landingpage");
  };

  const getMAMABOTReply = (msg: string): string => {
    const text = msg.toLowerCase();
    if (text.includes("nutrition") || text.includes("eat"))
      return "Eat iron-rich foods like malunggay, fish, and green vegetables. Avoid alcohol and raw foods.";
    if (text.includes("exercise"))
      return "Light walking or prenatal yoga is helpful if your doctor approves.";
    if (text.includes("bleed") || text.includes("danger") || text.includes("sign"))
      return "If you have heavy bleeding, severe headache, or decreased baby movement — go to the health center immediately.";
    if (text.includes("hello") || text.includes("hi"))
      return `Hello ${fullName}! I'm MAMABOT — how can I help?`;
    return "Try asking about nutrition, warning signs, vaccines, or exercise.";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    const question = input;
    setInput("");
    setTimeout(() => {
      const botReply = getMAMABOTReply(question);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply }]);
      setTimeout(() => {
        const chatBody = document.getElementById("chatBody");
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);
    }, 600);
  };

  const openMaterial = (m: EducationalMaterial) => {
    if (m.url) window.open(m.url, "_blank", "noopener");
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar className="header-toolbar">
          <IonButton fill="clear">
            <IonIcon icon={listOutline} />
          </IonButton>
          <IonTitle className="ion-text-center">eNanayCare</IonTitle>
          <IonButton fill="clear" slot="end" onClick={handleLogout}>
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
            <IonCol size="6" sizeMd="6">
              <IonCard className="glass-card pink">
                <IonCardContent>
                  <IonIcon icon={calendarOutline} className="card-icon" />
                  <h2>Appointments</h2>
                  {appointments.length ? (
                    appointments.slice(0, 3).map((a) => (
                      <p key={a.id}>
                        {a.appointment_date
                          ? new Date(a.appointment_date).toLocaleDateString()
                          : "Date not set"}{" "}
                        — {a.purpose}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No upcoming appointments.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="6">
              <IonCard className="glass-card purple">
                <IonCardContent>
                  <IonIcon icon={heartOutline} className="card-icon" />
                  <h2>Health Records</h2>
                  {healthRecords.length ? (
                    healthRecords.slice(0, 3).map((r) => (
                      <p key={r.id}>
                        BP: {r.blood_pressure || "-"} — Weight: {r.weight ? `${r.weight}kg` : "-"}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No health records yet.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="6">
              <IonCard className="glass-card teal">
                <IonCardContent>
                  <IonIcon icon={medkitOutline} className="card-icon" />
                  <h2>Immunizations</h2>
                  {immunizations.length ? (
                    immunizations.slice(0, 3).map((im) => (
                      <p key={im.id}>
                        {im.vaccine_name || "-"} —{" "}
                        {im.date ? new Date(im.date).toLocaleDateString() : "-"}
                      </p>
                    ))
                  ) : (
                    <p className="muted">No immunizations recorded.</p>
                  )}
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6" sizeMd="6">
              <IonCard className="glass-card orange">
                <IonCardContent>
                  <IonIcon icon={clipboardOutline} className="card-icon" />
                  <h2>BHW Notes</h2>
                  {notes.length ? (
                    notes.slice(0, 3).map((n) => (
                      <p key={n.id}>
                        <b>{n.bhw_name || "BHW"}:</b> {n.note}
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
              materials.map((m) => (
                <IonItem
                  key={m.id}
                  button={!!m.url}
                  detail={!!m.url}
                  onClick={() => (m.url ? openMaterial(m) : null)}
                >
                  <IonLabel>
                    <h3>{m.title}</h3>
                    <p dangerouslySetInnerHTML={{ __html: m.content }} />
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

        {/* Chatbot */}
        <div className="mamabot">
          {showChat ? (
            <div className="chat-box">
              <div className="chat-header">
                <b>MAMABOT</b>
                <IonIcon icon={close} className="close-icon" onClick={() => setShowChat(false)} />
              </div>
              <div className="chat-body" id="chatBody">
                {messages.length === 0 && (
                  <div className="msg bot">
                    Hello <b>{fullName}</b>! I'm <b>MAMABOT</b> — your pregnancy assistant.
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
                  onKeyDown={(e: any) => e.key === "Enter" && handleSend()}
                />
                <IonButton fill="clear" onClick={handleSend}>
                  <IonIcon icon={send} />
                </IonButton>
              </div>
            </div>
          ) : (
            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton color="primary" onClick={() => setShowChat(true)}>
                <IonIcon icon={chatbubbleOutline} />
              </IonFabButton>
            </IonFab>
          )}
        </div>

        {/* Profile Modal */}
        <IonModal isOpen={showProfileModal} onDidDismiss={() => setShowProfileModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Profile</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowProfileModal(false)}>
                <IonIcon icon={close} />
              </IonButton>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            <IonItemDivider>Personal Info</IonItemDivider>
            <IonItem>
              <IonLabel position="stacked">Full Name</IonLabel>
              <IonInput
                value={profile.full_name ?? fullName}
                onIonChange={(e) =>
                  setProfile({ ...profile, full_name: e.detail.value ?? "" })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Address</IonLabel>
              <IonInput
                value={profile.address ?? ""}
                onIonChange={(e) => setProfile({ ...profile, address: e.detail.value ?? "" })}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contact Number</IonLabel>
              <IonInput
                value={profile.contact_number ?? ""}
                onIonChange={(e) =>
                  setProfile({ ...profile, contact_number: e.detail.value ?? "" })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Expected Delivery Date</IonLabel>
              <IonInput
                type="date"
                value={profile.expected_delivery ?? ""}
                onIonChange={(e) =>
                  setProfile({ ...profile, expected_delivery: e.detail.value ?? "" })
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes (optional)</IonLabel>
              <IonTextarea
                value={profile.notes ?? ""}
                onIonChange={(e) => setProfile({ ...profile, notes: e.detail.value ?? "" })}
              />
            </IonItem>

            <IonButton expand="block" color="success" onClick={saveProfile} style={{ marginTop: 16 }}>
              Save Profile
            </IonButton>
          </IonContent>

          <IonFooter>
            <div style={{ padding: 10, textAlign: "center", color: "#666" }}>
              Your information is stored securely.
            </div>
          </IonFooter>
        </IonModal>

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
            <IonSegmentButton value="profile" onClick={() => goTo("/mothersprofile")}>
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
