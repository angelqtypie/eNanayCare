// /src/pages/PlottedCalendar.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonDatetime,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import React from "react";

import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

type Event = {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
};

const PlottedCalendar = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (data) setEvents(data);
  };

  const filtered = selectedDate
    ? events.filter(ev => ev.event_date === selectedDate.split("T")[0])
    : [];

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>📅 Your Health Calendar</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonDatetime
          presentation="date"
          value={selectedDate}
          onIonChange={(e) => {
            const value = (e as CustomEvent).detail?.value;
            if (typeof value === "string") setSelectedDate(value);
          }}
        />
        {filtered.length > 0 ? (
          <IonList>
            {filtered.map(ev => (
              <IonItem key={ev.id}>
                <IonLabel>
                  <h2>{ev.title}</h2>
                  <p>{ev.description}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : (
          selectedDate && <p>No events.</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default PlottedCalendar;
