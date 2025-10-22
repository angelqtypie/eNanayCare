import React from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
  IonFooter,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import "./LandingPage.css";
import logo from "../assets/logo.png";
import motherImg from "../assets/mother-care.jpg";
import member1 from "../assets/member1.jpg";
import member2 from "../assets/member2.jpg";
import member3 from "../assets/member3.jpg";

const LandingPage: React.FC = () => {
  const history = useHistory();

  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <IonPage>
      {/* Sticky Header */}
      <IonHeader className="sticky-header">
        <IonToolbar>
          <div className="header-container">
            <div className="header-left">
              <img src={logo} alt="eNanayCare Logo" className="logo" />
              <IonTitle className="app-title">eNanayCare</IonTitle>
            </div>
            <div className="nav-buttons">
              <button onClick={() => scrollToSection("about")}>About</button>
              <button onClick={() => scrollToSection("features")}>Features</button>
              <button onClick={() => scrollToSection("mission")}>Mission</button>
              <button onClick={() => scrollToSection("team")}>Team</button>
              <button onClick={() => scrollToSection("contact")}>Contact</button>
              <IonButton
                className="login-btn"
                fill="outline"
                color="primary"
                onClick={() => history.push("/login")}
              >
                Login
              </IonButton>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      {/* Scrollable Content */}
      <IonContent fullscreen>
        <section className="hero-section">
          <div className="hero-overlay">
            <div className="hero-content animate-fadein">
              <h1>Empowering Maternal Care Through Technology</h1>
              <p>
                eNanayCare bridges mothers and Barangay Health Workers through
                technology — ensuring safer pregnancies, timely checkups, and
                accessible health information.
              </p>
              <IonButton
                className="btn-get-started"
                onClick={() => scrollToSection("about")}
              >
                Learn More
              </IonButton>
            </div>
          </div>
        </section>

        <section id="about" className="section about-section animate-up">
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <img src={motherImg} alt="Maternal care" className="about-image" />
              </IonCol>
              <IonCol size="12" sizeMd="6" className="about-text">
                <h2>About eNanayCare</h2>
                <p>
                  The eNanayCare web application is designed to promote digital
                  maternal health awareness, record management, and efficient
                  communication between mothers and health workers. It helps
                  communities track maternal milestones and supports early
                  interventions.
                </p>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        <section id="features" className="section features-section animate-up">
          <h2>Key Features</h2>
          <IonGrid>
            <IonRow>
              {[
                {
                  title: "Reminders",
                  desc: "Automated alerts for prenatal checkups and vitamins.",
                },
                {
                  title: "Digital Records",
                  desc: "Secure and easily accessible maternal data.",
                },
                {
                  title: "Education",
                  desc: "DOH-approved learning materials for mothers.",
                },
                {
                  title: "Chatbot",
                  desc: "Quick answers to common maternal questions.",
                },
              ].map((feature, i) => (
                <IonCol size="12" sizeMd="6" sizeLg="3" key={i}>
                  <div className="feature-card animate-fadein">
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </section>

        <section id="mission" className="section mission-section animate-up">
          <h2>Our Mission</h2>
          <p>
            To empower every mother through accessible digital healthcare,
            supporting safer motherhood and stronger communities with the help
            of Barangay Health Workers.
          </p>
        </section>

        <section id="team" className="section team-section animate-up">
          <h2>Meet the Team</h2>
          <IonGrid>
            <IonRow>
              {[
                {
                  name: "Evarine B. Rayon",
                  role: "Project Leader/Analyst",
                  img: member1,
                  fb: "https://www.facebook.com/evarinerayon",
                  ig: "https://instagram.com/",
                },
                {
                  name: "Angel Justine Ballaso.",
                  role: "Programmer",
                  img: member2,
                  fb: "https://www.facebook.com/eyn.gylii/",
                  ig: "https://instagram.com/",
                },
                {
                  name: "Keyna C. Gogo",
                  role: "Documenter/Lead Analyst",
                  img: member3,
                  fb: "https://www.facebook.com/keyna.gogo",
                  ig: "https://instagram.com/",
                },
              ].map((member, i) => (
                <IonCol size="12" sizeMd="4" key={i}>
                  <div className="team-card animate-fadein">
                    <img src={member.img} alt={member.name} className="team-img" />
                    <h3>{member.name}</h3>
                    <p>{member.role}</p>
                    <div className="team-socials">
                      <a href={member.fb} target="_blank" rel="noreferrer">
                        <i className="fab fa-facebook-f"></i>
                      </a>
                      <a href={member.ig} target="_blank" rel="noreferrer">
                        <i className="fab fa-instagram"></i>
                      </a>
                    </div>
                  </div>
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </section>

        <section id="contact" className="section contact-section animate-up">
          <h2>Contact Us</h2>
          <p>
            For inquiries, reach us at{" "}
            <b>brgtrio.enanaycare@gmail.com</b>
          </p>
        </section>
      </IonContent>

      <IonFooter className="sticky-footer">
        <IonToolbar>
          <div className="footer">
            <p>© 2025 eNanayCare | Developed by BRG Trio</p>
          </div>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default LandingPage;
