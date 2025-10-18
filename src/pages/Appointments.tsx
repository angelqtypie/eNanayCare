import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonContent,
  IonButton,
  IonIcon,
  IonModal,
  IonItem,
  IonLabel,
  IonList,
  IonSelect,
  IonSelectOption,
  IonInput,
} from "@ionic/react";
import { closeOutline, medicalOutline } from "ionicons/icons";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";

const Appointments: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [visitModal, setVisitModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [calendarDate, setCalendarDate] = useState<Date | null>(new Date());

  const [form, setForm] = useState({
    motherIds: [] as string[],
    date: "",
    time: "",
    location: "",
    notes: "",
  });

  const [visitForm, setVisitForm] = useState({
    bloodPressure: "",
    weight: "",
    remarks: "",
  });

  const handleChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleVisitChange = (name: string, value: string) => {
    setVisitForm((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("mother_id, first_name, last_name")
      .order("last_name", { ascending: true });

    if (error) console.error(error);
    setMothers(data || []);
  };

  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from("appointments")
      .select(`
        id, date, time, location, notes, status,
        mother:mothers(first_name, last_name, mother_id)
      `)
      .order("date", { ascending: true });

    if (error) console.error(error);
    setAppointments(data || []);
  };

  const addAppointment = async () => {
    if (
      form.motherIds.length === 0 ||
      !form.date ||
      !form.time ||
      !form.location
    ) {
      alert("Please fill all required fields.");
      return;
    }

    const { error } = await supabase.from("appointments").insert(
      form.motherIds.map((motherId) => ({
        mother_id: motherId,
        date: form.date,
        time: form.time,
        location: form.location,
        notes: form.notes,
        status: "Scheduled",
      }))
    );

    if (error) console.error(error);
    else {
      setShowModal(false);
      setForm({ motherIds: [], date: "", time: "", location: "", notes: "" });
      fetchAppointments();
    }
  };

  const openVisitModal = (appointment: any) => {
    setSelectedAppointment(appointment);
    setVisitModal(true);
  };

  const saveVisitRecord = async () => {
    if (!selectedAppointment) return;

    const visit_date = selectedAppointment.date;

    const { error: visitError } = await supabase.from("visit_records").insert([
      {
        appointment_id: selectedAppointment.id,
        mother_id: selectedAppointment.mother?.mother_id,
        visit_date,
        bp: visitForm.bloodPressure,
        weight: visitForm.weight,
        remarks: visitForm.remarks,
      },
    ]);

    if (visitError) {
      console.error(visitError);
      alert("Error saving visit record.");
      return;
    }

    const { error: healthError } = await supabase.from("health_records").insert([
      {
        mother_id: selectedAppointment.mother?.mother_id,
        encounter_date: visit_date,
        weight: visitForm.weight,
        bp: visitForm.bloodPressure,
        notes: visitForm.remarks,
      },
    ]);

    if (healthError) {
      console.error(healthError);
      alert("Error saving health record.");
      return;
    }

    alert("Visit and health record saved successfully!");
    setVisitForm({ bloodPressure: "", weight: "", remarks: "" });
    setVisitModal(false);
  };

  useEffect(() => {
    fetchMothers();
    fetchAppointments();
  }, []);

  const filtered = appointments.filter(
    (a) =>
      new Date(a.date).toDateString() ===
      (calendarDate as Date).toDateString()
  );

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar>
          <h2 className="page-title">Appointments</h2>
        </IonToolbar>
      </IonHeader>

      <IonContent className="appointments-content">
        <div className="appointments-layout">
          <div className="calendar-section">
            <Calendar
              value={calendarDate}
              onClickDay={(date) => {
                setCalendarDate(date);
                setForm((prev) => ({ ...prev, date: formatDate(date) }));
              }}
              tileContent={({ date }) => {
                const has = appointments.some(
                  (a) =>
                    new Date(a.date).toDateString() === date.toDateString()
                );
                return has ? <div className="dot"></div> : null;
              }}
            />
            <IonButton
              expand="block"
              className="add-btn"
              onClick={() => setShowModal(true)}
            >
              + New Appointment
            </IonButton>
          </div>

          <div className="table-wrapper">
            {filtered.length === 0 ? (
              <p className="empty-text">No appointments today.</p>
            ) : (
              <table className="appointments-table">
                <thead>
                  <tr>
                    <th>Mother</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Location</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a) => (
                    <tr key={a.id}>
                      <td>
                        {a.mother
                          ? `${a.mother.first_name} ${a.mother.last_name}`
                          : "N/A"}
                      </td>
                      <td>{a.date}</td>
                      <td>{a.time}</td>
                      <td>{a.location}</td>
                      <td>{a.status}</td>
                      <td>
                        <IonButton
                          color="success"
                          size="small"
                          onClick={() => openVisitModal(a)}
                        >
                          <IonIcon icon={medicalOutline} />
                          &nbsp;Record Visit
                        </IonButton>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </IonContent>

      {/* Add Appointment Modal */}
      <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
        <div className="modal-container">
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

          <IonList className="form-scroll">
            <IonItem>
              <IonLabel position="stacked">Select Mother(s)</IonLabel>
              <IonSelect
                multiple
                value={form.motherIds}
                placeholder="Search or select mothers"
                onIonChange={(e) => handleChange("motherIds", e.detail.value!)}
              >
                {mothers.map((m) => (
                  <IonSelectOption key={m.mother_id} value={m.mother_id}>
                    {m.first_name} {m.last_name}
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
              <IonLabel position="stacked">Location</IonLabel>
              <IonInput
                placeholder="Enter location"
                value={form.location}
                onIonChange={(e) => handleChange("location", e.detail.value!)}
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes</IonLabel>
              <IonInput
                placeholder="Optional notes"
                value={form.notes}
                onIonChange={(e) => handleChange("notes", e.detail.value!)}
              />
            </IonItem>
          </IonList>

          <IonButton expand="block" onClick={addAppointment}>
            Save Appointment
          </IonButton>
        </div>
      </IonModal>

      {/* Record Visit Modal */}
      <IonModal isOpen={visitModal} onDidDismiss={() => setVisitModal(false)}>
        <div className="modal-container">
          <div className="modal-header">
            <h2>Record Visit</h2>
            <IonButton
              fill="clear"
              color="medium"
              onClick={() => setVisitModal(false)}
            >
              <IonIcon icon={closeOutline} />
            </IonButton>
          </div>

          {selectedAppointment && (
            <IonList>
              <IonItem>
                <IonLabel>
                  <strong>Mother:</strong>{" "}
                  {selectedAppointment.mother?.first_name}{" "}
                  {selectedAppointment.mother?.last_name}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>
                  <strong>Date:</strong> {selectedAppointment.date}
                </IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Blood Pressure</IonLabel>
                <IonInput
                  value={visitForm.bloodPressure}
                  onIonChange={(e) =>
                    handleVisitChange("bloodPressure", e.detail.value!)
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Weight (kg)</IonLabel>
                <IonInput
                  value={visitForm.weight}
                  onIonChange={(e) =>
                    handleVisitChange("weight", e.detail.value!)
                  }
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Remarks</IonLabel>
                <IonInput
                  value={visitForm.remarks}
                  onIonChange={(e) =>
                    handleVisitChange("remarks", e.detail.value!)
                  }
                />
              </IonItem>
            </IonList>
          )}

          <IonButton expand="block" color="success" onClick={saveVisitRecord}>
            Save Visit Record
          </IonButton>
        </div>
      </IonModal>

      <style>
        {`
          .page-title { padding: 10px 20px; font-weight: 600; }
          .appointments-layout { display: flex; gap: 20px; padding: 20px; }
          .calendar-section { width: 350px; }
          .table-wrapper { flex: 1; }
          .appointments-table {
            width: 100%; border-collapse: collapse; background: white;
            border-radius: 12px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .appointments-table th, .appointments-table td {
            padding: 10px; border-bottom: 1px solid #ddd; text-align: left;
          }
          .appointments-table tr:hover { background-color: #f5f9ff; }
          .modal-container {
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            background: #fefefe;
          }
          .modal-header {
            display: flex; justify-content: space-between; align-items: center;
          }
          .form-scroll {
            max-height: 65vh;
            overflow-y: auto;
            padding-right: 10px;
          }
        `}
      </style>
    </MainLayout>
  );
};

export default Appointments;
