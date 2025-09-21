// src/pages/FAQ.tsx
import React, { useState, useEffect } from "react";
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
  IonTextarea,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react";
import {
  addOutline,
  closeOutline,
  helpCircleOutline,
  createOutline,
  trashOutline,
  refreshOutline,
} from "ionicons/icons";
import MainLayout from "../layouts/MainLayouts";
import "./AdminFAQ.css";

interface FAQItem {
  questionFil: string;
  answerFil: string;
  questionEng: string;
  answerEng: string;
  questionBis: string;
  answerBis: string;
}

const DEFAULT_FAQS: FAQItem[] = [
  {
    questionFil: "Ano ang Barangay Health Worker (BHW)?",
    answerFil: "Ang BHW ay trained na community health worker na tumutulong sa pagbibigay ng basic health services sa barangay.",
    questionEng: "What is a Barangay Health Worker (BHW)?",
    answerEng: "A BHW is a trained community health worker who helps provide basic health services in the barangay.",
    questionBis: "Unsa ang Barangay Health Worker (BHW)?",
    answerBis: "Ang BHW kay usa ka gitrain nga health worker nga motabang og hatag og basic nga health services sa barangay.",
  },
  {
    questionFil: "Saan ako makakakuha ng schedule ng bakuna?",
    answerFil: "Maaaring makita sa reminders page o itanong sa inyong BHW ang latest vaccination schedules.",
    questionEng: "Where to get vaccination schedules?",
    answerEng: "You can check the reminders page or ask your BHW for the latest vaccination schedules.",
    questionBis: "Asa ko makakita sa schedule sa bakuna?",
    answerBis: "Makita nimo sa reminders page o mangutana ka sa BHW para sa pinakabag-ong schedule.",
  },
  {
    questionFil: "Libre ba ang check-up sa Barangay Health Center?",
    answerFil: "Oo, libre ang basic consultation at ilang serbisyo sa barangay health center.",
    questionEng: "Is the check-up free at the Barangay Health Center?",
    answerEng: "Yes, basic consultations and some services are free at the barangay health center.",
    questionBis: "Libre ba ang check-up sa Barangay Health Center?",
    answerBis: "Oo, libre ang basic consultation ug pipila ka serbisyo sa health center.",
  },
  {
    questionFil: "Pwede ba akong magpa-blood pressure check dito?",
    answerFil: "Oo, nag-ooffer ang BHW ng free blood pressure monitoring.",
    questionEng: "Can I check my blood pressure here?",
    answerEng: "Yes, BHWs offer free blood pressure monitoring.",
    questionBis: "Pwede ba ko magpa-check sa akong blood pressure diri?",
    answerBis: "Oo, libre ang pag-check sa blood pressure sa BHW.",
  },
  {
    questionFil: "Ano ang dapat gawin kung may lagnat ang bata?",
    answerFil: "Bigyan ng sapat na pahinga at fluids. Kung tuloy-tuloy ang lagnat, pumunta agad sa health center.",
    questionEng: "What should I do if a child has fever?",
    answerEng: "Give enough rest and fluids. If fever persists, visit the health center immediately.",
    questionBis: "Unsa akong buhaton kung adunay hilanat ang bata?",
    answerBis: "Hatagi siya og pahulay ug tubig. Kung magpadayon ang hilanat, adto dayon sa health center.",
  },
];

