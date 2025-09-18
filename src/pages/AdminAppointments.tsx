// File: src/pages/AdminAppointments.tsx
import React, { useEffect, useState } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList,
  IonItem, IonLabel, IonInput, IonButton, IonSelect, IonSelectOption, IonDatetime
} from '@ionic/react';
import { supabase } from '../utils/supabaseClient';

export default function AdminAppointments() {
  const [mothers, setMothers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [motherId, setMotherId] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { loadMothers(); loadAppointments(); }, []);

  async function loadMothers() {
    const { data, error } = await supabase.from('profiles').select('id').eq('role', 'mother');
    if (error) console.error(error);
    setMothers(data ?? []);
  }

  async function loadAppointments() {
    const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
    if (error) console.error(error);
    setAppointments(data ?? []);
  }

  async function addAppointment() {
    setError(null);
    if (!motherId || !title || !date) {
      setError("All fields are required.");
      return;
    }

    const { error } = await supabase.from('appointments').insert([
      { mother_id: motherId, title, date, notes }
    ]);

    if (error) {
      console.error("Insert failed:", error);
      setError(error.message);
      return;
    }

    setMotherId('');
    setTitle('');
    setDate('');
    setNotes('');
    await loadAppointments();
  }

  async function deleteAppointment(id: string) {
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) console.error(error);
    await loadAppointments();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Manage Appointments</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Create Appointment</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <IonSelect
          value={motherId}
          placeholder="Select Mother"
          onIonChange={e => setMotherId(e.detail.value as string)}
        >
          {mothers.map(m => (
            <IonSelectOption key={m.id} value={m.id}>{m.id}</IonSelectOption>
          ))}
        </IonSelect>

        <IonInput
          placeholder="Title"
          value={title}
          onIonChange={e => setTitle(e.detail.value ?? '')}
        />

        <IonDatetime
          value={date}
          presentation="date-time"
          onIonChange={e => setDate(typeof e.detail.value === "string" ? e.detail.value : '')}
        />

        <IonInput
          placeholder="Notes"
          value={notes}
          onIonChange={e => setNotes(e.detail.value ?? '')}
        />

        <IonButton expand="block" onClick={addAppointment} style={{ marginTop: 12 }}>
          Add
        </IonButton>

        <h2 style={{ marginTop: 20 }}>All Appointments</h2>
        <IonList>
          {appointments.map(app => (
            <IonItem key={app.id}>
              <IonLabel>
                <h2>{app.title}</h2>
                <p>{new Date(app.date).toLocaleString()}</p>
                <p>Mother ID: {app.mother_id}</p>
                {app.notes && <p>{app.notes}</p>}
              </IonLabel>
              <IonButton slot="end" color="danger" onClick={() => deleteAppointment(app.id)}>
                Delete
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
