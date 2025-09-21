import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { addOutline, closeOutline, calendarOutline } from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./adminappointments.css";

const Appointments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Mock mothers list (later pwede nato i-link sa Mothers page or backend)
  const mothers = [
    { id: 1, name: "Maria Santos" },
    { id: 2, name: "Ana Cruz" },
    { id: 3, name: "Josefina Dela Rosa" },
  ];

  const [form, setForm] = useState({
    motherName: "",
    date: "",
    time: "",
    notes: "",
  });

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const addAppointment = () => {
    if (!form.motherName || !form.date || !form.time) return;
    setAppointments((prev) => [...prev, form]);
    setForm({ motherName: "", date: "", time: "", notes: "" });
    setShowModal(false);
  };

  return (
    <MainLayout>
      <IonPage className="appointments-page">
        {/* HEADER */}
        <IonHeader className="appointments-header">
          <IonToolbar>
            <div className="header-container">
              <h1 className="page-title">
                <IonIcon icon={calendarOutline} /> Appointments
              </h1>
              <IonButton className="add-btn" onClick={() => setShowModal(true)}>
                <IonIcon icon={addOutline} slot="start" />
                New Appointment
              </IonButton>
            </div>
          </IonToolbar>
        </IonHeader>

        {/* CONTENT */}
        <IonContent className="appointments-content">
          <div className="appointments-layout">
            {appointments.length === 0 ? (
              <p className="empty-text">No appointments scheduled yet.</p>
            ) : (
              <div className="table-wrapper">
                {/* Desktop Table */}
                <table className="appointments-table desktop-only">
                  <thead>
                    <tr>
                      <th>Mother</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((a, i) => (
                      <tr key={i}>
                        <td>{a.motherName}</td>
                        <td>{a.date}</td>
                        <td>{a.time}</td>
                        <td>{a.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Mobile Cards */}
                <div className="mobile-only appointments-cards">
                  {appointments.map((a, i) => (
                    <div key={i} className="appointment-card">
                      <p><strong>{a.motherName}</strong></p>
                      <p>{a.date} at {a.time}</p>
                      <p>{a.notes}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </IonContent>

        {/* MODAL FORM */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="appointment-modal"
        >
          <div className="modal-container">
            {/* HEADER */}
            <div className="modal-header">
              <h2>New Appointment</h2>
              <IonButton
                fill="clear"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            {/* BODY */}
            <div className="modal-body">
              <IonList className="form-list">
                {/* Mother Dropdown */}
                <IonItem>
                  <IonLabel position="stacked">Select Mother</IonLabel>
                  <IonSelect
                    name="motherName"
                    value={form.motherName}
                    onIonChange={(e) => handleChange("motherName", e.detail.value)}
                  >
                    {mothers.map((m) => (
                      <IonSelectOption key={m.id} value={m.name}>
                        {m.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Date</IonLabel>
                  <IonInput
                    type="date"
                    value={form.date}
                    onIonChange={(e) => handleChange("date", e.detail.value!)}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Time</IonLabel>
                  <IonInput
                    type="time"
                    value={form.time}
                    onIonChange={(e) => handleChange("time", e.detail.value!)}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Notes</IonLabel>
                  <IonInput
                    value={form.notes}
                    onIonChange={(e) => handleChange("notes", e.detail.value!)}
                  />
                </IonItem>
              </IonList>
            </div>

            {/* FOOTER */}
            <div className="modal-footer">
              <IonButton expand="block" onClick={addAppointment}>
                Save
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonPage>
    </MainLayout>
  );
};

export default Appointments;
