// File: src/pages/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
} from "@ionic/react";
import {
  peopleOutline,
  chatbubblesOutline,
  calendarOutline,
  documentTextOutline,
  personAddOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";

export default function AdminDashboard() {
  const [mothers, setMothers] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, role")
      .eq("role", "mother");

    if (error) {
      console.error("Error loading mothers:", error.message);
    } else {
      setMothers(data ?? []);
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>BHW Admin Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Quick Action Cards */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard button routerLink="/faq-manager">
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={chatbubblesOutline}
                    style={{ fontSize: "2rem", color: "#3880ff" }}
                  />
                  <h3>Manage FAQs</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard button routerLink="/Capstone/adminappointments">
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={calendarOutline}
                    style={{ fontSize: "2rem", color: "#10dc60" }}
                  />
                  <h3>Appointments</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="6">
              <IonCard button routerLink="/reports">
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={documentTextOutline}
                    style={{ fontSize: "2rem", color: "#eb445a" }}
                  />
                  <h3>Reports</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon
                    icon={peopleOutline}
                    style={{ fontSize: "2rem", color: "#ffc409" }}
                  />
                  <h3>Total Mothers</h3>
                  <p style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                    {mothers.length}
                  </p>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Register Mother Button */}
        <IonButton
          expand="block"
          routerLink="/Capstone/registermother"
          color="success"
          style={{ marginBottom: "1rem" }}
        >
          <IonIcon icon={personAddOutline} slot="start" />
          Register New Mother
        </IonButton>

        {/* Mother List */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Registered Mothers</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {mothers.length > 0 ? (
              <IonList>
                {mothers.map((m) => (
                  <IonItem key={m.id}>
                    <IonLabel>
                      <h2>{m.full_name || "Unnamed Mother"}</h2>
                      <p>{m.email}</p>
                    </IonLabel>
                    <IonButton
                      slot="end"
                      routerLink={`/mother-booklet/${m.id}`}
                      color="secondary"
                    >
                      View Booklet
                    </IonButton>
                    <IonButton
                      slot="end"
                      routerLink={`/adminappointments/${m.id}`}
                      color="tertiary"
                    >
                      Appointments
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <p>No mothers registered yet.</p>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
