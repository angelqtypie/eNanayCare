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
  IonButton,
  IonTitle,
  IonToolbar,
  IonHeader,
  IonSpinner,
} from "@ionic/react";
import { motion, AnimatePresence } from "framer-motion";
import { arrowBackOutline, pinOutline, timeOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();
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
      if (!user) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      const { data: mother, error: motherError } = await supabase
        .from("mothers")
        .select("mother_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (motherError) throw motherError;
      if (!mother?.mother_id) {
        setError("No mother profile found.");
        setLoading(false);
        return;
      }

      const { data, error: apptError } = await supabase
        .from("appointments")
        .select("*")
        .eq("mother_id", mother.mother_id)
        .order("date", { ascending: true });

      if (apptError) throw apptError;

      // Automatically update status to "Missed" if the appointment has passed
      const updatedAppointments = data.map((appointment: Appointment) => {
        const apptDate = new Date(appointment.date + "T" + (appointment.time || "00:00"));
        const now = new Date();

        if (appointment.status?.toLowerCase() === "scheduled" && apptDate < now) {
          return { ...appointment, status: "Missed" };
        }

        return appointment;
      });

      setAppointments(updatedAppointments);
    } catch (err) {
      console.error("Error loading appointments:", err);
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

  const appointmentsForDate = appointments.filter(
    (a) =>
      a.date &&
      new Date(a.date).toDateString() === selectedDate.toDateString()
  );

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "#4caf50"; // green
      case "missed":
        return "#e57373"; // red
      default:
        return "#f47ba7"; // pink for scheduled
    }
  };

  const formatTime = (time?: string) => {
    return time && time !== "00:00" ? time : "Not set";
  };

  return (
    <MotherMainLayout>
      <IonHeader>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <IonToolbar
            style={{
              "--background": "linear-gradient(120deg, #f9d9e7, #fbeaf1, #fdeef6)",
              "--color": "#6a3a55",
            }}
          >
            <IonButton
              fill="clear"
              slot="start"
              onClick={() => history.push("/dashboardmother")}
              style={{
                color: "#6a3a55",
                borderRadius: "50%",
                marginLeft: "6px",
              }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: "22px" }} />
            </IonButton>
            <IonTitle style={{ fontWeight: "bold" }}>My Calendar</IonTitle>
          </IonToolbar>
        </motion.div>
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
              className="calendar-wrapper"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date, view }) => {
                  if (view !== "month") return null;
                  const appts = appointments.filter(
                    (a) =>
                      a.date &&
                      new Date(a.date).toDateString() === date.toDateString()
                  );
                  return (
                    <div className="dot-group">
                      {appts.map((a, i) => (
                        <span
                          key={i}
                          className="dot-indicator"
                          style={{
                            color: getStatusColor(a.status),
                            fontSize: "1.5rem", // Adjust dot size
                          }}
                        >
                          •
                        </span>
                      ))}
                    </div>
                  );
                }}
                tileClassName={({ date }) => {
                  const day = date.getDay();
                  const classes: string[] = [];
                  if (day === 0 || day === 6) classes.push("weekend-tile");
                  if (date.toDateString() === new Date().toDateString())
                    classes.push("today-tile");
                  if (selectedDate.toDateString() === date.toDateString())
                    classes.push("selected-tile");
                  return classes.join(" ");
                }}
              />
            </motion.div>

            <motion.h3
              className="appointments-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Appointments on {selectedDate.toDateString()}
            </motion.h3>

            <AnimatePresence mode="wait">
              {appointmentsForDate.length > 0 ? (
                <IonList key={selectedDate.toDateString()}>
                  {appointmentsForDate.map((a, index) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                      <IonCard className="glass-card">
                        <IonCardContent>
                          <h4>{a.notes || "Prenatal Checkup"}</h4>
                          <p>
                            <IonIcon icon={timeOutline} />{" "}
                            <b>Time:</b> {formatTime(a.time)}
                          </p>
                          <p>
                            <IonIcon icon={pinOutline} />{" "}
                            <b>Location:</b>{" "}
                            {a.location || "Barangay Health Center"}
                          </p>
                          <p>
                            <b>Status:</b>{" "}
                            <span
                              className="status-badge"
                              style={{
                                backgroundColor: getStatusColor(a.status),
                              }}
                            >
                              {a.status || "Scheduled"}
                            </span>
                          </p>
                        </IonCardContent>
                      </IonCard>
                    </motion.div>
                  ))}
                </IonList>
              ) : (
                <motion.p
                  key="no-appointments"
                  className="muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  No appointments on this date.
                </motion.p>
              )}
            </AnimatePresence>

            {/* 🩷 LEGEND SECTION */}
            <motion.div
              className="legend"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h4>Color Means</h4>
              <div className="legend-items">
                <div className="legend-item">
                  <span className="dot" style={{ background: "#f47ba7" }}></span>
                  Scheduled
                </div>
                <div className="legend-item">
                  <span className="dot" style={{ background: "#4caf50" }}></span>
                  Completed
                </div>
                <div className="legend-item">
                  <span className="dot" style={{ background: "#D85C5C" }}></span>
                  Missed
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* ✅ STYLES */}
        <style>{`
          .calendar-container {
            background: #fff8fb;
            font-family: "Poppins", sans-serif;
            padding-bottom: 80px;
          }

          .calendar-wrapper {
            margin: -15px;
            padding: 13px;
            background: #ffffff;
            border-radius: 22px;
            box-shadow: 0 4px 14px rgba(241, 167, 194, 0.25);
            text-align: center;
          }

          .react-calendar {
            width: 100%;
            border: none;
            background: transparent;
          }

          .react-calendar__tile {
            height: 40px;
            border-radius: 50%;
            transition: all 0.3s ease;
          }

          .react-calendar__tile:hover {
            background-color: #fde2f0 !important;
            transform: scale(1.05);
          }

          .selected-tile {
            background: radial-gradient(circle, #f47ba7 20%, #f8b4d9 80%) !important;
            color: #fff !important;
            border-radius: 50% !important;
            box-shadow: 0 0 12px rgba(244, 123, 167, 0.6);
          }

          .today-tile {
            border: 2px solid #f47ba7;
            border-radius: 50%;
          }

          .weekend-tile abbr {
            color: #f47ba7 !important;
          }

          .react-calendar__navigation button {
            color: #d16cae !important;
            font-weight: bold;
            font-size: 1.0rem;
          }

          .react-calendar__month-view__weekdays__weekday {
            color: #d16cae;
            font-weight: 600;
          }

          .dot-group {
            display: flex;
            justify-content: center;
            margin-top: -5px;
          }

          .dot-indicator {
            font-size: 1.5rem; /* Larger dot */
            line-height: 0;
          }

          .appointments-title {
            text-align: center;
            color: #e76fae;
            margin-top: 20px;
            font-weight: 600;
          }

          .glass-card {
            background: rgba(255, 255, 255, 0.9);
            border-radius: 18px;
            margin: 12px 16px;
            box-shadow: 0 4px 14px rgba(241, 167, 194, 0.25);
            transition: all 0.3s ease;
          }

          .glass-card:hover {
            transform: scale(1.03);
            box-shadow: 0 6px 20px rgba(241, 167, 194, 0.35);
          }

          .glass-card h4 {
            color: #d764a0;
            margin-bottom: 6px;
            font-weight: 600;
          }

          .status-badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 12px;
            font-size: 0.8rem;
            color: #fff;
          }

          .muted {
            text-align: center;
            color: #999;
            margin-top: 18px;
          }

          .center {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 70vh;
            color: #888;
          }

          .error-text {
            text-align: center;
            display: block;
            margin-top: 10px;
          }

          .legend {
            text-align: center;
            margin-top: 25px;
            background: #fff;
            border-radius: 16px;
            padding: 10px 0;
            box-shadow: 0 2px 10px rgba(244, 123, 167, 0.15);
          }

          .legend h4 {
            color: #d764a0;
            margin-bottom: 8px;
            font-weight: 600;
          }

          .legend-items {
            display: flex;
            justify-content: center;
            gap: 16px;
          }

          .legend-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.9rem;
            color: #555;
          }

          .dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
          }
        }
        `}</style>
      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersCalendar;
