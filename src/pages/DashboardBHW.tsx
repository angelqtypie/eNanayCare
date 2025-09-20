// File: src/pages/DashboardBHW.tsx
// BHW Admin Dashboard page (Ionic + React + TypeScript)
// Drop this file in src/pages and import the CSS file from same folder.

import React, { useEffect, useMemo, useState } from "react";
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
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonItem,
  IonInput,
  IonToggle,
  IonList,
  IonSpinner,
  IonModal,
  IonButtons,
  IonLabel,
} from "@ionic/react";
import {
  peopleOutline,
  personOutline,
  calendarOutline,
  searchOutline,
  addOutline,
  downloadOutline,
  menuOutline,
} from "ionicons/icons";

import { supabase, fetchMothers, fetchAppointments } from "../utils/supabaseClient";
import "./DashboardBHW.css";
import logo from "../assets/logo.svg";


/* Types for local usage */
type Mother = {
  id?: string;
  full_name: string;
  age?: number;
  contact?: string;
  high_risk?: boolean;
  last_visit?: string;
  notes?: string;
};

type Appointment = {
  id?: string;
  mother_id?: string | null;
  title: string;
  start_time: string; // ISO string
  notes?: string;
};

/* Mock data fallback (developer-friendly) */
const MOCK_MOTHERS: Mother[] = [
  { id: "m1", full_name: "Maria Santos", age: 28, contact: "0917-000-0001", high_risk: false, last_visit: "2025-08-10", notes: "No allergies" },
  { id: "m2", full_name: "Ana Lopez", age: 33, contact: "0917-000-0002", high_risk: true, last_visit: "2025-08-15", notes: "High BP previously" },
  { id: "m3", full_name: "Cecilia Reyes", age: 24, contact: "0917-000-0003", high_risk: false, last_visit: "2025-08-12", notes: "First trimester" },
];

const MOCK_APPTS: Appointment[] = [
  { id: "a1", mother_id: "m1", title: "Check-up (Maria)", start_time: new Date(Date.now() + 3600 * 1000).toISOString(), notes: "Routine" },
  { id: "a2", mother_id: "m2", title: "High-risk review (Ana)", start_time: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(), notes: "BP follow-up" },
];

