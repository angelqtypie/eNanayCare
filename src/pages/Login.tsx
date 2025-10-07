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
import bcrypt from "bcryptjs";

const Login: React.FC = () => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setLoading(true);

    try {
      // 🔹 Fetch user from Supabase users table
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError || !user) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // 🔹 Verify password with bcrypt
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      // 🔹 Save session locally
      localStorage.setItem("userId", user.id);
      localStorage.setItem("role", user.role);
      localStorage.setItem("fullName", user.full_name);

      // 🔹 Redirect by role
      if (user.role === "admin") {
        history.push("/eNanayCare/dashboardadmin");
      } else if (user.role === "bhw") {
        history.push("/eNanayCare/dashboardbhw");
      } else if (user.role === "mother") {
        history.push("/eNanayCare/dashboardmother");
      } else {
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
            {error}
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
