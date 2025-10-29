import React, { useEffect, useState } from "react";
import { IonIcon, IonButton, IonInput, IonTextarea, IonModal } from "@ionic/react";
import {
  peopleCircleOutline,
  bookOutline,
  documentTextOutline,
  analyticsOutline,
  megaphoneOutline,
  addCircleOutline,
  closeOutline,
} from "ionicons/icons";
import { motion } from "framer-motion";
import { useHistory } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";
import "./DashboardAdmin.css";

const DashboardAdmin: React.FC = () => {
  const history = useHistory();
  const [counts, setCounts] = useState({
    total: 0,
    bhw: 0,
    mothers: 0,
    admins: 0,
    materials: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newUpdate, setNewUpdate] = useState({ title: "", description: "" });

  const fetchCounts = async () => {
    try {
      const { data: users } = await supabase.from("users").select("role");
      const { count: materials } = await supabase
        .from("educational_materials")
        .select("*", { count: "exact", head: true });
      const { count: reports } = await supabase
        .from("reports")
        .select("*", { count: "exact", head: true });

      if (users) {
        const total = users.length;
        const bhw = users.filter((u: any) => u.role === "bhw").length;
        const mothers = users.filter((u: any) => u.role === "mother").length;
        const admins = users.filter((u: any) => u.role === "admin").length;

        setCounts({
          total,
          bhw,
          mothers,
          admins,
          materials: materials || 0,
        });
      }
    } catch (err) {
      console.error("Error fetching counts:", err);
    }
  };



  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from("barangay_updates")
      .select("*")
      .order("date_posted", { ascending: false });
    if (error) console.error(error);
    else setUpdates(data || []);
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.title || !newUpdate.description) {
      alert("Please fill in all fields.");
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    const postedBy = user?.user?.id || null;

    const { error } = await supabase.from("barangay_updates").insert([
      {
        title: newUpdate.title,
        description: newUpdate.description,
        posted_by: postedBy,
      },
    ]);

    if (error) {
      alert("Failed to add update. Please try again.");
      console.error(error);
    } else {
      setShowModal(false);
      setNewUpdate({ title: "", description: "" });
      fetchUpdates();
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchUpdates();
  }, []);

  const cards = [
    {
      title: "Users",
      subtitle: `${counts.bhw} BHWs • ${counts.mothers} Mothers • ${counts.admins} Admins`,
      value: counts.total,
      icon: peopleCircleOutline,
      gradient: "linear-gradient(135deg, #ffb6c1, #ff66a3)",
      link: "/adminuserpage",
    },
    {
      title: "Materials",
      subtitle: "Educational Uploads",
      value: counts.materials,
      icon: bookOutline,
      gradient: "linear-gradient(135deg, #9ae6b4, #38a169)",
      link: "/adminmaterials",
    },
  ];

  return (
    <AdminMainLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, Admin</h1>
          <div className="date-box">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        <motion.div
          className="dashboard-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {cards.map((card, i) => (
            <motion.div
              key={i}
              className="dashboard-card"
              style={{ background: card.gradient }}
              whileHover={{ scale: 1.03 }}
              onClick={() => history.push(card.link)}
            >
              <div className="card-top">
                <IonIcon icon={card.icon} className="icon" />
                <h2>{card.title}</h2>
              </div>
              <p>{card.subtitle}</p>
              <span className="count">{card.value}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* ✅ Barangay Updates Section */}
        <div className="barangay-updates-section">
          <div className="updates-header">
            <h2>
              <IonIcon icon={megaphoneOutline} /> Barangay Updates
            </h2>
            <IonButton
              color="primary"
              onClick={() => setShowModal(true)}
              className="add-btn"
            >
              <IonIcon icon={addCircleOutline} /> Add Update
            </IonButton>
          </div>

          {updates.length > 0 ? (
            <ul className="updates-list">
              {updates.map((update) => (
                <li key={update.id}>
                  <strong>{update.title}</strong> — {update.description}
                  <br />
                  <small>
                    {new Date(update.date_posted).toLocaleString()}
                  </small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No updates posted yet.</p>
          )}
        </div>

        {/* 🧩 Modal for Adding Update */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Barangay Update</h2>
              <IonIcon
                icon={closeOutline}
                onClick={() => setShowModal(false)}
                className="close-icon"
              />
            </div>
            <IonInput
              placeholder="Enter title"
              value={newUpdate.title}
              onIonChange={(e) =>
                setNewUpdate({ ...newUpdate, title: e.detail.value! })
              }
            />
            <IonTextarea
              placeholder="Enter description"
              value={newUpdate.description}
              onIonChange={(e) =>
                setNewUpdate({ ...newUpdate, description: e.detail.value! })
              }
            />
            <IonButton expand="block" onClick={handleAddUpdate}>
              Submit Update
            </IonButton>
          </div>
        </IonModal>
      </div>
    </AdminMainLayout>
  );
};

export default DashboardAdmin;
