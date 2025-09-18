// File: src/pages/MotherAppointments.tsx
import React, { useEffect, useState } from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel } from '@ionic/react';
import { supabase } from '../utils/supabaseClient';

export default function MotherAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('mother_id', user.id)
      .order('date', { ascending: true });
    if (!error) setAppointments(data ?? []);
  }

  return (
    <IonPage>
      <IonHeader><IonToolbar><IonTitle>My Appointments</IonTitle></IonToolbar></IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {appointments.length === 0 && <p>No appointments yet.</p>}
          {appointments.map(app => (
            <IonItem key={app.id}>
              <IonLabel>
                <h2>{app.title}</h2>
                <p>{new Date(app.date).toLocaleString()}</p>
                {app.notes && <p>{app.notes}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
