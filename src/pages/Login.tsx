// /src/pages/Login.tsx
import { useState } from "react";
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
import React from "react";

import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Login: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    try {
      // Check the profiles table directly
      const { data: profile, error: fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("full_name", fullName)
        .eq("password", password)
        .single();

      if (fetchError || !profile) {
        setError("Invalid credentials");
        return;
      }

      // Save role and full name in localStorage
      localStorage.setItem("role", profile.role);
      localStorage.setItem("full_name", profile.full_name);

      // Navigate based on role
      if (profile.role === "bhw") {
        history.push("/Capstone/dashboardbhw");
      } else if (profile.role === "mother") {
        history.push("/Capstone/dashboardmother");
      } else {
        setError("Unknown role");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Try again.");
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Login</IonTitle>
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

export default Login;
