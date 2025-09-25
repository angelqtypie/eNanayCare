// FILE: src/pages/AdminLogin.tsx
import React, { useState } from "react";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonText,
  IonHeader,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const AdminLogin: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const { data: profile, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("full_name", fullName)
      .eq("password", password)
      .eq("role", "bhw")
      .single();

    if (fetchError || !profile) {
      setError("Invalid admin credentials");
      return;
    }

    localStorage.setItem("role", profile.role);
    localStorage.setItem("full_name", profile.full_name);

    history.push("/Capstone/dashboardbhw");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>BHW Admin Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Full Name"
          placeholder="Enter your full name"
          value={fullName}
          onIonChange={(e) => setFullName(e.detail.value!)}
        />
        <IonInput
          label="Password"
          placeholder="Enter your password"
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
        />

        {error && <IonText color="danger">{error}</IonText>}

        <IonButton expand="block" onClick={handleLogin}>
          Login
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default AdminLogin;
