import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";

const DashboardMother = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const fetchTodayEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("event_date", today);
    if (data) setEvents(data);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mother's Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Welcome, Mother! 💕</p>

        <h2>📅 Today’s Schedule</h2>
        {events.length ? (
          <IonList>
            {events.map((ev) => (
              <IonItem key={ev.id}>
                <IonLabel>
                  <h2>{ev.title}</h2>
                  <p>{ev.description}</p>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
        ) : (
          <p>No events today.</p>
        )}

        <IonButton routerLink="/Capstone/plottedcalendar" expand="block">
          🔍 View Full Calendar
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default DashboardMother;
