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
import { closeOutline } from "ionicons/icons";
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
  id: string;
  mother_id: string;
  encounter_date: string;
  weight: number;
  height: number;
  bp: string;
  temp: number;
  pr: number;
  rr: number;
  hr: number;
  bmi: number;
  dm: boolean;
  hpn: boolean;
  tt_status: string;
  notes: string;
}

const HealthRecords: React.FC = () => {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentMother, setCurrentMother] = useState<Mother | null>(null);
  const [form, setForm] = useState<Partial<HealthRecord>>({});
  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

  const fetchMothers = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("mother_id, first_name, middle_name, last_name, address")
      .order("last_name", { ascending: true });
    if (!error && data) setMothers(data);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await fetchMothers();
      setLoading(false);
    })();
  }, []);

  const handleChange = (field: keyof HealthRecord, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      const w = Number(updated.weight);
      const h = Number(updated.height);
      if (w > 0 && h > 0) updated.bmi = parseFloat((w / ((h / 100) ** 2)).toFixed(2));
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

  const saveRecord = async () => {
    if (!currentMother || !form.encounter_date) {
      setToastMsg("Please complete required fields.");
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, mother_id: currentMother.mother_id };
      const { error } = await supabase.from("health_records").insert([payload]);
      if (error) throw error;
      setToastMsg("Record added successfully!");
      setShowModal(false);
      setForm({});
    } catch (err) {
      console.error(err);
      setToastMsg("Error saving record.");
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
        <IonToolbar color="primary">
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
                  <IonButton
                    size="small"
                    color="primary"
                    onClick={() => {
                      setCurrentMother(m);
                      setShowModal(true);
                    }}
                  >
                    Add Health Record
                  </IonButton>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* === MODAL FORM === */}
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

            <IonContent className="modal-body">
              <IonList className="form">
                <IonItem>
                  <IonLabel position="stacked">Date of Visit</IonLabel>
                  <IonInput
                    type="date"
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
                      onIonChange={(e) =>
                        handleChange("height", e.detail.value!)
                      }
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
                  <IonItem>
                    <IonLabel position="stacked">PR (Pulse Rate)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) => handleChange("pr", e.detail.value!)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">RR (Respiratory Rate)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) => handleChange("rr", e.detail.value!)}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">HR (Heart Rate)</IonLabel>
                    <IonInput
                      type="number"
                      onIonChange={(e) => handleChange("hr", e.detail.value!)}
                    />
                  </IonItem>
                </div>

                {form.bmi && (
                  <IonNote className="bmi-note">
                    BMI: <strong>{form.bmi}</strong> ({bmiLabel(form.bmi)})
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
                    placeholder="TT1 / TT2 / Completed"
                    onIonChange={(e) =>
                      handleChange("tt_status", e.detail.value!)
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Notes / Remarks</IonLabel>
                  <IonTextarea
                    rows={4}
                    onIonChange={(e) => handleChange("notes", e.detail.value!)}
                  />
                </IonItem>
              </IonList>
            </IonContent>

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
        .mother-card { background: #fff; padding: 16px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .modal { background: #fff; border-radius: 12px; padding: 18px; width: 95%; max-width: 720px; margin: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-bottom: 10px; }
        .modal-body { padding: 0 6px; }
        .form { background: #fff; padding: 4px; }
        .section-title { font-weight: 600; margin: 16px 0 8px; color: #222; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
        .bmi-note { text-align: center; display: block; color: #0077b6; font-weight: 600; margin-top: 10px; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #ddd; padding-top: 10px; margin-top: 10px; }
        .centered { display: flex; justify-content: center; align-items: center; height: 200px; }
      `}</style>
    </MainLayout>
  );
};

export default HealthRecords;
