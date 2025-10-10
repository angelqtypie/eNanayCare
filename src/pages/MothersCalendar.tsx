import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonText,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

const MothersCalendar: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("User not logged in");
      return;
    }
    fetchAppointments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      const { data, error: e } = await supabase
        .from("appointments")
        .select("*")
        .eq("mother_id", userId)
        .order("appointment_date", { ascending: true });

      if (e) {
        console.error("fetchAppointments error:", e);
        setError("Failed to load appointments.");
        return;
      }
      setAppointments(data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load appointments.");
    }
  };

  const today = new Date();
  const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const todayAppts = appointments.filter((a) => a.appointment_date && isSameDay(new Date(a.appointment_date), today));
  const upcomingAppts = appointments.filter((a) => {
    if (!a.appointment_date) return false;
    const ad = new Date(a.appointment_date);
    // upcoming means date after today
    return ad > today && !isSameDay(ad, today);
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar className="header-toolbar">
          <IonTitle>Appointments</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="dashboard-content">
        {error && <IonText color="danger" className="ion-padding">{error}</IonText>}

        <div style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Today</h3>
        </div>
        {todayAppts.length ? (
          <IonList>
            {todayAppts.map((a: any, i: number) => (
              <IonCard key={i} className="glass-card">
                <IonCardContent>
                  <h4>{a.purpose}</h4>
                  <p>{a.appointment_date ? new Date(a.appointment_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Time not set"}</p>
                  <p className="muted">{a.location || ""}</p>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        ) : (
          <p className="muted">No appointments for today.</p>
        )}

        <div style={{ marginTop: 20, marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Upcoming</h3>
        </div>

        {upcomingAppts.length ? (
          upcomingAppts.map((a: any, i: number) => (
            <IonCard key={i} className="glass-card">
              <IonCardContent>
                <h4>{a.purpose}</h4>
                <p>{a.appointment_date ? new Date(a.appointment_date).toLocaleString() : "Date not set"}</p>
                <p className="muted">{a.location || ""}</p>
              </IonCardContent>
            </IonCard>
          ))
        ) : (
          <p className="muted">No upcoming appointments.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default MothersCalendar;
