import {
  IonApp,
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonImg,
  IonAvatar,
  IonFooter,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import { menu, logOut } from 'ionicons/icons';
import './MamaDashboard.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';

const MamaDashboard: React.FC = () => {
  const toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu');
    menu?.classList.toggle('visible');
  };

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    fetchTodayEvents();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/Capstone/';
  };

  const fetchTodayEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("event_date", today);
    if (data) setEvents(data);
  };

  return (
    <IonApp>
      <IonPage>
        <IonHeader className="custom-header">
          <IonToolbar>
            <div className="toolbar-container">
              <div className="brand-section">
                <IonAvatar className="logo-avatar">
                  <IonImg src="https://storage.googleapis.com/a1aa/image/09c537d5-4534-4d63-0985-001c8c4fcbca.jpg" />
                </IonAvatar>
                <IonTitle className="site-title">Maternal Guidance & Awareness</IonTitle>
              </div>
              <nav className="main-nav">
                {['Dashboard', 'Guidance', 'Health Tips', 'Appointments', 'Profile'].map((label) => (
                  <a href="#" key={label}>{label}</a>
                ))}
              </nav>
              <div className="user-info">
                <IonAvatar>
                  <IonImg src="https://storage.googleapis.com/a1aa/image/68b3ae6e-ecd8-4d62-2bca-f14236544b3a.jpg" />
                </IonAvatar>
                <span>Mama Joy</span>
                <IonButton fill="clear" onClick={handleLogout} className="logout-icon">
                  <IonIcon icon={logOut} slot="icon-only" />
                </IonButton>
              </div>
              <IonButton fill="clear" className="mobile-toggle" onClick={toggleMobileMenu}>
                <IonIcon icon={menu} slot="icon-only" />
              </IonButton>
            </div>
            <nav id="mobile-menu" className="mobile-menu">
              {['Dashboard', 'Guidance', 'Health Tips', 'Appointments', 'Profile'].map((item) => (
                <a key={item} href="#">{item}</a>
              ))}
              <div className="mobile-user">
                <IonAvatar>
                  <IonImg src="https://storage.googleapis.com/a1aa/image/68b3ae6e-ecd8-4d62-2bca-f14236544b3a.jpg" />
                </IonAvatar>
                <span>Mama Joy</span>
                <IonButton fill="clear" onClick={handleLogout}>
                  <IonIcon icon={logOut} slot="icon-only" />
                </IonButton>
              </div>
            </nav>
          </IonToolbar>
        </IonHeader>

        <IonContent className="page-content">
          <h2 className="page-heading">Welcome back, Mama Joy!</h2>

          <section className="schedule-section">
            <h3 className="section-title">📅 Today’s Schedule</h3>
            {events.length ? (
              <IonList className="event-list">
                {events.map((ev) => (
                  <IonItem key={ev.id} className="event-item">
                    <IonLabel>
                      <h2>{ev.title}</h2>
                      <p>{ev.description}</p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>
            ) : (
              <p className="no-events">No events today.</p>
            )}

            <div className="button-group">
              <IonButton routerLink="/Capstone/plottedcalendar" expand="block" className="schedule-btn">
                🔍 View Full Calendar
              </IonButton>
              <IonButton routerLink="/Capstone/viewmonitoring" className="schedule-btn">
                📊 View Monitoring
              </IonButton>
            </div>
          </section>

          <IonGrid className="quick-stats">
            {["fas fa-baby","fas fa-heartbeat","fas fa-notes-medical","fas fa-comments"].map((icon, i) => (
              <IonRow key={i} className="stat-box">
                <div className="stat-icon"><i className={icon}></i></div>
                <div>
                  <p className="stat-label">{['Weeks Pregnant', 'Next Appointment', 'Guidance Topics', 'Messages'][i]}</p>
                  <p className="stat-value">{['24', 'May 15, 2024', '8', '3'][i]}</p>
                </div>
              </IonRow>
            ))}
          </IonGrid>

          <section className="guidance-section">
            <h3>Today's Guidance</h3>
            <div className="guidance-cards">
              {["Healthy Eating Tips","Prenatal Exercise","Mental Health Support"].map((title, i) => (
                <IonCard key={i} className="guidance-card">
                  <img src={["https://storage.googleapis.com/a1aa/image/f16a32af-0459-4793-6058-345ae429774c.jpg",
                             "https://storage.googleapis.com/a1aa/image/0e4da023-fc70-4cec-b6bb-e4019b948f55.jpg",
                             "https://storage.googleapis.com/a1aa/image/2e3adc8b-e156-40f6-e43e-c956819bad0f.jpg"][i]} alt={title} />
                  <IonCardHeader>
                    <IonCardTitle>{title}</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{[
                      'Learn about the essential nutrients you need during pregnancy to keep you and your baby healthy.',
                      'Safe exercises to help you stay active and reduce pregnancy discomfort.',
                      'Tips and resources to help you manage stress and maintain emotional well-being.'
                    ][i]}</p>
                    <a href="#" className="read-more">Read More</a>
                  </IonCardContent>
                </IonCard>
              ))}
            </div>
          </section>

          <section className="appointments-section">
            <h3>Upcoming Appointments</h3>
            <div className="appointments-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Doctor</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['May 15, 2024', '10:00 AM', 'City Health Clinic', 'Dr. Maria Santos'],
                    ['June 12, 2024', '2:30 PM', 'Downtown Hospital', 'Dr. John Reyes'],
                    ['July 10, 2024', '9:00 AM', 'Community Health Center', 'Dr. Ana Lopez']
                  ].map(([date, time, location, doctor], i) => (
                    <tr key={i}>
                      <td>{date}</td>
                      <td>{time}</td>
                      <td>{location}</td>
                      <td>{doctor}</td>
                      <td><a href="#">View</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="messages-section">
            <h3>Messages</h3>
            <div className="message-list">
              {["Dr. Maria Santos", "Nurse Patricia", "Maternal Guidance Team"].map((name, i) => (
                <div key={i} className="message-item">
                  <img src={["https://storage.googleapis.com/a1aa/image/b7af70e4-0041-4daa-e285-b21f9f664982.jpg",
                             "https://storage.googleapis.com/a1aa/image/7cf275a9-a29a-4906-1261-420fc851afec.jpg",
                             "https://storage.googleapis.com/a1aa/image/163a3834-89a2-4033-f616-340ca9219486.jpg"][i]} alt={name} />
                  <div>
                    <p className="sender-name">{name}</p>
                    <p>{[
                      'Please remember to take your prenatal vitamins daily. Let me know if you have any questions.',
                      'Your appointment on May 15 is confirmed. Please bring your medical records.',
                      'New health tips have been added to your dashboard. Check them out to stay informed!'
                    ][i]}</p>
                    <p className="message-time">{[
                      'Apr 20, 2024 - 9:15 AM',
                      'Apr 18, 2024 - 3:45 PM',
                      'Apr 17, 2024 - 11:00 AM'
                    ][i]}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </IonContent>

        <IonFooter className="footer">
          <div className="footer-content">© 2024 Maternal Guidance and Awareness. All rights reserved.</div>
        </IonFooter>
      </IonPage>
    </IonApp>
  );
};

export default MamaDashboard;
