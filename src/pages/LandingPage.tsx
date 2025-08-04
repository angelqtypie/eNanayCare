import {
  IonApp,
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonIcon,
  IonImg,
  IonAvatar,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonInput,
  IonTextarea
} from "@ionic/react";

import { menu } from "ionicons/icons";

import "./LandingPage.css";

const LandingPage: React.FC = () => {
  const toggleMenu = () => {
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenu?.classList.toggle("hidden");
  };

  
  const sections = ["About", "Services", "Resources", "News", "Contact"];

  return (
    <IonApp>
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <div className="landing-nav">
              <div className="nav-brand">
                <IonAvatar>
                  <IonImg src="https://storage.googleapis.com/a1aa/image/b0e1c785-fba5-43c9-9f4d-bbb857120f83.jpg" />
                </IonAvatar>
                <IonTitle className="nav-title">BHWS</IonTitle>
              </div>
              <nav className="desktop-menu">
                {sections.map((label) => (
                  <a key={label} href={`#${label.toLowerCase()}`}>{label}</a>
                ))}
              </nav>
              <IonButton fill="clear" className="mobile-btn" onClick={toggleMenu}>
                <IonIcon icon={menu} />
              </IonButton>
            </div>
            <div id="mobile-menu" className="hidden mobile-menu">
              {sections.map((label) => (
                <a key={label} href={`#${label.toLowerCase()}`}>{label}</a>
              ))}
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent>
          <section className="hero-section">
            <div className="hero-grid">
              <div className="hero-text">
                <h1>Better Health for Women and Children</h1>
                <p>BHWS is dedicated to improving maternal health through education, support, and quality care.</p>
            <IonButton color="light" routerLink="/Capstone/login">Click here to Login & Register</IonButton>
              </div>
              <div className="hero-img">
                <img src="https://storage.googleapis.com/a1aa/image/d0b6f8ba-8258-426c-760c-75fb8988deab.jpg" alt="Mother and child" />
              </div>
            </div>
          </section>

          <section className="about-section" id="about">
            <h2>About BHWS</h2>
            <p>BHWS is a community-driven organization enhancing maternal health through services, education, and advocacy.</p>
            <IonGrid>
              <IonRow>
                {[
                  { title: "Prenatal Care", desc: "Healthy pregnancy guidance.", img: "https://storage.googleapis.com/a1aa/image/c1c4dd36-578a-4080-031c-0abe4c5e54cb.jpg" },
                  { title: "Nutrition Support", desc: "Custom nutrition plans.", img: "https://storage.googleapis.com/a1aa/image/3ef130b0-abeb-4db0-ea7b-6d93c5636783.jpg" },
                  { title: "Postnatal Care", desc: "Support during postpartum.", img: "https://storage.googleapis.com/a1aa/image/87b78c2f-84bc-4710-c58b-c7347a1fcecb.jpg" }
                ].map((item, i) => (
                  <IonCol size="12" sizeMd="4" key={i}>
                    <IonCard>
                      <img src={item.img} alt={item.title} />
                      <IonCardHeader>
                        <IonCardTitle>{item.title}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>{item.desc}</IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>

          <section className="services-section" id="services">
            <h2>Our Services</h2>
            <IonGrid>
              <IonRow>
                {[
                  { title: "Maternal Health Consultations", desc: "Expert support for your pregnancy.", img: "https://storage.googleapis.com/a1aa/image/6e7f48ef-cfb1-4a6e-e9d8-335d81555305.jpg" },
                  { title: "Childbirth Preparation Classes", desc: "Classes to prepare mothers for delivery.", img: "https://storage.googleapis.com/a1aa/image/bbe74762-920c-4753-4d9d-3c4c7b19b71b.jpg" },
                  { title: "Breastfeeding Support", desc: "Guidance for new moms.", img: "https://storage.googleapis.com/a1aa/image/1e32e697-a16f-4fe3-ff90-a85284395063.jpg" }
                ].map((item, i) => (
                  <IonCol size="12" sizeMd="4" key={i}>
                    <IonCard>
                      <img src={item.img} alt={item.title} />
                      <IonCardHeader>
                        <IonCardTitle>{item.title}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>{item.desc}</IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>

          <section className="resources-section" id="resources">
            <h2>Resources</h2>
            <IonGrid>
              <IonRow>
                {["Educational Articles", "Downloadable Guides", "Video Tutorials"].map((title, i) => (
                  <IonCol size="12" sizeMd="4" key={i}>
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>{title}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <ul>
                          {[...Array(5).keys()].map((_, j) => (
                            <li key={j}><a href="#">Sample Resource {j + 1}</a></li>
                          ))}
                        </ul>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>

          <section className="news-section" id="news">
            <h2>Latest News</h2>
            <IonGrid>
              <IonRow>
                {[
                  { title: "BHWS Hosts Annual Conference", date: "May 10, 2024", img: "https://storage.googleapis.com/a1aa/image/d468206a-7cd2-406c-7c13-056e2759a7fa.jpg" },
                  { title: "New Prenatal Care Program", date: "April 22, 2024", img: "https://storage.googleapis.com/a1aa/image/8d3fbca9-cc0c-4282-81e7-bf0fcdda5028.jpg" },
                  { title: "Breastfeeding Campaign Success", date: "March 15, 2024", img: "https://storage.googleapis.com/a1aa/image/35e33dc6-5f8c-4840-e637-6fbe6749f08a.jpg" }
                ].map((item, i) => (
                  <IonCol size="12" sizeMd="4" key={i}>
                    <IonCard>
                      <img src={item.img} alt={item.title} />
                      <IonCardHeader>
                        <IonCardTitle>{item.title}</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>{item.date}</IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </section>

          <section className="contact-section" id="contact">
            <h2>Contact Us</h2>
            <form className="contact-form">
              <IonInput placeholder="Full Name" required />
              <IonInput type="email" placeholder="Email Address" required />
              <IonTextarea placeholder="Your message..." rows={5} required />
              <IonButton expand="block" type="submit">Send Message</IonButton>
            </form>
            <div className="contact-info">
              <p><i className="fas fa-phone-alt"></i> +1 (555) 123-4567</p>
              <p><i className="fas fa-envelope"></i> contact@bhws.org</p>
              <p><i className="fas fa-map-marker-alt"></i> 123 Health St, Wellness City</p>
            </div>
          </section>

          <footer className="footer">
            <p>© 2024 BHWS. All rights reserved.</p>
            <div className="social-links">
              {["facebook-f", "twitter", "instagram", "linkedin-in"].map((icon, i) => (
                <a key={i} href="#"><i className={`fab fa-${icon}`}></i></a>
              ))}
            </div>
          </footer>
        </IonContent>
      </IonPage>
    </IonApp>
  );
};

export default LandingPage;
