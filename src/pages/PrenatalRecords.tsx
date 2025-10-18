import React, { useState, useEffect } from "react";
import {
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonAlert,
} from "@ionic/react";
import { addOutline, closeOutline, createOutline, trashOutline } from "ionicons/icons";
import { useParams, useHistory } from "react-router-dom";
import MainLayout from "../layouts/MainLayouts";
import { supabase } from "../utils/supabaseClient";

interface RouteParams {
  id: string;
}

const PrenatalRecords: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();

  const [mother, setMother] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    visit_date: "",
    weight: "",
    bp: "",
    temperature: "",
    fetal_heart_tone: "",
    remarks: "",
  });

  // Fetch mother info
  const fetchMother = async () => {
    const { data, error } = await supabase
      .from("mothers")
      .select("id, name, email, contact, status")
      .eq("id", id)
      .single();

    if (!error) setMother(data);
  };

  // Fetch prenatal records
  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("health_records")
      .select("*")
      .eq("mother_id", id)
      .order("visit_date", { ascending: false });

    if (!error) setRecords(data || []);
  };

  useEffect(() => {
    fetchMother();
    fetchRecords();
  }, [id]);

  // Input change
  const handleInputChange = (e: CustomEvent) => {
    const target = e.target as HTMLInputElement;
    const name = target.name;
    const value = (e as any).detail.value;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Save / Update Record
  const saveRecord = async () => {
    if (!form.visit_date) {
      alert("Please select a visit date.");
      return;
    }

    if (editId) {
      const { error } = await supabase
        .from("health_records")
        .update({
          visit_date: form.visit_date,
          weight: form.weight,
          bp: form.bp,
          temperature: form.temperature,
          fetal_heart_tone: form.fetal_heart_tone,
          remarks: form.remarks,
        })
        .eq("id", editId);

      if (error) {
        alert("Update failed!");
      } else {
        alert("Record updated successfully!");
        fetchRecords();
        setShowModal(false);
      }
    } else {
      const { error } = await supabase.from("health_records").insert([
        {
          mother_id: id,
          visit_date: form.visit_date,
          weight: form.weight,
          bp: form.bp,
          temperature: form.temperature,
          fetal_heart_tone: form.fetal_heart_tone,
          remarks: form.remarks,
        },
      ]);

      if (error) {
        alert("Save failed!");
      } else {
        alert("Record added successfully!");
        fetchRecords();
        setShowModal(false);
      }
    }
  };

  const handleEdit = (rec: any) => {
    setEditId(rec.id);
    setForm({
      visit_date: rec.visit_date || "",
      weight: rec.weight || "",
      bp: rec.bp || "",
      temperature: rec.temperature || "",
      fetal_heart_tone: rec.fetal_heart_tone || "",
      remarks: rec.remarks || "",
    });
    setShowModal(true);
  };

  const deleteRecord = async () => {
    if (!deleteId) return;
    const { error } = await supabase.from("health_records").delete().eq("id", deleteId);
    if (error) alert("Failed to delete record.");
    else {
      alert("Deleted successfully!");
      fetchRecords();
    }
    setShowDeleteAlert(false);
    setDeleteId(null);
  };

  const resetForm = () => {
    setForm({
      visit_date: "",
      weight: "",
      bp: "",
      temperature: "",
      fetal_heart_tone: "",
      remarks: "",
    });
    setEditId(null);
  };

  return (
    <MainLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-bold">Prenatal Records</h1>
            {mother && (
              <p className="text-gray-600">
                For <strong>{mother.name}</strong> ({mother.status})
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <IonButton color="medium" onClick={() => history.push("/mothers")}>
              Back
            </IonButton>
            <IonButton
              color="primary"
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
            >
              <IonIcon icon={addOutline} slot="start" />
              Add Visit
            </IonButton>
          </div>
        </div>

        {records.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No prenatal visit records yet.
          </p>
        ) : (
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 text-gray-700 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">Visit Date</th>
                  <th className="px-4 py-2 text-left">Weight (kg)</th>
                  <th className="px-4 py-2 text-left">BP</th>
                  <th className="px-4 py-2 text-left">Temp (°C)</th>
                  <th className="px-4 py-2 text-left">Fetal Heart Tone</th>
                  <th className="px-4 py-2 text-left">Remarks</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr
                    key={i}
                    className="border-t hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-2">{new Date(r.visit_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{r.weight || "-"}</td>
                    <td className="px-4 py-2">{r.bp || "-"}</td>
                    <td className="px-4 py-2">{r.temperature || "-"}</td>
                    <td className="px-4 py-2">{r.fetal_heart_tone || "-"}</td>
                    <td className="px-4 py-2">{r.remarks || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      <IonButton fill="clear" onClick={() => handleEdit(r)}>
                        <IonIcon icon={createOutline} />
                      </IonButton>
                      <IonButton
                        fill="clear"
                        color="danger"
                        onClick={() => {
                          setDeleteId(r.id);
                          setShowDeleteAlert(true);
                        }}
                      >
                        <IonIcon icon={trashOutline} />
                      </IonButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-semibold">
                {editId ? "Edit Visit Record" : "Add Prenatal Visit"}
              </h2>
              <IonButton fill="clear" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <IonList>
              <IonItem>
                <IonLabel position="stacked">Visit Date</IonLabel>
                <IonInput type="date" name="visit_date" value={form.visit_date} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Weight (kg)</IonLabel>
                <IonInput type="number" name="weight" value={form.weight} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Blood Pressure</IonLabel>
                <IonInput name="bp" value={form.bp} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Temperature (°C)</IonLabel>
                <IonInput type="number" name="temperature" value={form.temperature} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Fetal Heart Tone</IonLabel>
                <IonInput name="fetal_heart_tone" value={form.fetal_heart_tone} onIonChange={handleInputChange} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Remarks</IonLabel>
                <IonInput name="remarks" value={form.remarks} onIonChange={handleInputChange} />
              </IonItem>
            </IonList>

            <IonButton expand="block" onClick={saveRecord}>
              {editId ? "Update Record" : "Save Record"}
            </IonButton>
          </div>
        </IonModal>

        <IonAlert
          isOpen={showDeleteAlert}
          header="Confirm Delete"
          message="Delete this prenatal visit record?"
          buttons={[
            { text: "Cancel", role: "cancel" },
            { text: "Delete", role: "confirm", handler: deleteRecord },
          ]}
        />
      </div>
    </MainLayout>
  );
};

export default PrenatalRecords;
