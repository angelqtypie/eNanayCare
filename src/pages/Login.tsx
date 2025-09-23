// FILE: src/pages/MotherLogin.tsx
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

const MotherLogin: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");

    const supabase = getSupabase();
    const { data: mother, error: loginError } = await supabase
      .from("mothers")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (loginError || !mother) {
      setError("Invalid email or password");
      return;
    }

    localStorage.setItem("mother_email", mother.email);
    localStorage.setItem("mother_name", mother.name);

    // IMPORTANT: update supabase client so future requests include x-full-name
    initSupabase(mother.name);

    history.push("/Capstone/dashboardmother");
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mother Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonInput
          label="Email"
          placeholder="Enter your email"
          type="email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value!)}
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

export default MotherLogin;
