import React from "react";
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from "@ionic/react";

const SetPassword: React.FC = () => {
  console.log("SetPassword simple render");
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Testing</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Hello, SetPassword is working.</p>
      </IonContent>
    </IonPage>
  );
};

export default SetPassword;
