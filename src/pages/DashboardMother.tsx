import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonButtons,
  IonButton
} from '@ionic/react';
import React from 'react'
import { useState } from 'react';
import './PregnantBooklet.css'; // Optional custom styles

const PregnancyBooklet: React.FC = () => {
  const [showPDF, setShowPDF] = useState(false);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle> Pregnancy Booklet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Welcome, <strong>Maria Dela Cruz</strong></h2>

        {/* Section 1: Appointments */}
        <section>
          <h3> Upcoming Appointments</h3>
          <IonCard><IonCardContent> Oct 10, 2025 – 10:00 AM – Prenatal Check-up  Confirmed</IonCardContent></IonCard>
          <IonCard><IonCardContent> Oct 20, 2025 – 9:00 AM – Ultrasound  Reminder Set</IonCardContent></IonCard>
          <IonCard><IonCardContent> Nov 5, 2025 – 1:00 PM – Nutrition Counseling  Pending</IonCardContent></IonCard>
        </section>

        {/* Section 2: Health Records */}
        <section style={{ marginTop: '30px' }}>
          <h3>📓 Pregnancy Health Records</h3>
          <IonGrid>
            <IonRow className="table-header">
              <IonCol size="1">#</IonCol>
              <IonCol>Date</IonCol>
              <IonCol>BP</IonCol>
              <IonCol>Weight</IonCol>
              <IonCol>Fundal Height</IonCol>
              <IonCol>Notes</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>1</IonCol>
              <IonCol>Sept 5</IonCol>
              <IonCol>110/70</IonCol>
              <IonCol>56kg</IonCol>
              <IonCol>20 cm</IonCol>
              <IonCol>Normal progress</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>2</IonCol>
              <IonCol>Oct 10</IonCol>
              <IonCol>115/75</IonCol>
              <IonCol>58kg</IonCol>
              <IonCol>23 cm</IonCol>
              <IonCol>Advised iron supplements</IonCol>
            </IonRow>
          </IonGrid>
        </section>

        {/* Section 3: Educational Materials */}
        <section style={{ marginTop: '30px' }}>
          <h3>📚 Maternal Health Educational Materials</h3>
          <IonList>
            <IonItem button onClick={() => setShowPDF(true)}>
              <IonLabel>📄 Nutrition Guide for 2nd Trimester</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>📄 10 Danger Signs During Pregnancy</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>📄 DOH Maternal Care Handbook 2024</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>📄 Iron-Rich Meal Plan</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel>📄 How to Prepare for Delivery (Checklist)</IonLabel>
            </IonItem>
          </IonList>
        </section>

        {/* Section 4: Milestones */}
        <section style={{ marginTop: '30px' }}>
          <h3>🍼 Pregnancy Milestones Tracker</h3>
          <IonList>
            <IonItem><IonLabel>✅ First heartbeat detected – 8 weeks</IonLabel></IonItem>
            <IonItem><IonLabel>✅ First ultrasound completed – 12 weeks</IonLabel></IonItem>
            <IonItem><IonLabel>🔜 Gender reveal scheduled – 20 weeks</IonLabel></IonItem>
            <IonItem><IonLabel>🔜 Third-trimester checkup – 28 weeks</IonLabel></IonItem>
          </IonList>
        </section>

        {/* Section 5: Nutrition Log */}
        <section style={{ marginTop: '30px' }}>
          <h3>🥗 Nutrition Log</h3>
          <IonList>
            <IonItem>
              <IonLabel><strong>Oct 1:</strong> Ate iron-rich breakfast (eggs, spinach)</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><strong>Oct 2:</strong> Missed taking prenatal vitamins</IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel><strong>Oct 3:</strong> High protein lunch (chicken + rice)</IonLabel>
            </IonItem>
          </IonList>
        </section>

        {/* Section 6: Doctor's Notes */}
        <section style={{ marginTop: '30px' }}>
          <h3>🩺 Doctor’s Notes</h3>
          <IonCard>
            <IonCardContent>
              <p><strong>Note from Dr. Reyes (Oct 10):</strong></p>
              <p>Patient is doing well. Advised to continue iron supplements and track fetal movement regularly. Next appointment will include glucose screening.</p>
            </IonCardContent>
          </IonCard>
        </section>

        {/* Section 7: Immunization Tracker */}
        <section style={{ marginTop: '30px' }}>
          <h3>💉 Immunization Tracker</h3>
          <IonGrid>
            <IonRow className="table-header">
              <IonCol>Vaccine</IonCol>
              <IonCol>Date</IonCol>
              <IonCol>Status</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>Tetanus Toxoid (TT1)</IonCol>
              <IonCol>Sept 12, 2025</IonCol>
              <IonCol>✅ Completed</IonCol>
            </IonRow>
            <IonRow>
              <IonCol>Tetanus Toxoid (TT2)</IonCol>
              <IonCol>Oct 15, 2025</IonCol>
              <IonCol>⏳ Scheduled</IonCol>
            </IonRow>
          </IonGrid>
        </section>

        {/* Footer */}
        <div style={{ textAlign: 'center', margin: '50px 0', color: '#777' }}>
          <small>Barangay Alae Maternal Care System – Pregnancy Booklet © 2025</small>
        </div>

        {/* Modal for PDF preview */}
        <IonModal isOpen={showPDF} onDidDismiss={() => setShowPDF(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>📄 Nutrition Guide</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowPDF(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <iframe
              src="https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
              title="Nutrition Guide PDF"
              width="100%"
              height="100%"
              style={{ border: 'none', height: '100vh' }}
            ></iframe>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default PregnancyBooklet;
