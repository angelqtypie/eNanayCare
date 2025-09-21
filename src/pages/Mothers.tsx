import React, { useState } from "react";
import {
  IonButton,
  IonIcon,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
} from "@ionic/react";
import { addOutline, closeOutline } from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./Mother.css";

const Mothers: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [mothers, setMothers] = useState<any[]>([]);

  const [form, setForm] = useState({
    name: "",
    birthday: "",
    address: "",
    contact: "",
    email: "",
    password: "",
    status: "Pregnant",
    dueDate: "",
  });

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registerMother = () => {
    if (!form.name || !form.email) return;
    setMothers((prev) => [...prev, form]);
    setForm({
      name: "",
      birthday: "",
      address: "",
      contact: "",
      email: "",
      password: "",
      status: "Pregnant",
      dueDate: "",
    });
    setShowModal(false);
  };

  return (
    <MainLayout>
      <div className="mothers-page">
        <div className="header-container">
          <h1 className="page-title">Mothers Management</h1>
          <IonButton className="add-btn" onClick={() => setShowModal(true)}>
            <IonIcon icon={addOutline} slot="start" />
            Register Mother
          </IonButton>
        </div>

        {/* CONTENT */}
        <div className="mothers-layout">
          {mothers.length === 0 ? (
            <p className="empty-text">No mothers registered yet.</p>
          ) : (
            <div className="table-wrapper">
              <table className="mothers-table desktop-only">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Contact</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mothers.map((m, i) => (
                    <tr key={i}>
                      <td>{m.name}</td>
                      <td>{m.email}</td>
                      <td>{m.contact}</td>
                      <td>{m.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="mobile-only mothers-cards">
                {mothers.map((m, i) => (
                  <div key={i} className="mother-card">
                    <p><strong>{m.name}</strong></p>
                    <p>{m.email}</p>
                    <p>{m.contact}</p>
                    <span className="status">{m.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* MODAL */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="mother-modal"
        >
          <div className="modal-container">
            <div className="modal-header">
              <h2>Register Mother</h2>
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-body">
              <IonList className="form-list">
                <IonItem>
                  <IonLabel position="stacked">Full Name</IonLabel>
                  <IonInput
                    name="name"
                    value={form.name}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Birthday</IonLabel>
                  <IonInput
                    type="date"
                    name="birthday"
                    value={form.birthday}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Address</IonLabel>
                  <IonInput
                    name="address"
                    value={form.address}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Contact Number</IonLabel>
                  <IonInput
                    type="tel"
                    name="contact"
                    value={form.contact}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Email</IonLabel>
                  <IonInput
                    type="email"
                    name="email"
                    value={form.email}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Password</IonLabel>
                  <IonInput
                    type="password"
                    name="password"
                    value={form.password}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Expected Due Date</IonLabel>
                  <IonInput
                    type="date"
                    name="dueDate"
                    value={form.dueDate}
                    onIonChange={handleInputChange}
                  />
                </IonItem>
              </IonList>
            </div>

            <div className="modal-footer">
              <IonButton expand="block" onClick={registerMother}>
                Save
              </IonButton>
            </div>
          </div>
        </IonModal>
      </div>
    </MainLayout>
  );
};

export default Mothers;
