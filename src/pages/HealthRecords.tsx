// src/pages/HealthRecords.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonFab,
  IonFabButton,
  IonIcon,
  IonBadge,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react";
import { add, create, trash } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";

/**
 * HealthRecords.tsx
 * - Shows recent/current records on top (last 28 days)
 * - Past records collapsed/dimmed but still accessible
 * - Modal add/edit with auto-calc of AOG from mother's LMP
 * - Progress bar, trimester badge, small action buttons
 *
 * Requirements:
 * - mothers table: id, name, lmp_date
 * - health_records table: id, mother_id, encounter_date, weight, blood_pressure, hemoglobin_level, weeks_of_gestation, notes
 */

interface HealthRecord {
  id: string;
  mother_id: string;
  encounter_date: string; // yyyy-mm-dd
  weight: number | null;
  blood_pressure: string | null;
  hemoglobin_level: number | null;
  weeks_of_gestation: number | null;
  notes: string | null;
  mothers?: {
    name?: string | null;
    lmp_date?: string | null;
  };
}

const containerStyle: React.CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "16px",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 14,
  boxShadow: "0 6px 18px rgba(20,20,40,0.06)",
  overflow: "hidden",
  border: "1px solid rgba(0,0,0,0.04)",
};

const smallBtnStyle: React.CSSProperties = {
  height: 32,
  minWidth: 72,
  padding: "0 10px",
  fontSize: 13,
  borderRadius: 20,
};

const textMuted: React.CSSProperties = { color: "#666", fontSize: 13 };

