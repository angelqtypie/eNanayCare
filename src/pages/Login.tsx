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

const MotherLogin: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        // Handle specific errors
        console.error("Auth login error:", authError);

        if (
          authError instanceof Error &&
          authError.message.includes("Email not confirmed")
        ) {
          setError(
            "Your email is not confirmed yet. Please check your inbox and verify your email."
          );
        } else {
          setError(authError.message || "Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (!data?.user) {
        setError("Login failed. No user data returned.");
        setLoading(false);
        return;
      }

      // Login successful, redirect user or do what you want here
      setLoading(false);
      history.push("/Capstone/dashboardmother"); // or your target route
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setError("Unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mother Login</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding">
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            required
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Password</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={(e) => setPassword(e.detail.value!)}
            required
          />
        </IonItem>

        {error && (
          <IonText color="danger" className="ion-padding-top">
            {error}
          </IonText>
        )}

        <IonButton expand="block" onClick={handleLogin} disabled={loading}>
          Login
        </IonButton>

        <IonLoading isOpen={loading} message={"Logging in..."} />
      </IonContent>
    </IonPage>
  );
};

export default MotherLogin;
