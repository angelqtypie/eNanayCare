// src/pages/SetPassword.tsx

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
  IonText,
  IonLoading,
  IonAlert,
} from "@ionic/react";
import { useHistory, useLocation } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import "./SetPassword.css";

const SetPassword: React.FC = () => {
  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const accessToken = queryParams.get("access_token");
  const type = queryParams.get("type"); // Should be "invite"

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSetPassword = async () => {
    setError("");

    if (!password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!accessToken || type !== "invite") {
      setError("Invalid or missing token.");
      return;
    }

    setLoading(true);
    try {
      // 1. Exchange access token for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(accessToken);

      if (exchangeError) throw exchangeError;

      // 2. Update the user's password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after success
      setTimeout(() => history.push("/login"), 2000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Set Your Password</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <h2>Welcome to eNanayCare!</h2>
        <p>Set your password to complete registration.</p>

        <IonItem>
          <IonLabel position="floating">New Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Confirm Password</IonLabel>
          <IonInput
            type="password"
            value={confirm}
            onIonChange={(e) => setConfirm(e.detail.value!)}
          />
        </IonItem>

        {error && (
          <IonText color="danger">
            <p>{error}</p>
          </IonText>
        )}

        <IonButton expand="block" onClick={handleSetPassword} disabled={loading}>
          Set Password
        </IonButton>

        <IonLoading isOpen={loading} message="Setting password..." />

        <IonAlert
          isOpen={success}
          header="Success"
          message="Password set successfully!"
          buttons={[]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SetPassword;
