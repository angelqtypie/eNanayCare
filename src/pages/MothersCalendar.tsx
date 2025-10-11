import React, { useEffect, useState } from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonText,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

type Appointment = {
  id: string;
  mother_id: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  status?: string;
};

const MothersCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchAppointments(userId);
  }, [userId]);

  const fetchAppointments = async (uid: string) => {
    try {
      const { data, error: e } = await supabase
        .from("appointments")
        .select("*")
        .eq("mother_id", uid)
        .order("date", { ascending: true });

      if (e) throw e;
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    }
  };
  
  // ✅ Safe fix for react-calendar v5 type signature
  const handleDateChange: CalendarProps["onChange"] = (value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      setSelectedDate(value[0]);
    }
  };

  const appointmentsForDate = appointments.filter(
    (a) => a.date && new Date(a.date).toDateString() === selectedDate.toDateString()
  );

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonTitle>Appointments Calendar</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {error && <IonText color="danger">{error}</IonText>}

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            tileContent={({ date, view }) => {
              if (view === "month") {
                const hasAppt = appointments.some(
                  (a) => new Date(a.date).toDateString() === date.toDateString()
                );
                return hasAppt ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>•</span>
                ) : null;
              }
              return null;
            }}
          />
        </div>

        <h3>Appointments on {selectedDate.toDateString()}</h3>
        {appointmentsForDate.length ? (
          <IonList>
            {appointmentsForDate.map((a) => (
              <IonCard key={a.id} className="glass-card">
                <IonCardContent>
                  <h4>{a.notes || "Appointment"}</h4>
                  <p>
                    <b>Time:</b> {a.time || "N/A"}
                  </p>
                  <p>
                    <b>Location:</b> {a.location || ""}
                  </p>
                  <p>
                    <b>Status:</b> {a.status || "Scheduled"}
                  </p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <p className="muted">No appointments on this date.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MothersCalendar;
