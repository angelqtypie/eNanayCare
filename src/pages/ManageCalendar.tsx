// /src/pages/ManageCalendar.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonButton,
  IonDatetime,
  IonLabel,
  IonList,
  IonItem
} from '@ionic/react';
import React from "react";

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const ManageCalendar = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [events, setEvents] = useState<any[]>([]);

  const handleAdd = async () => {
    if (!title || !eventDate) return;

    await supabase.from("calendar_events").insert({
      title,
      description,
      event_date: eventDate,
    });

    setTitle("");
    setDescription("");
    setEventDate("");
    fetchEvents();
  };

  const fetchEvents = async () => {
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (data) setEvents(data);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>📆 Manage Calendar</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonInput
          label="Title"
          value={title}
          onIonChange={(e) => {
            const value = (e as CustomEvent).detail?.value;
            if (typeof value === "string") setTitle(value);
          }}
        />

        <IonInput
          label="Description"
          value={description}
          onIonChange={(e) => {
            const value = (e as CustomEvent).detail?.value;
            if (typeof value === "string") setDescription(value);
          }}
        />

        <IonDatetime
          presentation="date"
          value={eventDate}
          onIonChange={(e) => {
            const value = (e as CustomEvent).detail?.value;
            if (typeof value === "string") setEventDate(value);
          }}
        />

        <IonButton expand="block" onClick={handleAdd}>Add Event</IonButton>

        <IonList>
          {events.map((ev) => (
            <IonItem key={ev.id}>
              <IonLabel>
                <h2>{ev.title}</h2>
                <p>{ev.event_date}</p>
                <p>{ev.description}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default ManageCalendar;
