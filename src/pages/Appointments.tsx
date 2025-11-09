// src/pages/Appointments.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonSpinner,
  IonRow,
  IonCol,
  IonGrid,
  IonToast,
} from "@ionic/react";
import {
  closeOutline,
  trashOutline,
  downloadOutline,
  addCircleOutline,
  checkmarkDoneOutline,
  alertCircleOutline,
} from "ionicons/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";
import emailjs from "@emailjs/browser";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/* Lightweight types */
interface Mother {
  mother_id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
}
interface Appointment {
  id: string;
  mother_id: string;
  date: string; // yyyy-mm-dd
  time?: string;
  location?: string;
  notes?: string;
  status: "Scheduled" | "Completed" | "Missed";
  mother?: Mother | null;
}

/* Theme colors */
const STATUS_COLORS: Record<string, string> = {
  Scheduled: "#2563eb",
  Completed: "#16a34a",
  Missed: "#dc2626",
};

const CACHE_KEY = "eNanay_appointments_cache_v1";

/* Helper - format to yyyy-mm-dd */
const fmtDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

/* Helper - format time -> 12h */
const fmtTime12 = (time?: string) => {
  if (!time) return "";
  const [hh, mm] = time.split(":");
  let h = parseInt(hh, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${mm} ${ampm}`;
};

const saveCache = (data: Appointment[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {
    /* ignore */
  }
};
const loadCache = (): Appointment[] | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.data ?? null;
  } catch {
    return null;
  }
};

/* --- New helpers for calendar/ics --- */

// 1) Google Calendar format: YYYYMMDDTHHMMSSZ
const toGCalFormat = (d: Date) => {
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
};

// escape ICS content
const escapeICS = (s: string) => {
  return s.replace(/\r\n/g, "\\n").replace(/\n/g, "\\n").replace(/,/g, "\\,");
};

// 2) Generate ICS content including VALARM for 30 minutes
const generateICS = (opts: {
  uid?: string;
  timestamp: string; // DTSTAMP
  dtstart: string; // DTSTART
  dtend: string; // DTEND
  summary: string;
  description?: string;
  location?: string;
}) => {
  const uid = opts.uid ?? `${Date.now()}@enanaycare`;
  // VALARM trigger -30 minutes, ACTION:DISPLAY (works on many clients)
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//eNanayCare//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${opts.timestamp}`,
    `DTSTART:${opts.dtstart}`,
    `DTEND:${opts.dtend}`,
    `SUMMARY:${escapeICS(opts.summary)}`,
    `DESCRIPTION:${escapeICS(opts.description || "")}`,
    `LOCATION:${escapeICS(opts.location || "")}`,
    "BEGIN:VALARM",
    "TRIGGER:-PT30M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n");
};

