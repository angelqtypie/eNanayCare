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
      setError("Please enter email and password.");
      setLoading(false);
      return;
    }

    try {
      // ✅ Log in using Supabase Auth
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError || !data.user) {
        setError("Invalid email or password.");
        return;
      }

      const userId = data.user.id;

      // ✅ Fetch additional user data from 'users' table (role, name, etc.)
      const { data: profile, error: profileError } = await supabase
        .from("users")
        .select("role, full_name")
        .eq("id", userId)
        .single();

      if (profileError || !profile) {
        setError("Could not fetch user profile.");
        return;
      }

      // ✅ Save session data locally (optional)
      localStorage.setItem("userId", userId);
      localStorage.setItem("role", profile.role);
      localStorage.setItem("fullName", profile.full_name);

      // ✅ Redirect based on role
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
          setError("This account has no valid role.");
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
        <IonToolbar>
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
          <IonText color="danger" className="ion-padding-top">
            <p>{error}</p>
          </IonText>
        )}

        <IonButton expand="block" onClick={handleLogin} disabled={loading}>
          Login
        </IonButton>

        <IonLoading isOpen={loading} message="Logging in..." />
      </IonContent>
    </IonPage>
  );
};

export default Login;
