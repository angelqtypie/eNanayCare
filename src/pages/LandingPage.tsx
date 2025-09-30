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
  logOutOutline,
} from "ionicons/icons";
import { useHistory } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/logo.svg";
import motherImg from "../assets/mother-care.jpg";

const Landing: React.FC = () => {
  const history = useHistory();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ===== Side Menu (Mobile View) ===== */}
      <IonMenu contentId="main-content" side="end">
        <IonContent>
          <IonList>
            <IonMenuToggle autoHide={false}>
              <IonItem button onClick={() => scrollToSection("about")}>
                <IonLabel>About</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle autoHide={false}>
              <IonItem button onClick={() => scrollToSection("features")}>
                <IonLabel>Features</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle autoHide={false}>
              <IonItem button onClick={() => scrollToSection("login")}>
                <IonLabel>Login</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle autoHide={false}>
              <IonItem
                button
                onClick={() => history.push("/Capstone/landingpage")}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                <IonLabel>Logout</IonLabel>
              </IonItem>
            </IonMenuToggle>
          </IonList>
        </IonContent>
      </IonMenu>

      {/* ===== Main Page ===== */}
      <IonPage id="main-content">
        {/* Header */}
        <IonHeader className="glass-header">
          <IonToolbar>
            <div className="header-container">
              {/* Left side: logo */}
              <div className="header-left">
                <img src={logo} alt="eNanayCare logo" className="logo-img" />
                <IonTitle className="app-name">eNanayCare</IonTitle>
              </div>

              {/* Right side: nav */}
              <nav className="header-right">
                <button onClick={() => scrollToSection("about")}>About</button>
                <button onClick={() => scrollToSection("features")}>
                  Features
                </button>
                <button onClick={() => scrollToSection("login")}>Login</button>
                {/* ✅ Menu Toggle for mobile */}
                <IonMenuButton className="menu-btn" autoHide={false}>
                  <IonIcon icon={menuOutline} size="large" />
                </IonMenuButton>
              </nav>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent fullscreen>
          {/* Hero Section */}
          <section className="hero">
            <div className="hero-overlay">
              <div className="hero-content animate-fade-in">
                <h1>Maternal Health Guidance & Awareness</h1>
                <p>
                  Digital tools to empower mothers and Barangay Health Workers
                  with safe, accessible care.
                </p>
                <IonButton
                  color="secondary"
                  size="large"
                  className="cta-btn pulse"
                  onClick={() => scrollToSection("login")}
                >
                  Get Started
                </IonButton>
              </div>
            </div>
          </section>

          {/* About Section */}
          <section id="about" className="about ion-padding">
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="12" sizeMd="6">
                  <img src={motherImg} alt="Mother care" className="about-img" />
                </IonCol>
                <IonCol size="12" sizeMd="6">
                  <h2>About eNanayCare</h2>
                  <p>
                    Mothers in rural areas often miss crucial checkups.
                    eNanayCare bridges this gap with reminders, digital records,
                    and educational resources — ensuring a safer and healthier
                    pregnancy journey.
                  </p>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>

          {/* Features Section */}
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
                    <IonCard className="feature-card glass-card hover-pop">
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

          {/* Login Section */}
          <section id="login" className="login-section ion-padding">
            <h2 className="section-title">Login Access</h2>
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="6">
                  <IonCard className="login-card mother-card hover-pop">
                    <IonCardHeader>
                      <IonCardTitle>Mother Login</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>
                        Manage appointments, wellness logs, and personalized
                        tips.
                      </p>
                      <IonButton
                        expand="block"
                        color="primary"
                        onClick={() => history.push("/eNanayCare/login")}
                      >
                        <IonIcon icon={logInOutline} slot="start" />
                        Login as Mother
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>

                <IonCol size="12" sizeMd="6">
                  <IonCard className="login-card bhw-card hover-pop">
                    <IonCardHeader>
                      <IonCardTitle>BHW Admin Login</IonCardTitle>
                    </IonCardHeader>
                    <IonCardContent>
                      <p>
                        Monitor records, track high-risk cases, and support
                        communities.
                      </p>
                      <IonButton
                        expand="block"
                        color="secondary"
                        onClick={() => history.push("/eNanayCare/dashboardbhw")}
                      >
                        <IonIcon icon={logInOutline} slot="start" />
                        Login as BHW Admin
                      </IonButton>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>

          {/* CTA Section */}
          <section className="cta ion-padding">
            <h2>Empowering Mothers. Supporting Communities.</h2>
            <IonButton expand="block" color="primary" size="large">
              Learn More
            </IonButton>
          </section>
        </IonContent>

        {/* Footer */}
        <IonFooter>
          <IonToolbar>
            <p className="footer-text">
              © 2025 eNanayCare | Capstone Project by NBSC Students
            </p>
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </>
  );
};

export default Landing;
