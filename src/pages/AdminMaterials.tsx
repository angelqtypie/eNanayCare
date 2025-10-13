import React, { useState } from "react";
import AdminMainLayout from "../layouts/AdminLayout";
import { IonIcon } from "@ionic/react";
import {
  addCircleOutline,
  createOutline,
  trashOutline,
  bookOutline,
  imageOutline,
  eyeOutline,
  closeOutline,
  linkOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  cloudDownloadOutline,
  sparklesOutline,
} from "ionicons/icons";
import "../styles/AdminMaterials.css";

interface Material {
  id: number;
  title: string;
  category: string;
  content: string;
  image?: string;
  source?: string;
}

const AdminEducationalMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState<Material>({
    id: 0,
    title: "",
    category: "",
    content: "",
    image: "",
    source: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(
    null
  );

  const [importUrl, setImportUrl] = useState("");
  const [loadingImport, setLoadingImport] = useState(false);

  const categories = [
    "Nutrition",
    "Prenatal Care",
    "Warning Signs",
    "Birth Preparation",
    "Postpartum Care",
    "Mental Health",
    "Family Planning",
    "Baby Care",
    "Others",
  ];

  // 🔍 Simulate fetching & summarizing a DOH/WHO article
  const handleImport = async () => {
    if (!importUrl) return alert("Please paste a valid link first.");
    setLoadingImport(true);

    // Simulated AI summary fetch
    await new Promise((res) => setTimeout(res, 1500)); // pretend loading
    const mockSummaries: Record<string, Material> = {
      "doh.gov.ph": {
        id: Date.now(),
        title: "Safe Pregnancy: DOH Maternal Care Tips",
        category: "Prenatal Care",
        content:
          "The Department of Health (DOH) advises all expectant mothers to visit health centers at least 4 times during pregnancy. Maintain a healthy diet rich in vegetables, and avoid smoking or alcohol. Early prenatal visits can detect risks early.",
        image: "https://cdn-icons-png.flaticon.com/512/4149/4149946.png",
        source: importUrl,
      },
      "who.int": {
        id: Date.now(),
        title: "WHO: Maternal Nutrition for a Healthy Baby",
        category: "Nutrition",
        content:
          "The World Health Organization emphasizes the importance of folate, iron, and clean drinking water during pregnancy. Proper nutrition supports healthy baby growth and prevents complications like anemia.",
        image: "https://cdn-icons-png.flaticon.com/512/2966/2966486.png",
        source: importUrl,
      },
      "unicef.org": {
        id: Date.now(),
        title: "UNICEF: Care for Mothers and Newborns",
        category: "Postpartum Care",
        content:
          "UNICEF encourages postnatal check-ups within 24 hours after birth. Mothers should rest, breastfeed exclusively, and seek care if they experience heavy bleeding or infection symptoms.",
        image: "https://cdn-icons-png.flaticon.com/512/3063/3063858.png",
        source: importUrl,
      },
    };

    const matched = Object.keys(mockSummaries).find((key) =>
      importUrl.includes(key)
    );

    const fetchedMaterial =
      mockSummaries[matched || "doh.gov.ph"] ||
      mockSummaries["doh.gov.ph"];

    setMaterials([...materials, fetchedMaterial]);
    setImportUrl("");
    setLoadingImport(false);
  };

  // Add new material manually
  const handleAdd = () => {
    if (!newMaterial.title || !newMaterial.category || !newMaterial.content)
      return alert("Please complete all fields.");
    const newItem = { ...newMaterial, id: Date.now() };
    setMaterials([...materials, newItem]);
    setNewMaterial({
      id: 0,
      title: "",
      category: "",
      content: "",
      image: "",
      source: "",
    });
  };

  // Edit material
  const handleEdit = (item: Material) => {
    setIsEditing(true);
    setNewMaterial(item);
  };

  const handleUpdate = () => {
    setMaterials(
      materials.map((m) => (m.id === newMaterial.id ? newMaterial : m))
    );
    setNewMaterial({
      id: 0,
      title: "",
      category: "",
      content: "",
      image: "",
      source: "",
    });
    setIsEditing(false);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Delete this material?"))
      setMaterials(materials.filter((m) => m.id !== id));
  };

  const handleView = (material: Material) => setSelectedMaterial(material);
  const closeView = () => setSelectedMaterial(null);

  return (
    <AdminMainLayout>
      <div className="materials-container">
        <h1>
          <IonIcon icon={bookOutline} /> Maternal Health Educational Materials
        </h1>
        <p>
          Admins can add or import verified health learning content for mothers
          based on official sources like DOH, WHO, or UNICEF Philippines.
        </p>


        {/* 🌐 Trusted Health Sites */}
        <div className="sources-box">
          <h3>
            <IonIcon icon={linkOutline} /> Official Maternal Health Sites
          </h3>
          <ul>
            <li>
              <a href="https://doh.gov.ph" target="_blank">
                Department of Health (DOH)
              </a>
            </li>
            <li>
              <a href="https://www.who.int/philippines" target="_blank">
                World Health Organization (WHO) Philippines
              </a>
            </li>
            <li>
              <a href="https://www.unicef.org/philippines" target="_blank">
                UNICEF Philippines
              </a>
            </li>
          </ul>
        </div>

        {/* 🌍 Import Official Article */}
        <div className="import-box">
          <h3>
            <IonIcon icon={cloudDownloadOutline} /> Auto Import from DOH / WHO /
            UNICEF
          </h3>
          <p>Paste a link to automatically fetch & summarize maternal info.</p>
          <div className="import-input">
            <input
              type="text"
              placeholder="Paste official article link..."
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
            />
            <button className="btn import" onClick={handleImport} disabled={loadingImport}>
              <IonIcon icon={sparklesOutline} />{" "}
              {loadingImport ? "Fetching..." : "Auto Import"}
            </button>
          </div>
        </div>

        {/* 🖋 Add / Edit Material */}
        <div className="materials-form">
          <input
            type="text"
            placeholder="Material Title"
            value={newMaterial.title}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, title: e.target.value })
            }
          />

          <select
            value={newMaterial.category}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, category: e.target.value })
            }
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>

          <textarea
            placeholder="Educational content summary"
            value={newMaterial.content}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, content: e.target.value })
            }
          ></textarea>

          <input
            type="text"
            placeholder="Image URL (optional)"
            value={newMaterial.image}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, image: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Source link (optional)"
            value={newMaterial.source}
            onChange={(e) =>
              setNewMaterial({ ...newMaterial, source: e.target.value })
            }
          />

          {isEditing ? (
            <button className="btn update" onClick={handleUpdate}>
              <IonIcon icon={createOutline} /> Update Material
            </button>
          ) : (
            <button className="btn add" onClick={handleAdd}>
              <IonIcon icon={addCircleOutline} /> Add Material
            </button>
          )}
        </div>

        {/* 🧾 Display Materials */}
        <div className="materials-grid">
          {materials.length === 0 ? (
            <p className="empty">No materials yet. Add or import one!</p>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="material-card">
                {m.image ? (
                  <img src={m.image} alt={m.title} className="material-image" />
                ) : (
                  <IonIcon icon={imageOutline} className="material-placeholder" />
                )}
                <div className="material-details">
                  <h3>{m.title}</h3>
                  <span className="category">{m.category}</span>
                  <p>{m.content.substring(0, 100)}...</p>
                  {m.source && (
                    <a href={m.source} target="_blank" className="source-link">
                      <IonIcon icon={linkOutline} /> Source
                    </a>
                  )}
                </div>
                <div className="material-actions">
                  <button className="view" onClick={() => handleView(m)}>
                    <IonIcon icon={eyeOutline} />
                  </button>
                  <button className="edit" onClick={() => handleEdit(m)}>
                    <IonIcon icon={createOutline} />
                  </button>
                  <button className="delete" onClick={() => handleDelete(m.id)}>
                    <IonIcon icon={trashOutline} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 📖 View Modal */}
      {selectedMaterial && (
        <div className="view-modal">
          <div className="view-content">
            <button className="close-btn" onClick={closeView}>
              <IonIcon icon={closeOutline} />
            </button>
            <h2>{selectedMaterial.title}</h2>
            {selectedMaterial.image && (
              <img
                src={selectedMaterial.image}
                alt={selectedMaterial.title}
                className="modal-image"
              />
            )}
            <p>{selectedMaterial.content}</p>
            {selectedMaterial.source && (
              <p className="source">
                <IonIcon icon={linkOutline} />{" "}
                <a href={selectedMaterial.source} target="_blank">
                  {selectedMaterial.source}
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </AdminMainLayout>
  );
};

export default AdminEducationalMaterials;
