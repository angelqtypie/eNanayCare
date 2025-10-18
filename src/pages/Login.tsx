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
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Please enter both email and password.");
      setLoading(false);
      return;
    }

    try {
      // Step 1: Authenticate
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error("Auth error:", authError.message);
        setError("Invalid login credentials.");
        setLoading(false);
        return;
      }

      if (!authData.user) {
        console.warn("Auth succeeded but no user returned");
        setError("Unable to login.");
        setLoading(false);
        return;
      }

      const userId = authData.user.id;
      console.log("✅ Authenticated user ID:", userId);

      // Step 2: Fetch profile from users table
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        setError("Error fetching profile.");
        setLoading(false);
        return;
      }

      if (!profile) {
        console.warn("No profile found for user ID:", userId);
        setError("Profile not found.");
        setLoading(false);
        return;
      }

      console.log("Profile:", profile);

      // Step 3: Store info
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("fullName", profile.full_name);

      // Step 4: Redirect based on role
      switch (profile.role) {
        case "admin":
          history.push("/dashboardadmin");
          break;
        case "bhw":
          history.push("/dashboardbhw");
          break;
        case "mother":
          history.push("/dashboardmother");
          break;
        default:
          setError("Invalid user role.");
          break;
      }

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
        <IonToolbar color="primary">
          <IonTitle>Login</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
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
          <IonText color="danger">
            <p className="ion-padding-start ion-padding-top">{error}</p>
          </IonText>
        )}

        <IonButton
          expand="block"
          onClick={handleLogin}
          disabled={loading}
          className="ion-margin-top"
        >
          Login
        </IonButton>

        <IonLoading isOpen={loading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
