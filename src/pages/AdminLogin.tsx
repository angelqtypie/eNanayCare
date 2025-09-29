// FILE: src/pages/BHWLogin.tsx

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
  IonLoading,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const BHWLogin: React.FC = () => {
  const history = useHistory();
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!fullName || !password) {
      setError("Full name and password are required.");
      return;
    }

    setLoading(true);

    try {
      console.log("Trying to login with:", { fullName, password });

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("full_name", fullName)
        .eq("role", "bhw")
        .single();

      if (profileError || !profile) {
        console.log("Profile fetch error:", profileError);
        setError("No BHW found with that name.");
        return;
      }

      if (profile.password !== password) {
        setError("Incorrect password.");
        return;
      }

      localStorage.setItem("role", profile.role);
      localStorage.setItem("full_name", profile.full_name);
      localStorage.setItem("bhw_id", profile.id);

      history.push("/Capstone/dashboardbhw");
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>BHW Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Full Name</IonLabel>
          <IonInput
            type="text"
            value={fullName}
            onIonChange={(e) => setFullName(e.detail.value || "")}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value || "")}
          />
        </IonItem>

        {error && (
          <IonText color="danger">
            <p className="ion-padding-top">{error}</p>
          </IonText>
        )}

        <IonButton expand="block" onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </IonButton>

        <IonLoading isOpen={loading} message="Please wait..." />
      </IonContent>
    </IonPage>
  );
};

export default BHWLogin;