// 3) Upload ICS to Supabase Storage (returns public URL or null)
const uploadICSToSupabase = async (filename: string, icsBlob: Blob) => {
  try {
    const path = `ics/${filename}`;
    const file = new File([icsBlob], filename, { type: "text/calendar" });
    // upload returns { data, error } in Supabase JS
    const { data: uploadData, error: upErr } = await supabase.storage.from("ics").upload(path, file, {
      cacheControl: "3600",
      upsert: true,
    });
    if (upErr) {
      console.error("Supabase upload error", upErr);
      return null;
    }
    const { data } = supabase.storage.from("ics").getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (err) {
    console.error("uploadICSToSupabase failed", err);
    return null;
  }
};

/* --- Component --- */
const Appointments: React.FC = () => {
  // EmailJS keys from env (Vite)
  const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
  const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  const [mothers, setMothers] = useState<Mother[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const [form, setForm] = useState({
    motherIds: [] as string[],
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"All" | Appointment["status"]>("All");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const greetings = [
    "Keep going — you're changing lives today!",
    "You’re doing great work, BHW!",
    "Small steps, big impact — thank you!",
    "Ready to help another mama? Let's go!",
  ];

  // Fetch mothers
  const fetchMothers = async () => {
    try {
      const { data, error } = await supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, user:users(email)")
        .order("last_name", { ascending: true });

      if (error) throw error;
      const list = (data || []).map((m: any) => ({
        mother_id: m.mother_id,
        first_name: m.first_name,
        last_name: m.last_name,
        email: m.user?.email ?? null,
      })) as Mother[];
      setMothers(list);
    } catch (err) {
      console.error("fetchMothers:", err);
    }
  };

  // Fetch appointments and cache
  const fetchAppointments = async (useCacheIfFail = true) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `id, date, time, location, notes, status, mother_id, mothers(mother_id, first_name, last_name, user:users(email))`
        )
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (error) throw error;

      const mapped: Appointment[] = (data || []).map((a: any) => ({
        id: a.id,
        mother_id: a.mother_id,
        date: a.date,
        time: a.time,
        location: a.location,
        notes: a.notes,
        status: a.status || "Scheduled",
        mother: a.mothers
          ? {
              mother_id: a.mothers.mother_id,
              first_name: a.mothers.first_name,
              last_name: a.mothers.last_name,
              email: a.mothers?.user?.email ?? null,
            }
          : null,
      }));
      setAppointments(mapped);
      saveCache(mapped);
    } catch (err) {
      console.error("fetchAppointments:", err);
      if (useCacheIfFail) {
        const cached = loadCache();
        if (cached) {
          setAppointments(cached);
          setToastMsg("Offline: showing cached appointments");
        } else {
          setToastMsg("Failed to load appointments");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Update statuses
  const syncStatuses = async () => {
    try {
      const todayStr = fmtDate(new Date());
      const { data: scheduled, error } = await supabase
        .from("appointments")
        .select("id, date, mother_id, status")
        .lte("date", todayStr);

      if (error) throw error;
      if (!scheduled || scheduled.length === 0) return;

      for (const app of scheduled) {
        const { data: rec } = await supabase
          .from("health_records")
          .select("id")
          .eq("mother_id", app.mother_id)
          .eq("encounter_date", app.date)
          .limit(1);

        const hasRecord = !!(rec && rec.length);
        const desired: Appointment["status"] = hasRecord
          ? "Completed"
          : new Date(app.date) <= new Date(todayStr)
          ? "Missed"
          : "Scheduled";

        if (app.status !== desired) {
          await supabase.from("appointments").update({ status: desired }).eq("id", app.id);
        }
      }
    } catch (err) {
      console.error("syncStatuses:", err);
    }
  };

  // Add appointment(s) + enhanced email with calendar + ics upload
  const addAppointment = async () => {
    if (isSubmitting) return;
    if (!form.motherIds.length || !form.date || !form.time || !form.location) {
      setToastMsg("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // fetch mother info
      const { data: momsData, error: momsError } = await supabase
        .from("mothers")
        .select("mother_id, first_name, last_name, user:users(email)")
        .in("mother_id", form.motherIds);

      if (momsError) throw momsError;

      const mothersLookup: Record<string, Mother> = {};
      (momsData || []).forEach((m: any) => {
        mothersLookup[m.mother_id] = {
          mother_id: m.mother_id,
          first_name: m.first_name,
          last_name: m.last_name,
          email: m.user?.email ?? null,
        };
      });

      // check duplicates & prepare inserts
      const toInsertPayload: any[] = [];
      const toNotify: { mother_id: string; name: string; email?: string | null }[] = [];

      for (const motherId of form.motherIds) {
        const existingQ = await supabase
          .from("appointments")
          .select("id")
          .eq("mother_id", motherId)
          .eq("date", form.date)
          .eq("time", form.time)
          .limit(1);

        if (existingQ.error) {
          console.error("check existing appt failed for", motherId, existingQ.error);
        }

        const exists = Array.isArray(existingQ.data) && existingQ.data.length > 0;
        if (exists) {
          console.log("Skipping existing appointment for", motherId);
          continue;
        }

        toInsertPayload.push({
          mother_id: motherId,
          date: form.date,
          time: form.time,
          location: form.location,
          notes: form.notes,
          status: "Scheduled",
        });

        const mom = mothersLookup[motherId];
        toNotify.push({
          mother_id: motherId,
          name: mom ? `${mom.first_name} ${mom.last_name}` : "Client",
          email: mom?.email ?? null,
        });
      }

      if (toInsertPayload.length === 0) {
        setToastMsg("No new appointments to create (duplicates skipped)");
        setIsSubmitting(false);
        return;
      }

      // bulk insert
      const { data: inserted, error: insertErr } = await supabase
        .from("appointments")
        .insert(toInsertPayload)
        .select("id, date, time, location, notes, status, mother_id");

      if (insertErr) throw insertErr;

      const insertedMotherIds = new Set((inserted || []).map((r: any) => r.mother_id));

      for (const n of toNotify) {
        if (!n.email) continue;
        if (!insertedMotherIds.has(n.mother_id)) continue;

        // compute start/end Date (assume form.time like "08:30")
        // Note: constructing Date uses local timezone; toISOString converts to UTC
        const startDate = new Date(`${form.date}T${form.time}:00`);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // +1 hour

        const calendar_start = toGCalFormat(startDate);
        const calendar_end = toGCalFormat(endDate);
        const formatted_time = fmtTime12(form.time);

        // generate ICS content (with VALARM 30min prior)
        const icsText = generateICS({
          timestamp: toGCalFormat(new Date()),
          dtstart: calendar_start,
          dtend: calendar_end,
          summary: `Prenatal Appointment - ${n.name}`,
          description: form.notes || "",
          location: form.location || "",
        });

        // try upload to Supabase Storage -> get public URL
        const filename = `appointment_${n.mother_id}_${form.date.replace(/-/g,"")}_${form.time.replace(/:/g,"")}.ics`;
        const icsBlob = new Blob([icsText], { type: "text/calendar" });
        let ics_link: string | null = null;

        try {
          ics_link = await uploadICSToSupabase(filename, icsBlob);
        } catch (err) {
          console.error("uploadICSToSupabase error", err);
          ics_link = null;
        }

        // fallback to data URI if supabase upload not configured
        if (!ics_link) {
          try {
            const b64 = btoa(unescape(encodeURIComponent(icsText)));
            ics_link = `data:text/calendar;base64,${b64}`;
          } catch (err) {
            ics_link = "";
            console.error("Failed to create data URI for ICS", err);
          }
        }

        const templateParams = {
          name: n.name,
          email: n.email,
          date: form.date,
          formatted_time,
          time: form.time,
          location: form.location,
          notes: form.notes || "",
          calendar_start,
          calendar_end,
          ics_link,
        };

        try {
          await emailjs.send(SERVICE_ID!, TEMPLATE_ID!, templateParams, PUBLIC_KEY!);
          console.log("Email sent to", n.email);
        } catch (e) {
          console.error("EmailJS send failed for", n.email, e);
        }
      }

      // success UI
      setShowModal(false);
      setForm({ motherIds: [], date: "", time: "", location: "", notes: "" });
      await syncStatuses();
      await fetchAppointments();
      setToastMsg("✅ Appointment(s) created & emails sent (where available).");
    } catch (err) {
      console.error("addAppointment:", err);
      setToastMsg("Failed to create appointment");
    } finally {
      setIsSubmitting(false);
      // small timeout before revoking potential object URLs (if you used createObjectURL)
    }
  };

  // delete / mark handlers (unchanged)
  const deleteAppointment = async (id: string) => {
    if (!confirm("Delete appointment?")) return;
    try {
      await supabase.from("appointments").delete().eq("id", id);
      await fetchAppointments();
      setToastMsg("Appointment deleted");
    } catch (err) {
      console.error("deleteAppointment:", err);
      setToastMsg("Delete failed");
    }
  };

  const markCompleted = async (appt: Appointment) => {
    try {
      await supabase.from("appointments").update({ status: "Completed" }).eq("id", appt.id);
      await supabase.from("visit_records").insert({
        appointment_id: appt.id,
        mother_id: appt.mother_id,
        visit_date: appt.date,
        remarks: "Marked completed by BHW (mobile)",
      });
      await fetchAppointments();
      setToastMsg("Marked completed");
    } catch (err) {
      console.error("markCompleted:", err);
      setToastMsg("Action failed");
    }
  };
  const markMissed = async (appt: Appointment) => {
    try {
      await supabase.from("appointments").update({ status: "Missed" }).eq("id", appt.id);
      await fetchAppointments();
      setToastMsg("Marked missed");
    } catch (err) {
      console.error("markMissed:", err);
      setToastMsg("Action failed");
    }
  };

  // exportCSV (unchanged)
  const exportCSV = () => {
    const headers = ["Mother", "Date", "Time", "Location", "Status", "Notes"];
    const rows = appointments.map(a => [
      a.mother ? `${a.mother.first_name} ${a.mother.last_name}` : "N/A",
      a.date,
      a.time || "",
      a.location || "",
      a.status,
      (a.notes || "").replace(/\n/g, " "),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `appointments_${fmtDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // calendar map, summary, visibleAppointments, upcoming (unchanged)
  const calendarMap = useMemo(() => {
    const map: Record<string, { Scheduled: number; Completed: number; Missed: number; total: number }> = {};
    for (const a of appointments) {
      if (!map[a.date]) map[a.date] = { Scheduled: 0, Completed: 0, Missed: 0, total: 0 };
      map[a.date][a.status] = (map[a.date][a.status] || 0) + 1;
      map[a.date].total++;
    }
    return map;
  }, [appointments]);

  const summary = useMemo(() => {
    const totals: any = { All: 0, Scheduled: 0, Completed: 0, Missed: 0 };
    for (const a of appointments) {
      totals.All++;
      totals[a.status] = (totals[a.status] || 0) + 1;
    }

    const months: Record<string, any> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleString("default", { month: "short", year: "numeric" });
      months[key] = { Scheduled: 0, Completed: 0, Missed: 0 };
    }
    for (const a of appointments) {
      const k = new Date(a.date).toLocaleString("default", { month: "short", year: "numeric" });
      if (months[k]) months[k][a.status] = (months[k][a.status] || 0) + 1;
    }
    const monthlyData = Object.entries(months).map(([month, counts]) => ({ month, ...counts } as any));
    return { totals, monthlyData };
  }, [appointments]);

  const visibleAppointments = useMemo(() => {
    const dateStr = calendarDate ? fmtDate(calendarDate) : null;
    const q = (search || "").trim().toLowerCase();
    return appointments
      .filter(a => (dateStr ? a.date === dateStr : true))
      .filter(a => (filterStatus === "All" ? true : a.status === filterStatus))
      .filter(a => {
        if (!q) return true;
        const name = a.mother ? `${a.mother.first_name} ${a.mother.last_name}`.toLowerCase() : "";
        return name.includes(q) || (a.location || "").toLowerCase().includes(q) || (a.notes || "").toLowerCase().includes(q);
      });
  }, [appointments, calendarDate, search, filterStatus]);

  const upcoming = useMemo(() => {
    const now = fmtDate(new Date());
    return appointments
      .filter(a => a.status === "Scheduled" && a.date >= now)
      .sort((x, y) => (x.date === y.date ? (x.time || "").localeCompare(y.time || "") : x.date.localeCompare(y.date)))
      .slice(0, 4);
  }, [appointments]);

  const tileContent = ({ date }: { date: Date }) => {
    const d = fmtDate(date);
    const cell = calendarMap[d];
    if (!cell) return null;
    const dots = [];
    if (cell.Scheduled) dots.push(<div key="s" className="cal-dot scheduled" />);
    if (cell.Completed) dots.push(<div key="c" className="cal-dot completed" />);
    if (cell.Missed) dots.push(<div key="m" className="cal-dot missed" />);
    return (
      <div title={`${cell.total} appt(s) • S:${cell.Scheduled} C:${cell.Completed} M:${cell.Missed}`} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 4 }}>{dots}</div>
        {cell.total > 1 ? <div style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{cell.total}</div> : null}
      </div>
    );
  };

  useEffect(() => {
    (async () => {
      await fetchMothers();
      await syncStatuses();
      await fetchAppointments();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const greeting = greetings[Math.floor(Math.random() * greetings.length)];
  const todayCount = appointments.filter(a => a.date === fmtDate(new Date())).length;

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar>
          <h2 className="page-title" style={{ padding: "12px 20px", margin: 0 }}>Appointments</h2>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ padding: 16 }}>
          {/* top banner */}
          <div className="top-banner">
            <div>
              <h3 style={{ margin: 0 }}>Hello, BHW!</h3>
              <p style={{ margin: "4px 0 0", color: "#333" }}>{greeting}</p>
            </div>
            <div className="top-actions">
              <IonButton onClick={() => { setCalendarDate(new Date()); setToastMsg("Showing today"); }}>Today</IonButton>
              <IonButton color="primary" onClick={() => setShowModal(true)}><IonIcon icon={addCircleOutline} />&nbsp;Add</IonButton>
              <IonButton onClick={exportCSV}><IonIcon icon={downloadOutline} /></IonButton>
            </div>
          </div>

          {/* summary cards + controls */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="8">
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <div className="stat-card">
                    <div className="stat-title">Today</div>
                    <div className="stat-value">{todayCount}</div>
                    <div className="stat-sub">appointments</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-title">Scheduled</div>
                    <div className="stat-value" style={{ color: STATUS_COLORS.Scheduled }}>{summary.totals.Scheduled || 0}</div>
                    <div className="stat-sub">to visit</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-title">Completed</div>
                    <div className="stat-value" style={{ color: STATUS_COLORS.Completed }}>{summary.totals.Completed || 0}</div>
                    <div className="stat-sub">done</div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-title">Missed</div>
                    <div className="stat-value" style={{ color: STATUS_COLORS.Missed }}>{summary.totals.Missed || 0}</div>
                    <div className="stat-sub">follow-up</div>
                  </div>
                </div>
              </IonCol>

              <IonCol size="12" sizeMd="4" style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "flex-end" }}>
                <IonInput placeholder="Search mother/location/notes" value={search} onIonChange={e => setSearch(e.detail.value!)} />
                <IonSelect value={filterStatus} onIonChange={e => setFilterStatus(e.detail.value)}>
                  <IonSelectOption value="All">All</IonSelectOption>
                  <IonSelectOption value="Scheduled">Scheduled</IonSelectOption>
                  <IonSelectOption value="Completed">Completed</IonSelectOption>
                  <IonSelectOption value="Missed">Missed</IonSelectOption>
                </IonSelect>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* calendar + upcoming + chart */}
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <div className="calendar-card">
                  <Calendar
                    value={calendarDate}
                    onClickDay={(d) => { setCalendarDate(d); setForm(prev => ({ ...prev, date: fmtDate(d) })); }}
                    tileContent={tileContent}
                    tileClassName={({ date }) => date.toDateString() === new Date().toDateString() ? "today-highlight" : undefined}
                  />
                  <div className="calendar-legend" aria-hidden>
                    <div><span className="legend-dot scheduled" /> Scheduled</div>
                    <div><span className="legend-dot completed" /> Completed</div>
                    <div><span className="legend-dot missed" /> Missed</div>
                  </div>
                </div>
                <div style={{ marginTop: 12 }} className="upcoming-panel">
                  <h4 style={{ margin: "6px 0" }}>Upcoming</h4>
                  {upcoming.length === 0 ? <div style={{ color: "#666" }}>No upcoming scheduled</div> : upcoming.map(a => (
                    <div key={a.id} className="upcoming-item">
                      <div>
                        <div style={{ fontWeight: 700 }}>{a.mother ? `${a.mother.first_name} ${a.mother.last_name}` : "N/A"}</div>
                        <div style={{ fontSize: 13, color: "#666" }}>{a.date} {a.time ? `• ${fmtTime12(a.time)}` : ""} — {a.location}</div>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <IonButton size="small" color="success" onClick={() => markCompleted(a)} title="Mark completed"><IonIcon icon={checkmarkDoneOutline} /></IonButton>
                        <IonButton size="small" color="medium" onClick={() => markMissed(a)} title="Mark missed"><IonIcon icon={alertCircleOutline} /></IonButton>
                      </div>
                    </div>
                  ))}
                </div>
              </IonCol>

              <IonCol size="12" sizeMd="8">
                <div className="chart-card">
                  <h4 style={{ marginTop: 0 }}>Monthly Trend (last 6 months)</h4>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={summary.monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="Scheduled" stackId="a" fill={STATUS_COLORS.Scheduled} />
                        <Bar dataKey="Completed" stackId="a" fill={STATUS_COLORS.Completed} />
                        <Bar dataKey="Missed" stackId="a" fill={STATUS_COLORS.Missed} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="table-wrapper" style={{ marginTop: 12 }}>
                  {loading ? (
                    <div style={{ padding: 24, textAlign: "center" }}><IonSpinner name="dots" /></div>
                  ) : visibleAppointments.length === 0 ? (
                    <div style={{ padding: 12, color: "#666" }}>No appointments for selected date/filters.</div>
                  ) : (
                    <table className="appointments-table" role="table">
                      <thead>
                        <tr>
                          <th>Mother</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Location</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleAppointments.map(a => (
                          <tr key={a.id}>
                            <td>{a.mother ? `${a.mother.first_name} ${a.mother.last_name}` : "N/A"}</td>
                            <td>{a.date}</td>
                            <td>{fmtTime12(a.time)}</td>
                            <td>{a.location}</td>
                            <td className={`status ${a.status.toLowerCase()}`} style={{ color: STATUS_COLORS[a.status] }}>{a.status}</td>
                            <td>
                              <IonButton color="danger" size="small" onClick={() => deleteAppointment(a.id)}>
                                <IonIcon icon={trashOutline} />&nbsp;Delete
                              </IonButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </IonCol>
            </IonRow>
          </IonGrid>

          {/* add appointment modal */}
          <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
            <div className="modal-container">
              <div className="modal-header">
                <h3 style={{ margin: 0 }}>New Appointment</h3>
                <IonButton fill="clear" onClick={() => setShowModal(false)}><IonIcon icon={closeOutline} /></IonButton>
              </div>

              <IonList className="form-scroll">
                <IonItem>
                  <IonLabel position="stacked">Select Mother(s)</IonLabel>
                  <IonSelect multiple value={form.motherIds} placeholder="Select mothers" onIonChange={e => setForm(prev => ({ ...prev, motherIds: e.detail.value! }))}>
                    {mothers.map(m => <IonSelectOption key={m.mother_id} value={m.mother_id}>{m.first_name} {m.last_name}</IonSelectOption>)}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Date</IonLabel>
                  <IonInput type="date" value={form.date} onIonChange={e => setForm(prev => ({ ...prev, date: e.detail.value! }))} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Time</IonLabel>
                  <IonInput type="time" value={form.time} onIonChange={e => setForm(prev => ({ ...prev, time: e.detail.value! }))} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput placeholder="Enter location" value={form.location} onIonChange={e => setForm(prev => ({ ...prev, location: e.detail.value! }))} />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Notes</IonLabel>
                  <IonInput placeholder="Optional notes" value={form.notes} onIonChange={e => setForm(prev => ({ ...prev, notes: e.detail.value! }))} />
                </IonItem>
              </IonList>

              <div style={{ padding: 12, display: "flex", gap: 8 }}>
                <IonButton expand="block" color="primary" onClick={addAppointment} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Appointment"}
                </IonButton>
                <IonButton expand="block" color="medium" onClick={() => { setShowModal(false); setForm({ motherIds: [], date: "", time: "", location: "", notes: "" }); }}>
                  Cancel
                </IonButton>
              </div>
            </div>
          </IonModal>
        </div>

        <IonToast isOpen={!!toastMsg} message={toastMsg || ""} duration={2600} onDidDismiss={() => setToastMsg(null)} />

        <style>{`
          .page-title { font-weight:700; }
          .top-banner { display:flex; justify-content:space-between; align-items:center; gap:12px; background: linear-gradient(90deg,#eef2ff,#e6fffa); padding:12px; border-radius:10px; margin-bottom:12px; box-shadow: 0 2px 8px rgba(2,6,23,0.04); }
          .top-actions ion-button { margin-left:6px; }
          .stat-card { background: #fff; padding:12px 14px; border-radius:10px; box-shadow:0 1px 6px rgba(2,6,23,0.04); min-width:120px; }
          .stat-title { font-size:12px; color:#666; }
          .stat-value { font-size:22px; font-weight:700; margin-top:4px; }
          .stat-sub { font-size:12px; color:#888; margin-top:4px; }
          .calendar-card { background:#fff; border-radius:10px; padding:10px; box-shadow:0 1px 6px rgba(2,6,23,0.04); }
          .calendar-legend { display:flex; gap:10px; justify-content:space-between; margin-top:8px; font-size:13px; color:#444; }
          .legend-dot { display:inline-block; width:10px; height:10px; border-radius:50%; margin-right:8px; vertical-align:middle; }
          .legend-dot.scheduled { background:${STATUS_COLORS.Scheduled}; }
          .legend-dot.completed { background:${STATUS_COLORS.Completed}; }
          .legend-dot.missed { background:${STATUS_COLORS.Missed}; }
          .cal-dot { width:8px; height:8px; border-radius:50%; }
          .cal-dot.scheduled { background:${STATUS_COLORS.Scheduled}; }
          .cal-dot.completed { background:${STATUS_COLORS.Completed}; }
          .cal-dot.missed { background:${STATUS_COLORS.Missed}; }
          .today-highlight { background:#fff3bf !important; border-radius:50%; }
          .upcoming-panel { background:#fff; padding:10px; border-radius:10px; margin-top:8px; box-shadow:0 1px 6px rgba(2,6,23,0.04); }
          .upcoming-item { display:flex; justify-content:space-between; align-items:center; padding:8px 6px; border-bottom:1px dashed #eee; }
          .upcoming-item:last-child { border-bottom:none; }
          .chart-card { background:#fff; padding:12px; border-radius:10px; box-shadow:0 1px 6px rgba(2,6,23,0.04); }
          .table-wrapper { background:#fff; padding:10px; border-radius:10px; box-shadow:0 1px 6px rgba(2,6,23,0.04); }
          .appointments-table { width:100%; border-collapse:collapse; }
          .appointments-table th, .appointments-table td { padding:10px 8px; border-bottom:1px solid #f0f3f7; text-align:left; }
          .appointments-table tr:hover { background:#fbfdff; }
          .modal-container { padding:12px; width:100%; max-width:720px; margin:auto; }
          .modal-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
          .form-scroll { max-height:55vh; overflow:auto; padding-right:6px; }
          .status.scheduled { color: ${STATUS_COLORS.Scheduled}; font-weight:600; }
          .status.completed { color: ${STATUS_COLORS.Completed}; font-weight:600; }
          .status.missed { color: ${STATUS_COLORS.Missed}; font-weight:600; }
          @media (max-width: 768px) {
            .top-actions { display:flex; gap:6px; flex-wrap:wrap; }
          }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default Appointments;
