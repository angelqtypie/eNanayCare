// File: src/pages/RegisterMother.tsx
import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonAlert,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";

export default function RegisterMother() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  async function handleRegister() {
    if (!email || !password || !fullName) {
      setAlertMsg("Please fill in all required fields.");
      setShowAlert(true);
      return;
    }

    // 1. Create account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      setAlertMsg(authError.message);
      setShowAlert(true);
      return;
    }

    // 2. Save extra info in profiles table
    const { error: dbError } = await supabase.from("profiles").insert([
      {
        id: authData.user?.id, // match auth user id
        full_name: fullName,
        email,
        contact_no: contactNo,
        address,
        due_date: dueDate,
        role: "mother",
      },
    ]);

    if (dbError) {
      setAlertMsg(dbError.message);
      setShowAlert(true);
      return;
    }

    setAlertMsg("Mother registered successfully!");
    setShowAlert(true);

    // clear fields
    setFullName("");
    setEmail("");
    setPassword("");
    setContactNo("");
    setAddress("");
    setDueDate("");
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Register Pregnant Mother</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Full Name*</IonLabel>
          <IonInput value={fullName} onIonChange={(e) => setFullName(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Email*</IonLabel>
          <IonInput type="email" value={email} onIonChange={(e) => setEmail(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Password*</IonLabel>
          <IonInput type="password" value={password} onIonChange={(e) => setPassword(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Contact Number</IonLabel>
          <IonInput value={contactNo} onIonChange={(e) => setContactNo(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Address</IonLabel>
          <IonInput value={address} onIonChange={(e) => setAddress(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Expected Due Date</IonLabel>
          <IonInput type="date" value={dueDate} onIonChange={(e) => setDueDate(e.detail.value!)} />
        </IonItem>

        <IonButton expand="block" color="success" onClick={handleRegister} style={{ marginTop: "1rem" }}>
          Register Mother
        </IonButton>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Registration"
          message={alertMsg}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  );
}
