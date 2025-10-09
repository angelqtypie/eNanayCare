// src/pages/DashboardMother.tsx
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
  listOutline,
  callOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import "./DashboardMother.css";

/**
 * Trusted static educational materials (safe, WHO/DOH-style).
 * Keep editable by developer/BHW.
 */
const STATIC_MATERIALS = [
  {
    id: "static-1",
    title: "Pregnancy Do’s and Don’ts",
    content: `
      <b>DO:</b><br/>
      • Eat iron-rich foods (malunggay, fish, greens).<br/>
      • Take iron & folic acid supplements as prescribed.<br/>
      • Drink 8–10 glasses of water daily.<br/>
      • Attend prenatal visits at your health center.<br/><br/>
      <b>DON'T:</b><br/>
      • Do not smoke or use alcohol.<br/>
      • Avoid self-medication without a doctor.<br/>
      • Avoid heavy lifting and toxic fumes.
    `,
  },
  {
    id: "static-2",
    title: "Warning Signs — Seek Help Immediately",
    content: `
      • Severe headache, blurred vision, or dizziness.<br/>
      • Heavy vaginal bleeding or fluid leakage.<br/>
      • Severe abdominal pain or decreased fetal movement.<br/>
      • High fever or convulsions.
    `,
  },
  {
    id: "static-3",
    title: "Nutrition Tips",
    content: `
      • Eat a balanced diet: grains, protein (eggs, fish, legumes), fruits, vegetables, dairy.<br/>
      • Avoid raw/undercooked foods and unpasteurized milk.<br/>
      • Small frequent meals if you have nausea.
    `,
  },
  {
    id: "static-4",
    title: "Exercise & Wellness",
    content: `
      • Light exercises (walking, stretching, prenatal yoga) are good if your provider approves.<br/>
      • Rest, sleep well, and maintain mental wellbeing — talk to family or BHW if stressed.
    `,
  },
  {
    id: "static-5",
    title: "Important Immunizations",
    content: `
      • Tetanus Toxoid (TT) — protect mum & baby from tetanus.<br/>
      • Influenza vaccine — recommended during pregnancy.<br/>
      • COVID-19 vaccine — recommended by DOH/WHO for pregnant women.
    `,
  },
];