const AdminFAQ: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [language, setLanguage] = useState<"fil" | "eng" | "bis">("fil");

  const [form, setForm] = useState<FAQItem>({
    questionFil: "",
    answerFil: "",
    questionEng: "",
    answerEng: "",
    questionBis: "",
    answerBis: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("faqs");
    if (saved) {
      setFaqs(JSON.parse(saved));
    } else {
      setFaqs(DEFAULT_FAQS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("faqs", JSON.stringify(faqs));
  }, [faqs]);

  const handleChange = (name: keyof FAQItem, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const openNewModal = () => {
    setEditingIndex(null);
    setForm({
      questionFil: "",
      answerFil: "",
      questionEng: "",
      answerEng: "",
      questionBis: "",
      answerBis: "",
    });
    setShowModal(true);
  };

  const openEditModal = (index: number) => {
    setEditingIndex(index);
    setForm(faqs[index]);
    setShowModal(true);
  };

  const deleteFAQ = (index: number) => {
    setFaqs((prev) => prev.filter((_, i) => i !== index));
  };

  const saveFAQ = () => {
    if (
      !form.questionFil.trim() ||
      !form.answerFil.trim() ||
      !form.questionEng.trim() ||
      !form.answerEng.trim() ||
      !form.questionBis.trim() ||
      !form.answerBis.trim()
    )
      return;

    if (editingIndex !== null) {
      setFaqs((prev) =>
        prev.map((f, i) => (i === editingIndex ? form : f))
      );
    } else {
      setFaqs((prev) => [...prev, form]);
    }

    setForm({
      questionFil: "",
      answerFil: "",
      questionEng: "",
      answerEng: "",
      questionBis: "",
      answerBis: "",
    });
    setEditingIndex(null);
    setShowModal(false);
  };

  const resetToDefaults = () => {
    setFaqs(DEFAULT_FAQS);
    localStorage.setItem("faqs", JSON.stringify(DEFAULT_FAQS));
  };

  const getText = (faq: FAQItem) => {
    if (language === "fil") return { q: faq.questionFil, a: faq.answerFil };
    if (language === "eng") return { q: faq.questionEng, a: faq.answerEng };
    return { q: faq.questionBis, a: faq.answerBis };
  };

  return (
    <MainLayout>
      <IonPage className="faq-page">
        <IonHeader className="faq-header">
          <IonToolbar>
            <div className="header-container">
              <h1 className="page-title">
                <IonIcon icon={helpCircleOutline} /> FAQs
              </h1>
              <div className="header-actions">
                <IonSegment
                  value={language}
                  onIonChange={(e) =>
                    setLanguage(e.detail.value as "fil" | "eng" | "bis")
                  }
                >
                  <IonSegmentButton value="fil">Filipino</IonSegmentButton>
                  <IonSegmentButton value="eng">English</IonSegmentButton>
                  <IonSegmentButton value="bis">Bisaya</IonSegmentButton>
                </IonSegment>
                <IonButton className="add-btn" onClick={openNewModal}>
                  <IonIcon icon={addOutline} slot="start" />
                  New FAQ
                </IonButton>
                <IonButton
                  className="reset-btn"
                  color="warning"
                  onClick={resetToDefaults}
                >
                  <IonIcon icon={refreshOutline} slot="start" />
                  Reset
                </IonButton>
              </div>
            </div>
          </IonToolbar>
        </IonHeader>

        <IonContent className="faq-content">
          <div className="faq-layout">
            {faqs.length === 0 ? (
              <p className="empty-text">No FAQs available.</p>
            ) : (
              <div className="table-wrapper">
                <table className="faq-table desktop-only">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Answer</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faqs.map((f, i) => {
                      const { q, a } = getText(f);
                      return (
                        <tr key={i}>
                          <td>{q}</td>
                          <td>{a}</td>
                          <td>
                            <IonButton size="small" onClick={() => openEditModal(i)}>
                              <IonIcon icon={createOutline} />
                            </IonButton>
                            <IonButton
                              size="small"
                              color="danger"
                              onClick={() => deleteFAQ(i)}
                            >
                              <IonIcon icon={trashOutline} />
                            </IonButton>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mobile-only faq-cards">
                  {faqs.map((f, i) => {
                    const { q, a } = getText(f);
                    return (
                      <div key={i} className="faq-card">
                        <p><strong>Q:</strong> {q}</p>
                        <p><strong>A:</strong> {a}</p>
                        <div className="card-actions">
                          <IonButton size="small" onClick={() => openEditModal(i)}>
                            <IonIcon icon={createOutline} />
                          </IonButton>
                          <IonButton
                            size="small"
                            color="danger"
                            onClick={() => deleteFAQ(i)}
                          >
                            <IonIcon icon={trashOutline} />
                          </IonButton>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </IonContent>

        {/* Modal */}
        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          className="faq-modal"
        >
          <div className="modal-container">
            <div className="modal-header">
              <h2>{editingIndex !== null ? "Edit FAQ" : "New FAQ"}</h2>
              <IonButton
                fill="clear"
                color="medium"
                onClick={() => setShowModal(false)}
              >
                <IonIcon icon={closeOutline} />
              </IonButton>
            </div>

            <div className="modal-body">
              <IonList className="form-list">
                <IonItem>
                  <IonLabel position="stacked">Question (Filipino)</IonLabel>
                  <IonInput
                    value={form.questionFil}
                    onIonChange={(e) => handleChange("questionFil", e.detail.value || "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Answer (Filipino)</IonLabel>
                  <IonTextarea
                    autoGrow
                    value={form.answerFil}
                    onIonChange={(e) => handleChange("answerFil", e.detail.value || "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Question (English)</IonLabel>
                  <IonInput
                    value={form.questionEng}
                    onIonChange={(e) => handleChange("questionEng", e.detail.value || "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Answer (English)</IonLabel>
                  <IonTextarea
                    autoGrow
                    value={form.answerEng}
                    onIonChange={(e) => handleChange("answerEng", e.detail.value || "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Question (Bisaya)</IonLabel>
                  <IonInput
                    value={form.questionBis}
                    onIonChange={(e) => handleChange("questionBis", e.detail.value || "")}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="stacked">Answer (Bisaya)</IonLabel>
                  <IonTextarea
                    autoGrow
                    value={form.answerBis}
                    onIonChange={(e) => handleChange("answerBis", e.detail.value || "")}
                  />
                </IonItem>
              </IonList>
            </div>

            <div className="modal-footer">
              <IonButton expand="block" onClick={saveFAQ}>
                {editingIndex !== null ? "Update" : "Save"}
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonPage>
    </MainLayout>
  );
};

export default AdminFAQ;