const DashboardBHW: React.FC = () => {
  const history = useHistory();

  // Data state
  const [mothers, setMothers] = useState<Mother[] | null>(null);
  const [appointments, setAppointments] = useState<Appointment[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [usingMock, setUsingMock] = useState<boolean>(false);

  // UI state
  const [query, setQuery] = useState<string>("");
  const [onlyHighRisk, setOnlyHighRisk] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent");
  const [selectedMother, setSelectedMother] = useState<Mother | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      setLoading(true);
      if (!supabase) {
        // fallback
        if (!mounted) return;
        setUsingMock(true);
        setMothers(MOCK_MOTHERS);
        setAppointments(MOCK_APPTS);
        setLoading(false);
        return;
      }
      try {
        const [m, a] = await Promise.all([fetchMothers(), fetchAppointments()]);
        if (!mounted) return;
        setMothers(Array.isArray(m) ? m : []);
        setAppointments(Array.isArray(a) ? a : []);
        setUsingMock(false);
      } catch (e) {
        // fallback on any error
        setUsingMock(true);
        setMothers(MOCK_MOTHERS);
        setAppointments(MOCK_APPTS);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  // Derived: filtered mothers
  const filteredMothers = useMemo(() => {
    if (!mothers) return [];
    const q = query.trim().toLowerCase();
    let list = mothers.slice();
    if (onlyHighRisk) list = list.filter((m) => !!m.high_risk);
    if (q) list = list.filter((m) => (m.full_name || "").toLowerCase().includes(q) || (m.contact || "").includes(q));
    if (sortBy === "name") list.sort((a, b) => (a.full_name || "").localeCompare(b.full_name || ""));
    else list.sort((a, b) => (b.last_visit || "").localeCompare(a.last_visit || ""));
    return list;
  }, [mothers, query, onlyHighRisk, sortBy]);

  const stats = useMemo(() => {
    const total = mothers?.length || 0;
    const highRisk = mothers ? mothers.filter((m) => m.high_risk).length : 0;
    const upcoming = appointments ? appointments.filter((a) => new Date(a.start_time) > new Date()).length : 0;
    return { total, highRisk, upcoming };
  }, [mothers, appointments]);

  // Actions
  const openMother = (m: Mother) => {
    setSelectedMother(m);
    setModalOpen(true);
  };
  const closeMother = () => {
    setModalOpen(false);
    setTimeout(() => setSelectedMother(null), 200);
  };

  // Dev helper: add mock entry
  const addMock = () => {
    const m: Mother = {
      id: "m" + Math.random().toString(36).slice(2, 8),
      full_name: `New Mother ${Math.floor(Math.random() * 90) + 10}`,
      age: 22 + Math.floor(Math.random() * 12),
      contact: "0917-" + ("" + Math.floor(Math.random() * 9000000 + 1000000)),
      high_risk: Math.random() > 0.85,
      last_visit: new Date().toISOString().slice(0, 10),
      notes: "Added from UI",
    };
    const ap: Appointment = {
      id: "a" + Math.random().toString(36).slice(2, 8),
      mother_id: m.id,
      title: `Check-up (${m.full_name})`,
      start_time: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      notes: "Auto mock",
    };
    setMothers((prev) => (prev ? [m, ...prev] : [m]));
    setAppointments((prev) => (prev ? [ap, ...prev] : [ap]));
  };

  // Export CSV
  const exportCSV = () => {
    const rows = filteredMothers.map((m) => ({
      id: m.id,
      name: m.full_name,
      age: m.age ?? "",
      contact: m.contact ?? "",
      high_risk: m.high_risk ? "Yes" : "No",
      last_visit: m.last_visit ?? "",
      notes: m.notes ?? "",
    }));
    if (rows.length === 0) return;
    const header = Object.keys(rows[0]);
    const csv = [header.join(",")].concat(rows.map((r) => header.map((h) => `"${(r as any)[h] ?? ""}"`).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mothers_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Simple chart helper: counts by day for next 7 days
  const weeklyCounts = useMemo(() => {
    const days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + i);
      return d;
    });
    const counts = days.map((d) => {
      const dayStr = d.toISOString().slice(0, 10);
      return (appointments || []).filter((a) => a.start_time.slice(0, 10) === dayStr).length;
    });
    const max = Math.max(1, ...counts);
    return { days, counts, max };
  }, [appointments]);

  return (
    <IonPage>
      <IonHeader className="dashboard-header">
        <IonToolbar>
          <div className="header-left">
            <button className="sidebar-toggle" aria-label="Toggle sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
              <IonIcon icon={menuOutline} />
            </button>
            <img src= {logo} alt="eNanayCare" className="dashboard-logo" />
            <IonTitle>eNanayCare — BHW Dashboard</IonTitle>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <IonButton fill="clear" onClick={() => history.push("/Capstone/dashboardbhw")}>Home</IonButton>
              <IonButton color="medium" onClick={() => history.push("/Capstone/landingpage")}>Logout</IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`} role="navigation" aria-label="Main sidebar">
          <div className="sidebar-top">
            <h3>Menu</h3>
          </div>
          <nav className="sidebar-nav">
            <button className="side-item" onClick={() => { setSidebarOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Dashboard</button>
            <button className="side-item" onClick={() => { setSidebarOpen(false); document.getElementById("mothers")?.scrollIntoView({ behavior: "smooth" }); }}>Mothers</button>
            <button className="side-item" onClick={() => { setSidebarOpen(false); document.getElementById("appointments")?.scrollIntoView({ behavior: "smooth" }); }}>Appointments</button>
            <button className="side-item" onClick={() => { setSidebarOpen(false); document.getElementById("resources")?.scrollIntoView({ behavior: "smooth" }); }}>Resources</button>
            <button className="side-item" onClick={() => { setSidebarOpen(false); document.getElementById("reminders")?.scrollIntoView({ behavior: "smooth" }); }}>Reminders</button>
          </nav>
        </div>

        <div className="main-grid">

          <IonGrid>
            {/* Stats */}
            <IonRow className="stats-row">
              <IonCol size="12" sizeMd="12" >
                <IonCard className="stat-card">
                  <IonCardHeader><IonCardTitle><IonIcon icon={peopleOutline} /> Total Mothers</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <div className="stat-number">{loading ? <IonSpinner /> : stats.total}</div>
                    <div className="stat-sub">Registered mothers</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="12">
                <IonCard className="stat-card">
                  <IonCardHeader><IonCardTitle><IonIcon icon={personOutline} /> High-risk</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <div className="stat-number">{loading ? <IonSpinner /> : stats.highRisk}</div>
                    <div className="stat-sub">Need attention</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="12">
                <IonCard className="stat-card">
                  <IonCardHeader><IonCardTitle><IonIcon icon={calendarOutline} /> Upcoming</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <div className="stat-number">{loading ? <IonSpinner /> : stats.upcoming}</div>
                    <div className="stat-sub">Scheduled</div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            {/* Controls */}
            <IonRow className="controls-row">
              <IonCol size="12" sizeMd="6">
                <IonItem lines="full" className="search-item" role="search">
                  <IonIcon icon={searchOutline} slot="start" />
                  <IonInput placeholder="Search name or contact" value={query} onIonChange={(e) => setQuery(e.detail.value ?? "")} />
                </IonItem>
              </IonCol>
              <IonCol size="12" sizeMd="6" className="controls-right">
                <div className="control-actions">
                  <label className="control-toggle"><IonLabel>High-risk only</IonLabel><IonToggle checked={onlyHighRisk} onIonChange={(e) => setOnlyHighRisk(e.detail.checked)} /></label>

                  <div className="sort-group">
                    <label htmlFor="sort">Sort</label>
                    <select id="sort" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                      <option value="recent">Recent visit</option>
                      <option value="name">Name</option>
                    </select>
                  </div>

                  <div className="action-buttons">
                    <IonButton onClick={addMock} color="tertiary"><IonIcon icon={addOutline} /> Add mock</IonButton>
                    <IonButton onClick={exportCSV} color="primary"><IonIcon icon={downloadOutline} /> Export</IonButton>
                  </div>
                </div>
              </IonCol>
            </IonRow>

            {/* Main columns: Chart & Appointments / Mothers list */}
            <IonRow className="main-row">
              <IonCol size="12" sizeMd="6">
                <IonCard id="appointments">
                  <IonCardHeader><IonCardTitle>Weekly Appointments</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <div className="chart-grid" aria-hidden="false">
                      {weeklyCounts.days.map((d, i) => {
                        const c = weeklyCounts.counts[i];
                        const h = ((c / weeklyCounts.max) * 120) + 8;
                        return (
                          <div key={i} className="chart-col" title={`${d.toLocaleDateString()} — ${c} appt(s)`}>
                            <div className="bar" style={{ height: `${h}px` }} />
                            <div className="chart-label">{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                          </div>
                        );
                      })}
                    </div>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardHeader><IonCardTitle>Upcoming Appointments</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    {loading ? <div className="center"><IonSpinner /></div> : (appointments && appointments.length > 0) ? (
                      <IonList>
                        {appointments.slice(0, 8).map((ap) => (
                          <IonItem key={ap.id}>
                            <div style={{ flex: 1 }}>
                              <strong>{ap.title}</strong>
                              <div className="small-note">{new Date(ap.start_time).toLocaleString()}</div>
                            </div>
                            <IonButton fill="clear" onClick={() => {
                              const m = mothers?.find((x) => x.id === ap.mother_id);
                              if (m) openMother(m);
                              else alert("Mother record not found");
                            }}>View</IonButton>
                          </IonItem>
                        ))}
                      </IonList>
                    ) : <div className="empty">No upcoming appointments</div>}
                  </IonCardContent>
                </IonCard>
              </IonCol>

              <IonCol size="12" sizeMd="5">
                <IonCard id="mothers">
                  <IonCardHeader><IonCardTitle>Mothers ({filteredMothers.length})</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    {loading ? <div className="center"><IonSpinner /></div> : filteredMothers.length === 0 ? <div className="empty">No mothers found</div> : (
                      <div className="mother-list" role="list">
                        {filteredMothers.map((m) => (
                          <div key={m.id} role="listitem" className="mother-row" tabIndex={0} onClick={() => openMother(m)} onKeyDown={(e) => { if (e.key === "Enter") openMother(m); }}>
                            <div className="mother-left">
                              <div className="mother-name">{m.full_name}</div>
                              <div className="small-note">{m.contact ?? "No contact"} · Last: {m.last_visit ?? "—"}</div>
                            </div>
                            <div className="mother-right">
                              {m.high_risk ? <span className="pill danger">High</span> : <span className="pill">OK</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

            <IonRow className="extras-row">
              <IonCol size="12" id="resources">
                <IonCard>
                  <IonCardHeader><IonCardTitle>Resources & Reminders</IonCardTitle></IonCardHeader>
                  <IonCardContent>
                    <div className="resource-grid">
                      <div className="resource-card">Upload educational PDF / video (UI only)</div>
                      <div className="resource-card">Manage reminders & templates</div>
                      <div className="resource-card">View DOH guidelines</div>
                    </div>
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>

          </IonGrid>
        </div>

        {/* Mother detail modal */}
        <IonModal isOpen={modalOpen} onDidDismiss={closeMother} aria-labelledby="mother-profile-title">
          <div className="modal-header">
            <h2 id="mother-profile-title">Mother Profile</h2>
            <button className="close-btn" onClick={closeMother}>Close</button>
          </div>
          <div className="modal-body">
            {selectedMother ? (
              <>
                <div className="profile-top">
                  <img src="/assets/mother-care.jpg" alt="" className="profile-photo" />
                  <div>
                    <h3>{selectedMother.full_name}</h3>
                    <div className="small-note">Age: {selectedMother.age ?? "—"}</div>
                    <div className="small-note">Contact: {selectedMother.contact ?? "—"}</div>
                    <div className="small-note">Last visit: {selectedMother.last_visit ?? "—"}</div>
                  </div>
                </div>

                <section className="profile-section">
                  <h4>Notes</h4>
                  <p>{selectedMother.notes || "No notes available."}</p>
                </section>

                <section className="profile-actions">
                  <IonButton onClick={() => { history.push(`/Capstone/mother/${selectedMother.id}`); }}>Open Full Profile</IonButton>
                  <IonButton color="tertiary" onClick={() => alert("Mark follow-up - placeholder")}>Mark Follow-up</IonButton>
                </section>
              </>
            ) : <div className="center"><IonSpinner /></div>}
          </div>
        </IonModal>

      </IonContent>
    </IonPage>
  );
};

export default DashboardBHW;