const DashboardMother: React.FC = () => {
  // local states
  const [appointments, setAppointments] = useState<any[]>([]);
  const [healthRecords, setHealthRecords] = useState<any[]>([]);
  const [immunizations, setImmunizations] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]); // merged: db first, static next
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const history = useHistory();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Profile edit modal
  const [profile, setProfile] = useState<any>({});
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // user identity from localStorage (login should set these)
  const userId = localStorage.getItem("userId");
  const fullName = (localStorage.getItem("fullName") || "Nanay").trim() || "Nanay";

  // on mount: always load static materials; then try DB fetch if logged in
  useEffect(() => {
    // always show static materials so mothers can read even if DB empty
    setMaterials(STATIC_MATERIALS);

    if (!userId) {
      setError("User not logged in");
      // still allow reading static content
      return;
    }

    // if logged in, fetch personal and DB materials
    fetchAllData();
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // fetch supabase data and merge educational materials
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

      // merge DB-ed materials in front (DB first so admin uploads show first)
      const dbMaterials = edu.data || [];
      if (dbMaterials.length) {
        // normalize to {id, title, content, url}
        const normalized = dbMaterials.map((m: any, idx: number) => ({
          id: m.id ?? `db-${idx}`,
          title: m.title ?? m.name ?? "Untitled",
          content: m.content ?? m.description ?? m.summary ?? "",
          url: m.file_url ?? m.url ?? null,
        }));
        setMaterials((prev) => [...normalized, ...prev]);
      }
    } catch (err) {
      console.error("fetchAllData error:", err);
      setError("Failed to fetch data");
    }
  };

  // profile fetch/save
  const fetchProfile = async () => {
    try {
      const { data, error: pErr } = await supabase.from("mothers").select("*").eq("id", userId).single();
      if (pErr && pErr.code !== "PGRST116") {
        // ignore 'no rows' gracefully, other errors show
        console.warn("fetchProfile warning:", pErr.message || pErr);
      }
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
      // attempt update; if no row exists, upsert
      const updates = {
        id: userId,
        full_name: profile.full_name ?? fullName,
        address: profile.address ?? null,
        contact_number: profile.contact_number ?? null,
        expected_delivery: profile.expected_delivery ?? null,
      };
      const { error: upErr } = await supabase.from("mothers").upsert(updates, { returning: "minimal" });
      if (upErr) {
        console.error("saveProfile error:", upErr);
        setToastMsg("Failed to save profile.");
        return;
      }
      setShowProfileModal(false);
      setToastMsg("Profile saved.");
      // update localStorage fullName if changed
      if (updates.full_name) localStorage.setItem("fullName", updates.full_name);
    } catch (err) {
      console.error("saveProfile exception:", err);
      setToastMsg("Failed to save profile.");
    }
  };

  // Navigation helpers
  const goTo = (path: string) => {
    setSidebarOpen(false);
    history.push(path);
  };

  const handleLogout = () => {
    // clear local session keys locally (actual auth sign-out should be handled separately)
    localStorage.removeItem("userId");
    localStorage.removeItem("fullName");
    history.push("/landingpage");
  };

  // Simple rule-based MAMABOT replies
  const getMAMABOTReply = (msg: string): string => {
    const text = msg.toLowerCase();
    if (text.includes("nutrition") || text.includes("eat")) return "Eat iron-rich foods like malunggay, fish, and green vegetables. Avoid alcohol and raw foods.";
    if (text.includes("exercise")) return "Light walking or prenatal yoga is helpful if your doctor approves.";
    if (text.includes("bleed") || text.includes("danger") || text.includes("sign")) return "If you have heavy bleeding, severe headache, or decreased baby movement — go to the health center immediately.";
    if (text.includes("hello") || text.includes("hi")) return `Hello ${fullName || "Nanay"}! I'm MAMABOT — how can I help?`;
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
      // scroll chat
      setTimeout(() => {
        const chatBody = document.getElementById("chatBody");
        if (chatBody) chatBody.scrollTop = chatBody.scrollHeight;
      }, 50);
    }, 600);
  };

  // render helpers
  const openMaterial = (m: any) => {
    if (m.url) {
      window.open(m.url, "_blank", "noopener");
    }
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
        {error && <IonText color="danger" className="ion-padding">{error}</IonText>}

        <div className="welcome-section">
          <h1>
            Welcome, <span>{fullName}</span>
          </h1>
          <p>Track your appointments, immunizations, and pregnancy health records.</p>
        </div>

        {/* CARDS */}
        <IonGrid className="cards-grid">
          <IonRow>
            <IonCol size="12" sizeMd="6">
              <IonCard className="glass-card pink">
                <IonCardContent>
                  <IonIcon icon={calendarOutline} className="card-icon" />
                  <h2>Appointments</h2>
                  {appointments.length ? (
                    appointments.map((a, i) => (
                      <p key={i}>
                        {a.appointment_date ? new Date(a.appointment_date).toLocaleDateString() : "Date not set"} — {a.purpose}
                      </p>
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
                        BP: {r.blood_pressure || "-"} — Weight: {r.weight ? `${r.weight}kg` : "-"}
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
                        {im.vaccine_name || "-"} — {im.date ? new Date(im.date).toLocaleDateString() : "-"}
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

        {/* EDUCATIONAL MATERIALS */}
        <div className="education-section">
          <h2>
            <IonIcon icon={schoolOutline} /> Educational Materials
          </h2>
          <IonList>
            {materials.length ? (
              materials.map((m, i) => (
                <IonItem
                  key={m.id ?? i}
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

        {/* Floating menu buttons (responsive) */}
        <div className="floating-menu">
          <IonButton expand="full" onClick={() => setShowProfileModal(true)} style={{ marginBottom: 8 }}>
            <IonIcon slot="start" icon={createOutline} /> Edit Profile
          </IonButton>
          <IonButton expand="full" color="secondary" onClick={() => goTo("/materials")} style={{ marginBottom: 8 }}>
            <IonIcon slot="start" icon={listOutline} /> More Materials
          </IonButton>
          <IonButton expand="full" color="tertiary" onClick={() => goTo("/contactbhw")}>
            <IonIcon slot="start" icon={callOutline} /> Contact BHW
          </IonButton>
        </div>

        {/* MAMABOT (chat) */}
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
                    Hello <b>{fullName}</b>! I'm <b>MAMABOT</b> — your pregnancy assistant. Ask me about nutrition, exercise, or warning signs.
                  </div>
                )}
                {messages.map((m, i) => (
                  <div key={i} className={`msg ${m.sender}`}>
                    {m.text}
                  </div>
                ))}
              </div>

              <div className="chat-input">
                <IonInput placeholder="Ask something..." value={input} onIonChange={(e) => setInput(e.detail.value!)} onKeyDown={(e) => e.key === "Enter" && handleSend()} />
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
              <IonInput value={profile.full_name ?? fullName} onIonChange={(e) => setProfile({ ...profile, full_name: e.detail.value })} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Address</IonLabel>
              <IonInput value={profile.address ?? ""} onIonChange={(e) => setProfile({ ...profile, address: e.detail.value })} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Contact Number</IonLabel>
              <IonInput value={profile.contact_number ?? ""} onIonChange={(e) => setProfile({ ...profile, contact_number: e.detail.value })} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Expected Delivery Date</IonLabel>
              <IonInput type="date" value={profile.expected_delivery ?? ""} onIonChange={(e) => setProfile({ ...profile, expected_delivery: e.detail.value })} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes (optional)</IonLabel>
              <IonTextarea value={profile.notes ?? ""} onIonChange={(e) => setProfile({ ...profile, notes: e.detail.value })} />
            </IonItem>

            <IonButton expand="block" color="success" onClick={saveProfile} style={{ marginTop: 16 }}>
              Save Profile
            </IonButton>
          </IonContent>
          <IonFooter>
            <div style={{ padding: 10, textAlign: "center", color: "#666" }}>Changes are saved to your health record.</div>
          </IonFooter>
        </IonModal>

        <IonToast isOpen={!!toastMsg} message={toastMsg ?? ""} duration={2000} onDidDismiss={() => setToastMsg(null)} />
      </IonContent>
    </IonPage>
  );
};

export default DashboardMother;
