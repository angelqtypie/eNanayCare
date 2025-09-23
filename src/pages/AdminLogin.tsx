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
import { getSupabase, initSupabase } from "../utils/supabaseClient";

const AdminLogin: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      const supabase = getSupabase();
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("full_name", fullName)
        .eq("password", password)
        .eq("role", "bhw")
        .single();

      if (fetchError || !profile) {
        setError("Invalid BHW credentials");
        return;
      }

      localStorage.setItem("role", profile.role);
      localStorage.setItem("full_name", profile.full_name);

      // update client header after login
      initSupabase(profile.full_name);

      history.push("/Capstone/dashboardbhw");
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
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
