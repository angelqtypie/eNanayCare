import React, { useEffect, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  IonPage,
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
      // Fetch mother_id using auth_user_id first
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
      <IonHeader className="calendar-header">
        <IonToolbar>
          <IonButton fill="clear" slot="start" onClick={() => history.push("/dashboardmother")}>
            <IonIcon icon={arrowBackOutline} />
          </IonButton>
          <IonTitle>My Calendar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="mothers-calendar-content" fullscreen scrollY={true}>
        {error && <IonText color="danger">{error}</IonText>}

        <div className="calendar-wrapper">
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
          />
        </div>

        <h3 className="appointments-title">
          Appointments on {selectedDate.toDateString()}
        </h3>

        {appointmentsForDate.length > 0 ? (
          <IonList>
            {appointmentsForDate.map((a) => (
              <IonCard key={a.id} className="glass-card">
                <IonCardContent>
                  <h4>{a.notes || "Prenatal Checkup"}</h4>
                  <p>
                    <IonIcon icon={timeOutline} />{" "}
                    <b>Time:</b> {a.time || "Not set"}
                  </p>
                  <p>
                    <IonIcon icon={pinOutline} />{" "}
                    <b>Location:</b> {a.location || "Barangay Health Center"}
                  </p>
                  <p>
                    <b>Status:</b>{" "}
                    <span className={`status-badge ${a.status?.toLowerCase()}`}>
                      {a.status || "Scheduled"}
                    </span>
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <p className="muted">No appointments on this date.</p>
        )}
      </IonContent>
    </MotherMainLayout>
  );
};

export default MothersCalendar;
