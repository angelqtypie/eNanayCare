// src/pages/LandingPage.tsx
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
  IonMenu,
  IonList,
  IonMenuToggle,
  IonItem,
  IonLabel,
  IonMenuButton,
} from "@ionic/react";
import {
  notificationsOutline,
  documentTextOutline,
  chatbubbleEllipsesOutline,
  heartOutline,
  logInOutline,
  menuOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/logo.svg";
import motherImg from "../assets/mother-care.jpg";

const Landing: React.FC = () => {
  const history = useHistory();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* Side Menu for Mobile */}
      <IonMenu contentId="main-content" side="end">
        <IonContent>
          <IonList>
            {["about", "features"].map((section, idx) => (
              <IonMenuToggle key={idx} autoHide={false}>
                <IonItem button onClick={() => scrollToSection(section)}>
                  <IonLabel className="capitalize">{section}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            ))}
            <IonMenuToggle autoHide={false}>
              <IonItem button onClick={() => history.push("/login")}>
                <IonLabel>Login</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>

      <IonPage id="main-content">
        {/* Header */}
        <IonHeader className="glass-header shadow-sm">
          <IonToolbar>
            <div className="header-container">
              <div className="header-left">
                <img src={logo} alt="eNanayCare logo" className="logo-img" />
                <IonTitle className="app-name">eNanayCare</IonTitle>
              </div>

              <nav className="header-right">
                <button onClick={() => scrollToSection("about")}>About</button>
                <button onClick={() => scrollToSection("features")}>
                  Features
                </button>
              </nav>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          {/* Hero */}
          <section className="hero">
            <div className="hero-overlay">
              <div className="hero-content animate-fade-in">
                <h1>Maternal Health Guidance & Awareness</h1>
                <p>
                  Empowering mothers and Barangay Health Workers with safe,
                  accessible, digital care tools.
                </p>
                <IonButton
                  color="secondary"
                  size="large"
                  className="cta-btn pulse"
                  onClick={() => history.push("/login")}
                >
                  Get Started
                </IonButton>
              </div>
            </div>
          </section>

          {/* About */}
          <section id="about" className="about ion-padding">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="12" sizeMd="6">
                  <img src={motherImg} alt="Mother care" className="about-img" />
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <h2>About eNanayCare</h2>
                  <p>
                    Many rural mothers miss essential checkups. eNanayCare
                    bridges this gap with reminders, digital health records, and
                    education—bringing care closer to home.
                  </p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>

          {/* Features */}
          <section id="features" className="features ion-padding">
            <h2 className="section-title">Our Core Features</h2>
            <IonGrid>
              <IonRow>
                {[
                  {
                    icon: notificationsOutline,
                    title: "Reminders",
                    text: "Automated alerts for checkups & maternal activities.",
                  },
                  {
                    icon: documentTextOutline,
                    title: "Digital Booklet",
                    text: "Secure, accessible pregnancy health records.",
                  },
                  {
                    icon: chatbubbleEllipsesOutline,
                    title: "FAQs Chatbot",
                    text: "Instant answers to common questions.",
                  },
                  {
                    icon: heartOutline,
                    title: "DOH Guidelines",
                    text: "Built-in maternal care standards.",
                  },
                ].map((feature, index) => (
                  <IonCol size="12" sizeMd="6" sizeLg="3" key={index}>
                    <IonCard className="feature-card hover-pop glass-card">
                      <IonCardHeader>
                        <IonIcon icon={feature.icon} size="large" />
                        <IonCardTitle>{feature.title}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>{feature.text}</IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>
        </IonContent>

        {/* Footer */}
        <IonFooter>
          <IonToolbar>
            <div className="footer-container">
              <p className="footer-text">
                © 2025 eNanayCare | Capstone Project by NBSC Students
              </p>
              <p className="footer-links">
                <IonButton fill="clear" routerLink="/login">
                  BHW Login
                </IonButton>
                |
                <IonButton fill="clear" routerLink="/login">
                  Admin Login
                </IonButton>
              </p>
            </div>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default Landing;
