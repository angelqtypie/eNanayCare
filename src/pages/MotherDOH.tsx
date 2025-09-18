// File: src/pages/MotherDOH.tsx
import React from "react";
import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle,
  IonContent, IonCard, IonCardHeader, IonCardTitle, IonCardContent
} from "@ionic/react";

export default function MotherDOH() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start"><IonBackButton defaultHref="/Capstone/motherdashboard" /></IonButtons>
          <IonTitle>DOH Guidelines</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Department of Health Guidelines</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Here you can find official maternal health guidelines from the Department of Health.
              This page can link directly to <a href="https://doh.gov.ph" target="_blank" rel="noreferrer">DOH Website</a>
              or embed PDF resources.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
}
