import React, { useState, useEffect } from "react";
import { IonIcon } from "@ionic/react";
import {
  addCircleOutline,
  createOutline,
  trashOutline,
  chatbubblesOutline,
  closeOutline,
} from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";

const AdminChatbotQA: React.FC = () => {
  const [qaList, setQaList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQA, setSelectedQA] = useState<any>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
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
    setQuestion("");
    setAnswer("");
    setSelectedQA(null);
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
      <div className="qa-container">
        <h1>
          <IonIcon icon={chatbubblesOutline} /> Chatbot Questions & Answers
        </h1>
        <p>Manage verified chatbot Q&A used for automated maternal health guidance.</p>

        <button className="add-btn" onClick={openAddModal}>
          <IonIcon icon={addCircleOutline} /> Add New Question
        </button>

        <div className="qa-list">
          {qaList.length === 0 ? (
            <p className="empty">No chatbot Q&A found. Add one!</p>
          ) : (
            qaList.map((qa) => (
              <div key={qa.id} className="qa-card">
                <div className="qa-header">
                  <h3>Q: {qa.question}</h3>
                </div>
                <p className="qa-answer">
                  <strong>A:</strong> {qa.answer}
                </p>
                <div className="qa-actions">
                  <button className="edit" onClick={() => openEditModal(qa)}>
                    <IonIcon icon={createOutline} /> Edit
                  </button>
                  <button className="delete" onClick={() => deleteQA(qa.id)}>
                    <IonIcon icon={trashOutline} /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <button className="close" onClick={() => setShowModal(false)}>
                <IonIcon icon={closeOutline} />
              </button>
              <h2>{isEditing ? "Edit Question & Answer" : "Add New Question & Answer"}</h2>
              <input
                type="text"
                placeholder="Enter question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <textarea
                placeholder="Enter answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
              />
              <button className="save-btn" onClick={saveQA} disabled={loading}>
                {loading ? "Saving..." : isEditing ? "Update" : "Add"}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .qa-container {
          padding: 30px;
          background: linear-gradient(180deg, #f8e9ef 0%, #fdf5f8 100%);
          min-height: 100vh;
        }
        h1 {
          color: #6d214f;
          font-weight: 800;
          margin-bottom: 6px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        p {
          color: #6b4b5c;
          margin-bottom: 16px;
        }
        .add-btn {
          background: linear-gradient(135deg, #d6639c, #f197ba);
          color: #fff;
          border: none;
          padding: 10px 18px;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          transition: 0.3s;
        }
        .add-btn:hover {
          background: linear-gradient(135deg, #a43c6b, #d45b94);
        }
        .qa-list {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 18px;
        }
        .qa-card {
          background: #fff;
          border-radius: 16px;
          padding: 18px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
          border: 1px solid #f2d4e0;
          transition: all 0.3s ease;
        }
        .qa-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 16px rgba(167, 61, 104, 0.2);
        }
        .qa-header h3 {
          color: #8a2957;
          margin-bottom: 10px;
          font-weight: 700;
        }
        .qa-answer {
          color: #333;
          line-height: 1.6;
          margin-bottom: 14px;
        }
        .qa-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        .qa-actions button {
          border: none;
          border-radius: 10px;
          padding: 6px 10px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .qa-actions .edit {
          background: #f4c5db;
          color: #6b1f4d;
        }
        .qa-actions .edit:hover {
          background: #eaa0c8;
        }
        .qa-actions .delete {
          background: #f9b5b5;
          color: #8b1f1f;
        }
        .qa-actions .delete:hover {
          background: #f57a7a;
        }

        /* Modal */
        .modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }
        .modal-content {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          position: relative;
          display: flex;
          flex-direction: column;
        }
        .modal-content input, 
        .modal-content textarea {
          width: 100%;
          padding: 10px;
          margin-top: 10px;
          border: 1px solid #e3b7cb;
          border-radius: 10px;
          font-size: 0.95rem;
          font-family: 'Poppins', sans-serif;
        }
        .save-btn {
          margin-top: 15px;
          background: linear-gradient(135deg, #d6639c, #f197ba);
          border: none;
          color: #fff;
          padding: 10px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.3s;
        }
        .save-btn:hover {
          background: linear-gradient(135deg, #a43c6b, #d45b94);
        }
        .close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: #f8d7e0;
          color: #8a2957;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          font-size: 1.2rem;
          cursor: pointer;
        }
        .empty {
          color: #999;
          text-align: center;
          font-style: italic;
        }
      `}</style>
    </AdminMainLayout>
  );
};

export default AdminChatbotQA;
