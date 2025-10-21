import React from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
  IonIcon,
} from "@ionic/react";
import {
  notificationsOutline,
  documentTextOutline,
  chatbubbleEllipsesOutline,
  heartOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import motherImg from "../assets/mother-care.jpg";

const Landing: React.FC = () => {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader className="header">
        <IonToolbar>
          <div className="header-container">
            <img src={logo} alt="eNanayCare Logo" className="logo" />
            <IonTitle className="app-title">eNanayCare</IonTitle>
            <nav className="nav-links">
              <button onClick={() => history.push("/login")}>Login</button>
            </nav>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content">
              <h1>Maternal Health Guidance & Awareness</h1>
              <p>
                Empowering mothers and Barangay Health Workers with safe,
                accessible, digital care tools.
              </p>
              <IonButton
                className="btn-get-started"
                onClick={() => history.push("/login")}
              >
                Get Started
              </IonButton>
            </div>
          </div>
        </section>

        <section className="about-section">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <img
                  src={motherImg}
                  alt="Maternal care"
                  className="about-image"
                />
              </IonCol>
              <IonCol size="12" sizeMd="6" className="about-text">
                <h2>About eNanayCare</h2>
                <p>
                  Many rural mothers miss essential checkups. eNanayCare bridges
                  this gap with reminders, digital health records, and education
                  — bringing care closer to home.
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <section className="features-section">
          <h2>Our Core Features</h2>
          <IonGrid>
            <IonRow>
              {[
                {
                  icon: notificationsOutline,
                  title: "Reminders",
                  description:
                    "Automated alerts for checkups & maternal activities.",
                },
                {
                  icon: documentTextOutline,
                  title: "Digital Booklet",
                  description: "Secure, accessible pregnancy health records.",
                },
                {
                  icon: chatbubbleEllipsesOutline,
                  title: "FAQs Chatbot",
                  description: "Instant answers to common questions.",
                },
                {
                  icon: heartOutline,
                  title: "DOH Guidelines",
                  description: "Built-in maternal care standards.",
                },
              ].map(({ icon, title, description }, i) => (
                <IonCol size="12" sizeMd="6" sizeLg="3" key={i}>
                  <IonCard className="feature-card">
                    <IonCardHeader>
                      <IonIcon icon={icon} className="feature-icon" />
                      <IonCardTitle>{title}</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>{description}</IonCardContent>
                  </IonCard>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </section>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <div className="footer">
            <p>© 2025 eNanayCare | by BRG Trio</p>
            <p>
              <button onClick={() => history.push("/login")} className="footer-btn">
                BHW Login
              </button>{" "}
              |{" "}
              <button onClick={() => history.push("/login")} className="footer-btn">
                Admin Login
              </button>
            </p>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Landing;
