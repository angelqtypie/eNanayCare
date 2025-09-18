
import React from "react";
import { useEffect, useState } from "react";
import {
  IonButton,
  IonInput,
  IonList,
  IonItem,
  IonLabel,
  IonDatetime,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

interface CalendarProps {
  role: string;
  userId: string;
}

interface Event {
  id: string;
  title: string;
  date: string;
}

const Calendar: React.FC<CalendarProps> = ({ role, userId }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .order("date", { ascending: true });

    if (!error && data) {
      setEvents(data as Event[]);
    }
  };

  const handleAdd = async () => {
    if (!title || !date) return;

    const { error } = await supabase.from("calendar_events").insert({
      title,
      date,
      created_by: userId,
    });

    if (!error) {
      setTitle("");
      setDate("");
      fetchEvents();
    }
  };

  return (
    <>
      {role === "bhw" && (
        <div style={{ marginBottom: 20 }}>
          <IonInput
            placeholder="Event title"
            value={title}
            onIonChange={(e) => {
              const value = (e as CustomEvent).detail?.value;
              if (typeof value === "string") setTitle(value);
            }}
          />
          <IonDatetime
            presentation="date"
            value={date}
            onIonChange={(e) => {
              const value = (e as CustomEvent).detail?.value;
              if (typeof value === "string") setDate(value);
            }}
          />
          <IonButton onClick={handleAdd}>Add Event</IonButton>
        </div>
      )}

      <IonList>
        {events.map((event) => (
          <IonItem key={event.id}>
            <IonLabel>
              <strong>{event.date}:</strong> {event.title}
            </IonLabel>
          </IonItem>
        ))}
      </IonList>
    </>
  );
};

export default Calendar;
