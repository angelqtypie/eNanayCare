/**
 * File: MothersCalendar.tsx
 * Updated for gentle pastel theme and accessibility.
 */

import React, { useEffect, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonText,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonSpinner,
} from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { pinOutline, timeOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";

interface Appointment {
  id: string;
  mother_id: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  status?: string;
}

const MothersCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      if (!user) throw new Error("User not logged in.");

      const { data: mother } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mother?.mother_id) throw new Error("No mother profile found.");

      const { data } = await supabase
        .from("appointments")
        .select("*")
        .eq("mother_id", mother.mother_id)
        .order("date", { ascending: true });

      const updated = (data || []).map((a: Appointment) => {
        const apptDate = new Date(a.date + "T" + (a.time || "00:00"));
        const now = new Date();
        if (a.status?.toLowerCase() === "scheduled" && apptDate < now) {
          return { ...a, status: "Missed" };
        }
        return a;
      });

      setAppointments(updated);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) setSelectedDate(value);
    else if (Array.isArray(value) && value[0] instanceof Date)
      setSelectedDate(value[0]);
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#6CBF84";
      case "missed":
        return "#D93B3B";
      default:
        return "#F69AB8";
    }
  };

  // ✅ Clean formatted time (AM/PM format)
  const formatTime = (time?: string) => {
    if (!time || time === "00:00") return "Not set";

    try {
      const [hours, minutes] = time.split(":").map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return time;
    }
  };

  // ✅ Strongly typed list
  const appointmentsForDate: Appointment[] = appointments.filter(
    (a: Appointment) =>
      a.date && new Date(a.date).toDateString() === selectedDate.toDateString()
  );


  return (
    <MotherMainLayout>
      <IonHeader>
        <IonToolbar
          style={{
            "--background": "linear-gradient(120deg, #fce1ec, #fdeef6)",
            "--color": "#6a3a55",
          }}
        >
          <IonTitle style={{ fontWeight: "bold", textAlign: "center" }}>
            My Calendar
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen scrollY className="calendar-container">
        {loading ? (
          <div className="center">
            <IonSpinner name="crescent" />
            <p>Loading appointments...</p>
          </div>
        ) : (
          <>
            {error && (
              <IonText color="danger" className="error-text">
                {error}
              </IonText>
            )}

            <motion.div
              className="responsive-layout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="calendar-section">
                <Calendar
                  onChange={handleDateChange}
                  value={selectedDate}
                  tileContent={({ date, view }) => {
                    if (view !== "month") return null;
                    const appts = appointments.filter(
                      (a) => a.date && new Date(a.date).toDateString() === date.toDateString()
                    );
                    return (
                      <div className="dot-group">
                        {appts.map((a, i) => (
                          <span
                            key={i}
                            className="dot-indicator"
                            style={{ color: getStatusColor(a.status) }}
                          >
                            •
                          </span>
                        ))}
                      </div>
                    );
                  }}
                  tileClassName={({ date }) => {
                    const classes: string[] = [];
                    if (selectedDate.toDateString() === date.toDateString())
                      classes.push("selected-tile");
                    return classes.join(" ");
                  }}
                />
              </div>

              <div className="info-section">
                <div className="legend">
                  <h4>Color Legend</h4>
                  <div className="legend-items">
                    <div className="legend-item">
                      <span className="dot" style={{ background: "#F69AB8" }}></span>
                      Scheduled
                    </div>
                    <div className="legend-item">
                      <span className="dot" style={{ background: "#6CBF84" }}></span>
                      Completed
                    </div>
                    <div className="legend-item">
                      <span className="dot" style={{ background: "#D93B3B" }}></span>
                      Missed
                    </div>
                  </div>
                </div>

                <motion.h3
                  className="appointments-title"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  Appointments on {selectedDate.toDateString()}
                </motion.h3>

                <AnimatePresence mode="wait">
                  {appointmentsForDate.length > 0 ? (
                    <IonList key={selectedDate.toDateString()}>
                      {appointmentsForDate.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                          <IonCard className="glass-card">
                            <IonCardContent>
                              <h4>{a.notes || "Prenatal Checkup"}</h4>
                              <p>
                                <IonIcon icon={timeOutline} /> <b>Time:</b> {formatTime(a.time)}
                              </p>
                              <p>
                                <IonIcon icon={pinOutline} /> <b>Location:</b> {a.location || "Barangay Health Center"}
                              </p>
                              <p>
                                <b>Status:</b>
                                <span className="status-badge" style={{ backgroundColor: getStatusColor(a.status) }}>
                                  {a.status || "Scheduled"}
                                </span>
                              </p>
                            </IonCardContent>
                          </IonCard>
                        </motion.div>
                      ))}
                    </IonList>
                  ) : (
                    <p className="muted">No appointments on this date.</p>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        )}

<style>{`
  .calendar-container {
    background: #fff9fb;
    font-family: 'Poppins', sans-serif;
    padding: 20px;
  }

  /* --- LAYOUT --- */
  .responsive-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  @media (min-width: 768px) {
    .responsive-layout {
      flex-direction: row;
      justify-content: center;
      align-items: flex-start;
      gap: 2rem;
      padding: 1rem 3rem;
    }
    .calendar-section {
      flex: 0.5;
      max-width: 420px;
    }
    .info-section {
      flex: 0.8;
    }
  }

  /* --- CALENDAR --- */
  .react-calendar {
    width: 100%;
    border: none !important;
    background: #fff;
    border-radius: 24px;
    box-shadow: 0 6px 20px rgba(245, 160, 190, 0.15);
    padding: 10px;
    transition: all 0.3s ease;
  }

  .react-calendar__navigation button {
    color: #d85fa5 !important;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 8px;
    transition: background 0.3s;
  }

  .react-calendar__navigation button:hover {
    background: rgba(247, 208, 222, 0.6);
  }

  .react-calendar__tile {
    border-radius: 12px;
    height: 50px;
    transition: all 0.25s ease;
    color: #444;
  }

  .react-calendar__tile:hover {
    background: radial-gradient(circle, #ffd3e1 0%, #ffeaf1 90%) !important;
    box-shadow: 0 0 15px rgba(244, 133, 173, 0.6);
    transform: scale(1.08);
    color: #6a3a55 !important;
    font-weight: 600;
  }

  .selected-tile {
    background: linear-gradient(145deg, #f47ba7, #f8b9d4) !important;
    color: white !important;
    border-radius: 50% !important;
    box-shadow: 0 0 18px rgba(244, 123, 167, 0.8);
    transform: scale(1.1);
  }

  .dot-group {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: -5px;
  }

  .dot-indicator {
    font-size: 1.9rem;
    line-height: 0;
  }

  /* --- LEGEND --- */
  .legend {
    background: #ffffff;
    border-radius: 22px;
    padding: 18px;
    text-align: center;
    box-shadow: 0 4px 18px rgba(244, 123, 167, 0.25);
    margin-bottom: 1.5rem;
  }

  .legend h4 {
    color: #d764a0;
    font-weight: 700;
    margin-bottom: 12px;
    font-size: 1rem;
  }

  .legend-items {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    color: #555;
  }

  .dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    display: inline-block;
  }

  /* --- CARDS --- */
  .glass-card {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 6px 22px rgba(245, 150, 190, 0.25);
    margin-bottom: 12px;
    transition: all 0.3s ease;
  }

  .glass-card:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 24px rgba(245, 160, 195, 0.35);
  }

  .glass-card h4 {
    color: #d764a0;
    font-weight: 600;
    margin-bottom: 6px;
  }

  /* --- TITLES & TEXT --- */
  .appointments-title {
    color: #e76fae;
    font-weight: 700;
    text-align: center;
    margin-top: 1rem;
  }

  .status-badge {
    margin-left: 8px;
    color: white;
    border-radius: 12px;
    padding: 4px 10px;
    font-size: 0.85rem;
  }

  .muted {
    color: #999;
    text-align: center;
    margin-top: 8px;
  }

  .center {
    text-align: center;
    color: #777;
    margin-top: 40vh;
  }

  /* --- EYE-FRIENDLY ENHANCEMENTS --- */
  * {
    transition: background-color 0.2s ease, color 0.2s ease;
  }

  .react-calendar__tile:focus {
    background: #ffd8e7 !important;
    box-shadow: 0 0 12px rgba(250, 150, 190, 0.5);
  }

  .react-calendar__month-view__weekdays__weekday {
    color: #d46ca0 !important;
    font-weight: 600;
  }
`}</style>

      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersCalendar;
