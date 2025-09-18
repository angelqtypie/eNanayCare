// File: src/pages/MotherBooklet.tsx
import React from "react";
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from "@ionic/react";

export default function MotherBooklet() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/Capstone/motherdashboard" /></IonButtons>
          <IonTitle>Pregnancy Booklet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>My Health Records</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>This is where you can track weight, blood pressure, prenatal visits, and doctor’s notes.</p>
            {/* Later: Map over data from Supabase */}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
