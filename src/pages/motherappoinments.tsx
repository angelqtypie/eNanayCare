// src/pages/Appointments.tsx
import React, { useEffect, useState } from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import "../layouts/MotherMainLayout";
import MotherMainLayout from "../layouts/MotherMainLayout";

const Appointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user ?? null;
    if (!user) return;

    const { data: mother } = await supabase.from("mothers").select("id").eq("auth_user_id", user.id).maybeSingle();
    if (!mother?.id) return;

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("mother_id", mother.id)
      .order("date", { ascending: false });

    if (error) console.error(error);
    else setAppointments(data || []);
  };

  return (
    <MotherMainLayout>
      <IonHeader translucent>
        <IonToolbar>
          <IonTitle>Appointments</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {appointments.length === 0 && <div className="center small-muted">No appointments yet</div>}
        {appointments.map((a) => (
          <IonCard key={a.id} className="material-card">
            <IonCardHeader>
              <IonCardTitle>{a.date} {a.time ? `• ${a.time}` : ""}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <div><b>Location:</b> {a.location || "-"}</div>
              <div><b>Status:</b> {a.status}</div>
              {a.notes && <div className="small-muted">Notes: {a.notes}</div>}
            </IonCardContent>
          </IonCard>
        ))}
      </IonContent>
    </MotherMainLayout>
  );
};

export default Appointments;