const RECENT_DAYS = 28;

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [mothers, setMothers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);

  const [toast, setToast] = useState<{ show: boolean; message: string; color?: string }>({
    show: false,
    message: "",
    color: "primary",
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pastCollapsed, setPastCollapsed] = useState(true);

  const [formData, setFormData] = useState<any>({
    mother_id: "",
    encounter_date: "",
    weight: "",
    blood_pressure: "",
    hemoglobin_level: "",
    weeks_of_gestation: "",
    notes: "",
  });

  useEffect(() => {
    fetchMothers();
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- Data fetching ----------
  const fetchMothers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("mothers").select("id, name, lmp_date").order("name");
      if (error) throw error;
      setMothers(data || []);
    } catch (err) {
      console.error("fetchMothers error", err);
      showToast("Failed to load mothers.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("health_records")
        .select("*, mothers(name, lmp_date)")
        .order("encounter_date", { ascending: false });
      if (error) throw error;
      setRecords((data || []) as HealthRecord[]);
    } catch (err) {
      console.error("fetchRecords error", err);
      showToast("Failed to load records.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Helpers ----------
  const showToast = (message: string, color: string = "primary") => {
    setToast({ show: true, message, color });
  };

  const parseDate = (s?: string | null): Date | null => {
    if (!s) return null;
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  const calculateWeeksOfGestation = (lmpDate?: string | null): number | null => {
    const lmp = parseDate(lmpDate);
    if (!lmp) return null;
    const today = new Date();
    const diffDays = Math.floor((today.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.floor(diffDays / 7));
  };

  const getTrimester = (weeks: number | null) => {
    if (weeks == null) return "Unknown";
    if (weeks <= 13) return "1st Trimester";
    if (weeks <= 27) return "2nd Trimester";
    return "3rd Trimester";
  };

  const getBadgeColor = (weeks: number | null) => {
    if (weeks == null) return "medium";
    if (weeks <= 13) return "success";
    if (weeks <= 27) return "warning";
    return "danger";
  };

  const progressPercent = (weeks: number | null) => {
    if (weeks == null) return 0;
    const pct = Math.round((weeks / 40) * 100);
    return Math.min(100, Math.max(0, pct));
  };

  const daysBetween = (d1: Date, d2: Date) => {
    const diff = Math.abs(d1.getTime() - d2.getTime());
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const { recentRecords, pastRecords } = useMemo(() => {
    const now = new Date();
    const recent: HealthRecord[] = [];
    const past: HealthRecord[] = [];
    (records || []).forEach((r) => {
      const enc = parseDate(r.encounter_date) ?? new Date();
      const days = daysBetween(now, enc);
      if (days <= RECENT_DAYS) recent.push(r);
      else past.push(r);
    });
    return { recentRecords: recent, pastRecords: past };
  }, [records]);

  // ---------- Form handlers ----------
  const handleChange = (name: string, value: any) => {
    setFormData((p: any) => ({ ...p, [name]: value }));
  };

  const openAddModal = () => {
    setSelectedRecord(null);
    setFormData({
      mother_id: "",
      encounter_date: "",
      weight: "",
      blood_pressure: "",
      hemoglobin_level: "",
      weeks_of_gestation: "",
      notes: "",
    });
    setShowModal(true);
  };

  const openEditModal = (r: HealthRecord) => {
    setSelectedRecord(r);
    setFormData({
      mother_id: r.mother_id,
      encounter_date: r.encounter_date,
      weight: r.weight ?? "",
      blood_pressure: r.blood_pressure ?? "",
      hemoglobin_level: r.hemoglobin_level ?? "",
      weeks_of_gestation: r.weeks_of_gestation ?? "",
      notes: r.notes ?? "",
    });
    setShowModal(true);
  };

  const handleMotherSelect = (motherId: string) => {
    const mom = mothers.find((m) => m.id === motherId);
    const autoWeeks = calculateWeeksOfGestation(mom?.lmp_date) ?? "";
    setFormData((p: any) => ({ ...p, mother_id: motherId, weeks_of_gestation: autoWeeks }));
  };

  const saveRecord = async () => {
    if (!formData.mother_id || !formData.encounter_date) {
      showToast("Please select mother and encounter date.", "warning");
      return;
    }

    setLoading(true);
    try {
      const mom = mothers.find((m) => m.id === formData.mother_id);
      const computedWeeks =
        formData.weeks_of_gestation !== "" && formData.weeks_of_gestation !== null
          ? Number(formData.weeks_of_gestation)
          : calculateWeeksOfGestation(mom?.lmp_date);

      const payload = {
        mother_id: formData.mother_id,
        encounter_date: formData.encounter_date,
        weight: formData.weight ? Number(formData.weight) : null,
        blood_pressure: formData.blood_pressure || null,
        hemoglobin_level: formData.hemoglobin_level ? Number(formData.hemoglobin_level) : null,
        weeks_of_gestation: computedWeeks ?? null,
        notes: formData.notes || null,
      };

      let error = null;
      if (selectedRecord) {
        ({ error } = await supabase.from("health_records").update(payload).eq("id", selectedRecord.id));
      } else {
        ({ error } = await supabase.from("health_records").insert([payload]));
      }

      if (error) throw error;
      showToast(selectedRecord ? "Record updated." : "Record saved.", "success");
      setShowModal(false);
      await fetchRecords();
      setSelectedRecord(null);
    } catch (err) {
      console.error("saveRecord error", err);
      showToast("Failed to save record.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (r: HealthRecord) => {
    setSelectedRecord(r);
    setShowDeleteConfirm(true);
  };

  const doDelete = async () => {
    if (!selectedRecord) return;
    setLoading(true);
    try {
      const { error } = await supabase.from("health_records").delete().eq("id", selectedRecord.id);
      if (error) throw error;
      showToast("Record deleted.", "success");
      setShowDeleteConfirm(false);
      setSelectedRecord(null);
      await fetchRecords();
    } catch (err) {
      console.error("delete error", err);
      showToast("Failed to delete.", "danger");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  const renderRecordCard = (r: HealthRecord, dimmed = false) => {
    const weeks = r.weeks_of_gestation ?? calculateWeeksOfGestation(r.mothers?.lmp_date) ?? null;
    const pct = progressPercent(weeks);
    return (
      <IonCard key={r.id} style={{ ...cardStyle, opacity: dimmed ? 0.65 : 1 }}>
        <IonCardHeader style={{ padding: "16px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <IonCardTitle style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{r.mothers?.name || "Unknown"}</IonCardTitle>
            <div style={{ marginTop: 4, color: "#666", fontSize: 13 }}>Encounter: {r.encounter_date}</div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IonBadge color={getBadgeColor(weeks)} style={{ fontSize: 12, padding: "6px 8px", borderRadius: 10 }}>
              {getTrimester(weeks)}
            </IonBadge>
          </div>
        </IonCardHeader>

        <IonCardContent style={{ padding: "12px 18px 18px 18px" }}>
          <IonGrid>
            <IonRow style={{ gap: 8 }}>
              <IonCol size="12" sizeMd="3">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>Weight</div>
                <div style={textMuted}>{r.weight ?? "N/A"} kg</div>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>Blood Pressure</div>
                <div style={textMuted}>{r.blood_pressure ?? "N/A"}</div>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>Hemoglobin</div>
                <div style={textMuted}>{r.hemoglobin_level ?? "N/A"} g/dL</div>
              </IonCol>

              <IonCol size="12" sizeMd="3">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>AOG</div>
                <div style={textMuted}>{weeks ?? "N/A"} weeks</div>
              </IonCol>
            </IonRow>

            <IonRow>
              <IonCol size="12" sizeMd="6">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600, marginTop: 6 }}>Progress</div>
                <div style={{ background: "#f1f4f8", height: 10, borderRadius: 6, overflow: "hidden", marginTop: 6 }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: pct < 60 ? "#3dc5a9" : pct < 90 ? "#f5a623" : "#ef5350" }} />
                </div>
                <div style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{pct}% of 40 weeks</div>
              </IonCol>

              <IonCol size="12" sizeMd="6">
                <div style={{ fontSize: 13, color: "#333", fontWeight: 600 }}>Notes</div>
                <div style={textMuted}>{r.notes ?? "None"}</div>
              </IonCol>
            </IonRow>
          </IonGrid>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 12 }}>
            <IonButton onClick={() => openEditModal(r)} style={{ ...smallBtnStyle }} fill="outline" color="medium">
              <IonIcon icon={create} slot="start" />
              Edit
            </IonButton>

            <IonButton onClick={() => confirmDelete(r)} style={{ ...smallBtnStyle }} fill="outline" color="danger">
              <IonIcon icon={trash} slot="start" />
              Delete
            </IonButton>
          </div>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Health Records</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent >
        <div style={containerStyle}>
          <IonText color="medium">
            <div style={{ textAlign: "center", marginBottom: 18, fontSize: 13 }}>
              ⚠️ Educational use only. Data must be verified by licensed professionals.
            </div>
          </IonText>

          {/* Recent / Current */}
          <div style={{ marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Recent / Current (last {RECENT_DAYS} days)</div>
            <div style={{ color: "#666", fontSize: 13 }}>{recentRecords.length} record(s)</div>
          </div>

          {recentRecords.length === 0 ? (
            <div style={{ textAlign: "center", padding: 24, color: "#666" }}>No recent records found.</div>
          ) : (
            <div style={{ display: "grid", gap: 18 }}>
              {recentRecords.map((r) => renderRecordCard(r, false))}
            </div>
          )}

          {/* Past section */}
          <div style={{ marginTop: 20, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700 }}>Past Records</div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ color: "#666", fontSize: 13 }}>{pastRecords.length} older record(s)</div>
              <IonButton size="small" fill="outline" onClick={() => setPastCollapsed((s) => !s)}>
                {pastCollapsed ? "Show" : "Hide"}
              </IonButton>
            </div>
          </div>

          {!pastCollapsed && pastRecords.length > 0 && (
            <div style={{ display: "grid", gap: 14 }}>
              {pastRecords.map((r) => renderRecordCard(r, true))}
            </div>
          )}

          {pastCollapsed && pastRecords.length > 0 && (
            <div style={{ textAlign: "center", color: "#999", fontSize: 13, marginBottom: 12 }}>
              Past records hidden — click Show to expand.
            </div>
          )}
        </div>

        {/* Floating Add */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={openAddModal}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal Form */}
       {/* Modal Form */}
<IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh", // Full screen height
      overflow: "hidden",
    }}
  >
    {/* Header section (fixed) */}
    <div
      style={{
        padding: 16,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #ddd",
        flexShrink: 0,
      }}
    >
      <h3 style={{ margin: 0 }}>
        {selectedRecord ? "Edit Health Record" : "Add Health Record"}
      </h3>
      <IonButton fill="clear" onClick={() => setShowModal(false)}>
        Close
      </IonButton>
    </div>

    {/* Scrollable form area */}
    <div
      style={{
        flex: 1,
        overflowY: "auto", // ✅ Enables vertical scroll
        padding: "16px 20px",
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <IonList lines="full">
        <IonItem>
          <IonLabel position="stacked">Mother</IonLabel>
          <IonSelect
            value={formData.mother_id}
            placeholder="Select mother"
            onIonChange={(e) => handleMotherSelect(e.detail.value)}
          >
            {mothers.map((m) => (
              <IonSelectOption key={m.id} value={m.id}>
                {m.name}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Encounter Date</IonLabel>
          <IonInput
            type="date"
            value={formData.encounter_date}
            onIonChange={(e) =>
              handleChange("encounter_date", (e.target as any).value)
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Weight (kg)</IonLabel>
          <IonInput
            type="number"
            value={formData.weight}
            onIonChange={(e) =>
              handleChange("weight", (e.target as any).value)
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Blood Pressure</IonLabel>
          <IonInput
            type="text"
            value={formData.blood_pressure}
            onIonChange={(e) =>
              handleChange("blood_pressure", (e.target as any).value)
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Hemoglobin (g/dL)</IonLabel>
          <IonInput
            type="number"
            value={formData.hemoglobin_level}
            onIonChange={(e) =>
              handleChange("hemoglobin_level", (e.target as any).value)
            }
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Weeks of Gestation (AOG)</IonLabel>
          <IonInput
            type="number"
            value={formData.weeks_of_gestation}
            onIonChange={(e) =>
              handleChange("weeks_of_gestation", (e.target as any).value)
            }
          />
          <div
            style={{
              marginTop: 6,
              fontSize: 12,
              color: "#666",
              lineHeight: 1.4,
            }}
          >
            Auto-filled from mother’s LMP if present; override if needed.
          </div>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Notes</IonLabel>
          <IonInput
            value={formData.notes}
            onIonChange={(e) =>
              handleChange("notes", (e.target as any).value)
            }
          />
        </IonItem>

        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <IonButton expand="block" onClick={saveRecord}>
            {selectedRecord ? "Update Record" : "Save Record"}
          </IonButton>
          <IonButton
            expand="block"
            fill="outline"
            color="medium"
            onClick={() => {
              setShowModal(false);
              setSelectedRecord(null);
            }}
          >
            Cancel
          </IonButton>
        </div>
      </IonList>

      <div style={{ height: 40 }} /> {/* small spacer for end padding */}
    </div>
  </div>
</IonModal>


        {/* Toast / Loading / Delete confirm */}
        <IonToast isOpen={toast.show} message={toast.message} color={toast.color} duration={2200} onDidDismiss={() => setToast({ ...toast, show: false })} />

        <IonModal isOpen={showDeleteConfirm} onDidDismiss={() => setShowDeleteConfirm(false)}>
          <div style={{ padding: 18 }}>
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this record? This cannot be undone.</p>
            <div style={{ display: "flex", gap: 8 }}>
              <IonButton color="danger" onClick={doDelete}>Delete</IonButton>
              <IonButton fill="outline" onClick={() => setShowDeleteConfirm(false)}>Cancel</IonButton>
            </div>
          </div>
        </IonModal>

        <IonLoading isOpen={loading} message={"Please wait..."} />
      </IonContent>
    </MainLayout>
  );
};

export default HealthRecords;
