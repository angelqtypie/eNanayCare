import React, { useEffect, useMemo, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonSpinner,
  IonToast,
} from "@ionic/react";
import {
  closeOutline,
  medicalOutline,
  addOutline,
  chevronBackOutline,
  chevronForwardOutline,
} from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";

type Mother = {
  mother_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  address?: string;
};

type Appointment = {
  id: string;
  mother_id: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  status?: string;
  mother?: Mother;
};

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewDate, setViewDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [toastMsg, setToastMsg] = useState("");

  useEffect(() => {
    fetchAppointments();
  }, []);

  // 🔹 Fetch all appointments
  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `id, mother_id, date, time, location, notes, status, mother:mothers(first_name, last_name, mother_id)`
        )
        .order("date", { ascending: true })
        .order("time", { ascending: true });
      if (error) throw error;
      setAppointments((data as Appointment[]) || []);
    } catch (err) {
      console.error(err);
      setToastMsg("Error fetching appointments.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Delete appointment
  const deleteAppointment = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
      setToastMsg("Appointment deleted successfully.");
      fetchAppointments();
    } catch (err) {
      console.error(err);
      setToastMsg("Error deleting appointment.");
    }
  };

  // 🔹 Format display time
  const formatDisplayTime = (time?: string) => {
    if (!time) return "";
    try {
      const t = time.length === 5 ? `${time}:00` : time;
      const dt = new Date(`1970-01-01T${t}`);
      return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return time;
    }
  };

  // 🔹 Calendar helpers
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDayOfMonth = useMemo(() => new Date(year, month, 1), [year, month]);
  const lastDayOfMonth = useMemo(() => new Date(year, month + 1, 0), [year, month]);
  const daysInMonth = lastDayOfMonth.getDate();
  const startWeekday = firstDayOfMonth.getDay();

  const appointmentsByDate = useMemo(() => {
    const map = new Map<string, Appointment[]>();
    for (const a of appointments) {
      const d = a.date;
      if (!map.has(d)) map.set(d, []);
      map.get(d)!.push(a);
    }
    return map;
  }, [appointments]);

  const getAppointmentsForDate = (date: Date) => {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(date.getDate()).padStart(2, "0")}`;
    return appointmentsByDate.get(key) || [];
  };

  const goPrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const goNextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const buildMonthGrid = () => {
    const grid: Date[] = [];
    const prevDays = startWeekday;
    const prevMonthLast = new Date(year, month, 0).getDate();
    for (let i = prevDays - 1; i >= 0; i--) grid.push(new Date(year, month - 1, prevMonthLast - i));
    for (let d = 1; d <= daysInMonth; d++) grid.push(new Date(year, month, d));
    while (grid.length % 7 !== 0)
      grid.push(new Date(year, month + 1, grid.length - prevDays - daysInMonth + 1));
    return grid;
  };

  const monthGrid = buildMonthGrid();

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar>
          <h2 className="page-title">Appointments</h2>
        </IonToolbar>
      </IonHeader>

      <IonContent className="appointments-content">
        <div className="top-row">
          {/* 🔹 Calendar Section */}
          <div className="calendar-card">
            <div className="calendar-header">
              <IonButton fill="clear" onClick={goPrevMonth}>
                <IonIcon icon={chevronBackOutline} />
              </IonButton>
              <div className="month-label">
                {viewDate.toLocaleString(undefined, { month: "long", year: "numeric" })}
              </div>
              <IonButton fill="clear" onClick={goNextMonth}>
                <IonIcon icon={chevronForwardOutline} />
              </IonButton>
            </div>

            <div className="weekdays">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
                <div key={w} className="weekday">
                  {w}
                </div>
              ))}
            </div>

            <div className="month-grid">
              {monthGrid.map((d, idx) => {
                const inCurrentMonth = d.getMonth() === month;
                const dayAppointments = getAppointmentsForDate(d);
                const missed = dayAppointments.filter((a) => a.status === "Missed").length;

                return (
                  <div
                    key={idx}
                    className={`day-cell ${inCurrentMonth ? "" : "muted"} ${
                      isSameDay(d, selectedDate) ? "selected" : ""
                    }`}
                    onClick={() => setSelectedDate(d)}
                  >
                    <div className="day-number">{d.getDate()}</div>
                    {dayAppointments.length > 0 && (
                      <div className="count-text">
                        Appointments: {dayAppointments.length}
                        {missed > 0 && <div>Missed: {missed}</div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="calendar-footer">
              <IonButton
                size="small"
                onClick={() => {
                  const today = new Date();
                  setViewDate(new Date(today.getFullYear(), today.getMonth(), 1));
                  setSelectedDate(today);
                }}
              >
                Today
              </IonButton>

              <IonButton size="small" onClick={() => setToastMsg("Add appointment modal here")}>
                <IonIcon icon={addOutline} /> &nbsp; New Appointment
              </IonButton>
            </div>
          </div>

          {/* 🔹 Appointment List Section */}
          <div className="list-card">
            <h3 className="section-title">
              Appointments for{" "}
              {selectedDate.toLocaleDateString(undefined, {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h3>

            {loading ? (
              <div className="centered">
                <IonSpinner name="dots" />
              </div>
            ) : (
              <>
                {getAppointmentsForDate(selectedDate).length === 0 ? (
                  <p className="no-appointments">No appointments for this date.</p>
                ) : (
                  <table className="appointments-table">
                    <thead>
                      <tr>
                        <th>Mother</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getAppointmentsForDate(selectedDate).map((a) => (
                        <tr key={a.id}>
                          <td>
                            {a.mother ? `${a.mother.first_name} ${a.mother.last_name}` : "N/A"}
                          </td>
                          <td>{formatDisplayTime(a.time)}</td>
                          <td>{a.location}</td>
                          <td>{a.status}</td>
                          <td>
                            <IonButton
                              color="danger"
                              size="small"
                              onClick={() => deleteAppointment(a.id)}
                            >
                              <IonIcon icon={closeOutline} />
                            </IonButton>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </>
            )}
          </div>
        </div>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2000}
          onDidDismiss={() => setToastMsg("")}
        />

        <style>{`
          .page-title { padding: 15px 20px; font-weight: 600; color: #222; }
          .top-row { display: flex; gap: 16px; padding: 20px; align-items: flex-start; }
          .calendar-card { width: 390px; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
          .calendar-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 4px; }
          .month-label { font-weight: 700; font-size: 15px; }
          .weekdays { display: grid; grid-template-columns: repeat(7, 1fr); margin-top: 6px; color: #666; font-weight: 600; font-size: 12px; }
          .weekday { text-align: center; padding: 4px 0; }
          .month-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; margin-top: 6px; }
          .day-cell { background: #fff; border-radius: 8px; min-height: 60px; padding: 6px; border: 1px solid #ddd; cursor: pointer; }
          .day-cell.muted { opacity: 0.45; background: #fafafa; }
          .day-cell.selected { border: 2px solid #007bff; }
          .day-number { font-weight: 700; font-size: 13px; }
          .count-text { margin-top: 4px; font-size: 11px; line-height: 1.2; color: #444; }
          .calendar-footer { display: flex; justify-content: space-between; margin-top: 8px; }
          .list-card { flex: 1; background: #fff; border-radius: 12px; padding: 10px; box-shadow: 0 3px 8px rgba(0,0,0,0.08); }
          .appointments-table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 13px; }
          .appointments-table th { text-align: left; padding: 6px; background: #f8f8f8; font-weight: 700; }
          .appointments-table td { padding: 6px; border-bottom: 1px solid #eee; }
          .no-appointments { color: #777; padding: 10px; }
        `}</style>
      </IonContent>
    </MainLayout>
  );
};

export default Appointments;
