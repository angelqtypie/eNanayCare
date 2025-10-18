// src/pages/AdminChatbotQA.tsx
import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonButton,
  IonInput,
  IonTextarea,
  IonList,
  IonItem,
  IonLabel,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonFooter,
  IonLoading,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";

const AdminChatbotQA: React.FC = () => {
  const [qaList, setQaList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQA, setSelectedQA] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    fetchQA();
  }, []);

  const fetchQA = async () => {
    const { data, error } = await supabase
      .from("chatbot_qa")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else setQaList(data || []);
  };

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedQA(null);
    setQuestion("");
    setAnswer("");
    setShowModal(true);
  };

  const openEditModal = (qa: any) => {
    setIsEditing(true);
    setSelectedQA(qa);
    setQuestion(qa.question);
    setAnswer(qa.answer);
    setShowModal(true);
  };

  const saveQA = async () => {
    if (!question.trim() || !answer.trim()) return alert("Please fill in both fields.");
    setLoading(true);

    if (isEditing && selectedQA) {
      const { error } = await supabase
        .from("chatbot_qa")
        .update({
          question,
          answer,
          updated_at: new Date(),
        })
        .eq("id", selectedQA.id);

      if (error) alert("Update failed: " + error.message);
    } else {
      const { error } = await supabase.from("chatbot_qa").insert([
        {
          question,
          answer,
          created_by: userId,
        },
      ]);

      if (error) alert("Insert failed: " + error.message);
    }

    setLoading(false);
    setShowModal(false);
    fetchQA();
  };

  const deleteQA = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Q&A?")) return;
    const { error } = await supabase.from("chatbot_qa").delete().eq("id", id);
    if (error) alert("Delete failed: " + error.message);
    fetchQA();
  };

  return (
    <AdminMainLayout>

        <IonHeader>
          <IonToolbar color="light">
            <IonTitle>Chatbot Questions & Answers</IonTitle>
          </IonToolbar>
        </IonHeader>

        <IonContent className="ion-padding">
          <IonButton onClick={openAddModal} expand="block" color="primary">
            + Add New Question
          </IonButton>

          <IonList>
            {qaList.map((qa) => (
              <IonItem key={qa.id} className="qa-item">
                <IonLabel>
                  <h2><strong>Q:</strong> {qa.question}</h2>
                  <p><strong>A:</strong> {qa.answer}</p>
                </IonLabel>
                <div style={{ display: "flex", gap: "8px" }}>
                  <IonButton size="small" color="tertiary" onClick={() => openEditModal(qa)}>
                    Edit
                  </IonButton>
                  <IonButton size="small" color="danger" onClick={() => deleteQA(qa.id)}>
                    Delete
                  </IonButton>
                </div>
              </IonItem>
            ))}
          </IonList>
        </IonContent>

        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="light">
              <IonTitle>{isEditing ? "Edit Q&A" : "Add New Q&A"}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonInput
              label="Question"
              labelPlacement="stacked"
              value={question}
              onIonChange={(e) => setQuestion(e.detail.value!)}
              placeholder="Enter question"
            />
            <IonTextarea
              label="Answer"
              labelPlacement="stacked"
              value={answer}
              onIonChange={(e) => setAnswer(e.detail.value!)}
              placeholder="Enter answer"
              rows={5}
            />
          </IonContent>
          <IonFooter className="ion-padding">
            <IonButton expand="block" onClick={saveQA}>
              {isEditing ? "Update" : "Add"}
            </IonButton>
            <IonButton expand="block" fill="clear" color="medium" onClick={() => setShowModal(false)}>
              Cancel
            </IonButton>
          </IonFooter>
          <IonLoading isOpen={loading} message="Saving..." />
        </IonModal>
 
    </AdminMainLayout>
  );
};

export default AdminChatbotQA;
