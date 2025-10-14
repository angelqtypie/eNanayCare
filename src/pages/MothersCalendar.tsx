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
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (userId) fetchAppointments();
    else setError("User not logged in.");
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const { data: mother } = await supabase
        .from("mothers")
        .select("id")
        .eq("auth_user_id", userId)
        .single();

      if (!mother) return setError("Mother record not found.");

      const { data, error: e } = await supabase
        .from("appointments")
        .select("*")
        .eq("mother_id", mother.id)
        .order("date", { ascending: true });

      if (e) throw e;
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    }
  };

  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) setSelectedDate(value);
    else if (Array.isArray(value) && value[0] instanceof Date)
      setSelectedDate(value[0]);
  };

  const appointmentsForDate = appointments.filter(
    (a) =>
      a.date && new Date(a.date).toDateString() === selectedDate.toDateString()
  );

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
              "--background":
                " linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7)",
              "--color": "#6a3a55",
            }}
          >
            <IonButton
              fill="clear"
              slot="start"
              onClick={() => history.push("/dashboardmother")}
              style={{
                color: "#fff",
                borderRadius: "50%",
                marginLeft: "4px",
              }}
            >
              <IonIcon icon={arrowBackOutline} style={{ fontSize: "22px" }} />
            </IonButton>
            <IonTitle style={{ fontWeight: "bold" }}>My Calendar</IonTitle>
          </IonToolbar>
        </motion.div>
      </IonHeader>

      <IonContent fullscreen scrollY={true} className="calendar-container">
        {error && <IonText color="danger">{error}</IonText>}

        <motion.div
          className="calendar-wrapper"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={({ date, view }) =>
              view === "month" &&
              appointments.some(
                (a) => new Date(a.date).toDateString() === date.toDateString()
              ) ? (
                <span className="dot-indicator">•</span>
              ) : null
            }
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
                        <IonIcon icon={timeOutline} /> <b>Time:</b>{" "}
                        {a.time || "Not set"}
                      </p>
                      <p>
                        <IonIcon icon={pinOutline} />{" "}
                        <b>Location:</b> {a.location || "Barangay Health Center"}
                      </p>
                      <p>
                        <b>Status:</b>{" "}
                        <span
                          className={`status-badge ${a.status?.toLowerCase()}`}
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

        <style>{`
          .calendar-container {
            background: #fff8fb;
            font-family: "Poppins", sans-serif;
            padding-bottom: 80px;
          }

          .calendar-wrapper {
            margin: 20px;
            padding: 16px;
            background: #ffffff;
            border-radius: 22px;
            box-shadow: 0 4px 14px rgba(241, 167, 194, 0.25);
            text-align: center;
          }

          .react-calendar {
            width: 100%;
            border: none;
            background: transparent;
            font-family: "Poppins", sans-serif;
          }

          .react-calendar__tile {
            height: 42px;
            border-radius: 50%;
            transition: all 0.3s ease;
          }

          .react-calendar__tile:hover {
            background-color: #fde2f0 !important;
            transform: scale(1.05);
          }

          .selected-tile {
            background: radial-gradient(circle at center, #f47ba7 20%, #f8b4d9 80%) !important;
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
            font-size: 1rem;
          }

          .react-calendar__month-view__weekdays__weekday {
            color: #d16cae;
            font-weight: 600;
          }

          .dot-indicator {
            color: #f47ba7;
            font-size: 22px;
            display: block;
            text-align: center;
            margin-top: -6px;
          }

          .appointments-title {
            text-align: center;
            color: #e76fae;
            margin-top: 20px;
            font-weight: 700;
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
            background-color: #f6b1d5;
            color: #fff;
            box-shadow: 0 0 6px rgba(244, 123, 167, 0.4);
          }

          .status-badge.scheduled {
            background-color: #f47ba7;
          }

          .muted {
            text-align: center;
            color: #999;
            margin-top: 18px;
          }
        `}</style>
      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersCalendar;
