// src/pages/HealthRecords.tsx
import React, { useEffect, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonSpinner,
  IonToast,
  IonSearchbar,
  IonIcon,
  IonTextarea,
  IonToggle,
  IonNote,
} from "@ionic/react";
import {
  closeOutline,
  chevronDownOutline,
  chevronUpOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";

interface Mother {
  mother_id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  address: string;
}

interface HealthRecord {
  id?: string;
  mother_id: string;
  encounter_date: string;
  weight?: number;
  ht?: number;
  bp?: string;
  temp?: number;
  pr?: number;
  rr?: number;
  hr?: number;
  dm?: boolean;
  hpn?: boolean;
  tt_status?: string;
  notes?: string;
}

const HealthRecords: React.FC = () => {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [records, setRecords] = useState<{ [key: string]: HealthRecord[] }>({});
  const [expanded, setExpanded] = useState<{ [key: string]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentMother, setCurrentMother] = useState<Mother | null>(null);
  const [form, setForm] = useState<Partial<HealthRecord>>({});
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [bmi, setBmi] = useState<string>("");
  const [lastTT, setLastTT] = useState<string>("");

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMothers();
      setLoading(false);
    })();
  }, []);

  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("mother_id, first_name, middle_name, last_name, address")
      .order("last_name", { ascending: true });
    if (!error && data) setMothers(data);
  };

  const fetchHealthRecords = async (motherId: string) => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("mother_id", motherId)
      .order("encounter_date", { ascending: false });
    if (!error && data) {
      setRecords((prev) => ({ ...prev, [motherId]: data }));
      return data;
    }
    return [];
  };

  const handleChange = (field: keyof HealthRecord, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      const w = Number(updated.weight);
      const h = Number(updated.ht);
      if (w > 0 && h > 0) {
        const computedBmi = w / ((h / 100) * (h / 100));
        setBmi(computedBmi.toFixed(2));
      } else setBmi("");
      return updated;
    });
  };

  const bmiLabel = (bmi: number) => {
    if (!bmi) return "";
    if (bmi < 18.5) return "Underweight";
    if (bmi < 25) return "Normal";
    if (bmi < 30) return "Overweight";
    return "Obese";
  };

  // Determine next TT
  const nextTT = (current: string) => {
    if (!current) return "TT1";
    const map: Record<string, string> = {
      TT1: "TT2",
      TT2: "Completed",
      Completed: "Completed",
    };
    return map[current] || "TT1";
  };

  const openAddRecordModal = async (mother: Mother) => {
    setCurrentMother(mother);
    const data = await fetchHealthRecords(mother.mother_id);
    const lastRecord = data[0];
    const last = lastRecord?.tt_status || "";
    setLastTT(last);
    setForm({ tt_status: nextTT(last) });
    setShowModal(true);
  };

  const saveRecord = async () => {
    if (!currentMother || !form.encounter_date) {
      setToastMsg("Please complete required fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        mother_id: currentMother.mother_id,
        encounter_date: form.encounter_date,
        weight: form.weight ? Number(form.weight) : null,
        ht: form.ht ? Number(form.ht) : null,
        bp: form.bp,
        temp: form.temp ? Number(form.temp) : null,
        pr: form.pr ? Number(form.pr) : null,
        rr: form.rr ? Number(form.rr) : null,
        hr: form.hr ? Number(form.hr) : null,
        dm: form.dm || false,
        hpn: form.hpn || false,
        tt_status: form.tt_status || "",
        notes: form.notes || "",
      };

      const { error } = await supabase.from("health_records").insert([payload]);
      if (error) throw error;

      setToastMsg("✅ Health record added successfully!");
      setShowModal(false);
      setForm({});
      setBmi("");
      await fetchHealthRecords(currentMother.mother_id);
    } catch (err) {
      console.error(err);
      setToastMsg("❌ Error saving record.");
    } finally {
      setSaving(false);
    }
  };

  const filtered = mothers.filter((m) =>
    `${m.first_name} ${m.last_name}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="light">
          <IonTitle>Health Records</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <IonSearchbar
          placeholder="Search mother..."
          value={search}
          onIonChange={(e) => setSearch(e.detail.value!)}
        />

        {loading ? (
          <div className="centered">
            <IonSpinner name="dots" />
          </div>
        ) : (
          <div className="records-list">
            {filtered.map((m) => (
              <div key={m.mother_id} className="mother-card">
                <div className="header">
                  <div>
                    <h3>
                      {m.first_name} {m.middle_name?.charAt(0)}. {m.last_name}
                    </h3>
                    <p>{m.address}</p>
                  </div>
                  <div className="actions">
                    <IonButton
                      size="small"
                      color="primary"
                      onClick={() => openAddRecordModal(m)}
                    >
                      Add Health Record
                    </IonButton>
                    <IonButton
                      size="small"
                      fill="outline"
                      onClick={() => {
                        const isExpanded = expanded[m.mother_id];
                        setExpanded((prev) => ({
                          ...prev,
                          [m.mother_id]: !isExpanded,
                        }));
                        if (!isExpanded) fetchHealthRecords(m.mother_id);
                      }}
                    >
                      {expanded[m.mother_id] ? (
                        <IonIcon icon={chevronUpOutline} />
                      ) : (
                        <IonIcon icon={chevronDownOutline} />
                      )}
                    </IonButton>
                  </div>
                </div>

                {expanded[m.mother_id] && (
                  <div className="record-list">
                    {records[m.mother_id]?.length ? (
                      <table className="records-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Weight</th>
                            <th>Height</th>
                            <th>BP</th>
                            <th>Temp</th>
                            <th>TT</th>
                            <th>Notes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {records[m.mother_id].map((r) => (
                            <tr key={r.id}>
                              <td>{r.encounter_date}</td>
                              <td>{r.weight} kg</td>
                              <td>{r.ht} cm</td>
                              <td>{r.bp}</td>
                              <td>{r.temp}°C</td>
                              <td>{r.tt_status}</td>
                              <td>{r.notes}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="no-records">No records yet.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* === ADD RECORD MODAL === */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>
                Add Health Record — {currentMother?.first_name}{" "}
                {currentMother?.last_name}
              </h2>
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-body">
              <IonList className="form">
                <IonItem>
                  <IonLabel position="stacked">Date of Visit</IonLabel>
                  <IonInput
                    type="date"
                    value={form.encounter_date}
                    onIonChange={(e) =>
                      handleChange("encounter_date", e.detail.value!)
                    }
                  />
                </IonItem>

                <h3 className="section-title">Vital Signs</h3>
                <div className="grid">
                  <IonItem>
                    <IonLabel position="stacked">Weight (kg)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) =>
                        handleChange("weight", e.detail.value!)
                      }
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Height (cm)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) => handleChange("ht", e.detail.value!)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Blood Pressure</IonLabel>
                    <IonInput
                      placeholder="e.g. 120/80"
                      onIonChange={(e) => handleChange("bp", e.detail.value!)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Temperature (°C)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) => handleChange("temp", e.detail.value!)}
                    />
                  </IonItem>
                </div>

                {bmi && (
                  <IonNote className="bmi-note">
                    BMI: <strong>{bmi}</strong> ({bmiLabel(Number(bmi))})
                  </IonNote>
                )}

                <h3 className="section-title">Conditions</h3>
                <IonItem>
                  <IonLabel>Diabetes Mellitus (DM)</IonLabel>
                  <IonToggle
                    checked={form.dm}
                    onIonChange={(e) => handleChange("dm", e.detail.checked)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>Hypertension (HPN)</IonLabel>
                  <IonToggle
                    checked={form.hpn}
                    onIonChange={(e) => handleChange("hpn", e.detail.checked)}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">TT Status</IonLabel>
                  <IonInput
                    value={form.tt_status}
                    placeholder="TT1 / TT2 / Completed"
                    onIonChange={(e) =>
                      handleChange("tt_status", e.detail.value!)
                    }
                  />
                </IonItem>
                {lastTT && (
                  <IonNote color="medium" className="bmi-note">
                    Last TT Status: <strong>{lastTT}</strong> → Next:{" "}
                    <strong>{nextTT(lastTT)}</strong>
                  </IonNote>
                )}

                <IonItem>
                  <IonLabel position="stacked">Notes / Remarks</IonLabel>
                  <IonTextarea
                    rows={4}
                    onIonChange={(e) => handleChange("notes", e.detail.value!)}
                  />
                </IonItem>
              </IonList>
            </div>

            <div className="modal-footer">
              <IonButton color="medium" onClick={() => setShowModal(false)}>
                Cancel
              </IonButton>
              <IonButton color="primary" onClick={saveRecord}>
                {saving ? <IonSpinner name="dots" /> : "Save"}
              </IonButton>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>

      <style>{`
        .page-content { padding: 16px; background: #f9fafc; }
        .mother-card { background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 12px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .actions { display: flex; gap: 6px; }
        .records-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; }
        .records-table th, .records-table td { border: 1px solid #ddd; padding: 6px; text-align: center; }
        .records-table th { background: #f3f3f3; }
        .no-records { text-align: center; padding: 8px; color: gray; }

        ion-modal::part(content) {
          height: 80vh;
          width: 95%;
          max-width: 700px;
          border-radius: 12px;
          overflow: hidden;
        }

        .modal { display: flex; flex-direction: column; height: 100%; background: #fff; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding: 10px 16px; }
        .modal-body { flex: 1; overflow-y: auto; padding: 10px 16px; }
        .modal-footer { border-top: 1px solid #ddd; padding: 10px 16px; display: flex; justify-content: flex-end; gap: 10px; background: #fff; }

        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
        .bmi-note { text-align: center; display: block; color: #0077b6; font-weight: 600; margin-top: 8px; }
        .section-title { margin-top: 16px; font-weight: 600; font-size: 16px; color: #444; }
        .centered { display: flex; justify-content: center; align-items: center; height: 200px; }

        @media (max-width: 600px) {
          ion-modal::part(content) { height: 90vh; width: 95%; }
        }
      `}</style>
    </MainLayout>
  );
};

export default HealthRecords;
