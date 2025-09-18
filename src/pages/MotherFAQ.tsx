// File: src/pages/MotherFAQ.tsx
import React from "react";
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent } from "@ionic/react";
import FAQChatbot from "../components/Chatbot";

export default function MotherFAQ() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/Capstone/motherdashboard" />
          </IonButtons>
          <IonTitle>FAQs Chatbot</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p>Ask any question about pregnancy, nutrition, appointments, or maternal health.</p>
        <FAQChatbot />
      </IonContent>
    </IonPage>
  );
}
