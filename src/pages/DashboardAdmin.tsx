// src/pages/DashboardAdmin.tsx
import React, { useEffect, useState } from "react";
import {
  IonIcon,
  IonButton,
  IonInput,
  IonTextarea,
  IonModal,
  IonCheckbox,
  IonLabel,
} from "@ionic/react";
import {
  peopleCircleOutline,
  bookOutline,
  megaphoneOutline,
  addCircleOutline,
  closeOutline,
  createOutline,
  trashOutline,
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
  const [updates, setUpdates] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<any>(null);
  const [newUpdate, setNewUpdate] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    is_permanent: false,
  });

  /** ✅ FETCH USER COUNTS */
  const fetchCounts = async () => {
    try {
      const { data: users } = await supabase.from("users").select("role");
      const { count: materials } = await supabase
        .from("educational_materials")
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

  /** ✅ FETCH UPDATES + AUTO DELETE OVERDUE */
  const fetchUpdates = async () => {
    const { data, error } = await supabase
      .from("barangay_updates")
      .select("*")
      .order("start_date", { ascending: false });

    if (error) {
      console.error(error);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiredIds: number[] = [];
    const validUpdates = data?.filter((u: any) => {
      if (u.is_permanent) return true; // permanent ones stay forever
      const end = u.end_date ? new Date(u.end_date) : new Date(u.start_date);
      if (end < today) {
        expiredIds.push(u.id);
        return false;
      }
      return true;
    });

    // 🧹 Auto delete expired updates
    if (expiredIds.length > 0) {
      await supabase.from("barangay_updates").delete().in("id", expiredIds);
      console.log("Deleted expired updates:", expiredIds);
    }

    setUpdates(validUpdates || []);
  };

  /** ✅ ADD OR EDIT UPDATE */
  const handleSaveUpdate = async () => {
    if (!newUpdate.title || !newUpdate.description || !newUpdate.start_date) {
      alert("Please fill in title, description, and start date.");
      return;
    }

    if (editingUpdate) {
      const { error } = await supabase
        .from("barangay_updates")
        .update({
          title: newUpdate.title,
          description: newUpdate.description,
          start_date: newUpdate.start_date,
          end_date: newUpdate.is_permanent ? null : newUpdate.end_date || null,
          is_permanent: newUpdate.is_permanent,
        })
        .eq("id", editingUpdate.id);

      if (error) {
        alert("❌ Failed to update record.");
        console.error(error);
      } else {
        alert("✅ Update edited successfully.");
      }
    } else {
      const { data: user } = await supabase.auth.getUser();
      const postedBy = user?.user?.id || null;

      const { error } = await supabase.from("barangay_updates").insert([
        {
          title: newUpdate.title,
          description: newUpdate.description,
          start_date: newUpdate.start_date,
          end_date: newUpdate.is_permanent ? null : newUpdate.end_date || null,
          is_permanent: newUpdate.is_permanent,
          posted_by: postedBy,
        },
      ]);

      if (error) {
        alert("❌ Failed to add update.");
        console.error(error);
      } else {
        alert("✅ Barangay update added successfully.");
      }
    }

    setShowModal(false);
    setEditingUpdate(null);
    setNewUpdate({
      title: "",
      description: "",
      start_date: "",
      end_date: "",
      is_permanent: false,
    });
    fetchUpdates();
  };

  /** ✅ DELETE UPDATE */
  const handleDeleteUpdate = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this update?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("barangay_updates").delete().eq("id", id);
    if (error) {
      alert("❌ Failed to delete update.");
      console.error(error);
    } else {
      alert("🗑️ Update deleted successfully.");
      fetchUpdates();
    }
  };

  /** ✅ EDIT UPDATE */
  const handleEdit = (update: any) => {
    setEditingUpdate(update);
    setNewUpdate({
      title: update.title,
      description: update.description,
      start_date: update.start_date,
      end_date: update.end_date || "",
      is_permanent: update.is_permanent || false,
    });
    setShowModal(true);
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
        {/* Header */}
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

        {/* Cards */}
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

        {/* ✅ Barangay Updates */}
        <div className="barangay-updates-section">
          <div className="updates-header">
            <h2>
              <IonIcon icon={megaphoneOutline} /> Barangay Updates
            </h2>
            <IonButton color="primary" onClick={() => setShowModal(true)}>
              <IonIcon icon={addCircleOutline} /> Add Update
            </IonButton>
          </div>

          {updates.length > 0 ? (
            <ul className="updates-list">
              {updates.map((update) => (
                <li key={update.id} className="update-item">
                  <div className="update-details">
                    <strong>{update.title}</strong>
                    <p>{update.description}</p>
                    {update.is_permanent ? (
                      <small>📅 Permanent / Recurring</small>
                    ) : (
                      <small>
                        📅 {new Date(update.start_date).toLocaleDateString()}
                        {update.end_date &&
                          ` - ${new Date(update.end_date).toLocaleDateString()}`}
                      </small>
                    )}
                  </div>
                  <div className="update-actions">
                    <IonButton size="small" color="warning" onClick={() => handleEdit(update)}>
                      <IonIcon icon={createOutline} />
                    </IonButton>
                    <IonButton size="small" color="danger" onClick={() => handleDeleteUpdate(update.id)}>
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">No active updates at the moment.</p>
          )}
        </div>

        {/* 🧩 Add/Edit Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <div className="modal-wrapper">
            <div className="modal-card">
              <div className="modal-header">
                <h2>{editingUpdate ? "Edit Barangay Update" : "Add Barangay Update"}</h2>
                <IonIcon
                  icon={closeOutline}
                  onClick={() => {
                    setShowModal(false);
                    setEditingUpdate(null);
                  }}
                  className="close-icon"
                />
              </div>

              <IonInput
                placeholder="Enter title"
                value={newUpdate.title}
                onIonChange={(e) => setNewUpdate({ ...newUpdate, title: e.detail.value! })}
              />
              <IonTextarea
                placeholder="Enter description"
                value={newUpdate.description}
                onIonChange={(e) => setNewUpdate({ ...newUpdate, description: e.detail.value! })}
              />
              <IonInput
                type="date"
                label="Start Date (required)"
                value={newUpdate.start_date}
                onIonChange={(e) => setNewUpdate({ ...newUpdate, start_date: e.detail.value! })}
              />
              {!newUpdate.is_permanent && (
                <IonInput
                  type="date"
                  label="End Date (optional)"
                  value={newUpdate.end_date}
                  onIonChange={(e) => setNewUpdate({ ...newUpdate, end_date: e.detail.value! })}
                />
              )}

              <div className="permanent-toggle">
                <IonCheckbox
                  checked={newUpdate.is_permanent}
                  onIonChange={(e) => setNewUpdate({ ...newUpdate, is_permanent: e.detail.checked })}
                />
                <IonLabel>Permanent / Recurring Update</IonLabel>
              </div>

              <IonButton expand="block" color="success" onClick={handleSaveUpdate}>
                {editingUpdate ? "Save Changes" : "Submit Update"}
              </IonButton>
            </div>
          </div>
        </IonModal>
      </div>
    </AdminMainLayout>
  );
};

export default DashboardAdmin;
