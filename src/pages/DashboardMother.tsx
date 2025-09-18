// File: src/pages/MotherDashboard.tsx
import React from "react";
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonButton, IonGrid, IonRow, IonCol, IonIcon
} from "@ionic/react";
import { calendarOutline, bookOutline, chatbubbleEllipsesOutline, medkitOutline } from "ionicons/icons";



export default function MotherDashboard() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mother Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Welcome Section */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome, Mother!</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Track your health, appointments, and access maternal care resources.</p>
          </IonCardContent>
        </IonCard>

        {/* Main Features */}
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard button routerLink="/Capstone/motherappointments">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={calendarOutline} style={{ fontSize: "2rem", color: "#3880ff" }} />
                  <h3>Appointments</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6">
              <IonCard button routerLink="/Capstone/motherbooklet">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={bookOutline} style={{ fontSize: "2rem", color: "#10dc60" }} />
                  <h3>Pregnancy Booklet</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="6">
              <IonCard button routerLink="/Capstone/motherfaq">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={chatbubbleEllipsesOutline} style={{ fontSize: "2rem", color: "#ffce00" }} />
                  <h3>FAQs Chatbot</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="6">
              <IonCard button routerLink="/Capstone/motherdoh">
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={medkitOutline} style={{ fontSize: "2rem", color: "#eb445a" }} />
                  <h3>DOH Guidelines</h3>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
