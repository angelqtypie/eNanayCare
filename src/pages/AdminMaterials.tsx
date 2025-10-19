import React, { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { IonIcon } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import AdminMainLayout from "../layouts/AdminLayout";
import {
  addCircleOutline,
  createOutline,
  trashOutline,
  bookOutline,
  eyeOutline,
  closeOutline,
  cloudUploadOutline,
} from "ionicons/icons";

interface Material {
  id?: string;
  title: string;
  category: string;
  content: string;
  image_url?: string;
  created_at?: string;
}

const AdminEducationalMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [newMaterial, setNewMaterial] = useState<Material>({
    title: "",
    category: "",
    content: "",
    image_url: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const fallbackImages = [
    "https://images.unsplash.com/photo-1606851092832-622a8cbfe8a4?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1576765607924-3f7b09f6c1a2?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1573497019627-3b9d6c6a1210?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1615474025703-4fa0c49eae50?auto=format&fit=crop&w=800&q=80",
  ];

  const fetchMaterials = async () => {
    const { data, error } = await supabase
      .from("educational_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching materials:", error);
    else setMaterials(data || []);
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const uploadImageAndGetUrl = async (file: File) => {
    setUploading(true);
    try {
      const fileName = `${Date.now()}_${file.name.replace(/\s+/g, "_")}`;
      const { data, error } = await supabase.storage
        .from("educational-images")
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error("Upload failed:", error);
        alert("Image upload failed. Please check your Supabase bucket policy.");
        return "";
      }

      const { data: publicUrlData } = supabase.storage
        .from("educational-images")
        .getPublicUrl(fileName);

      return publicUrlData?.publicUrl || "";
    } catch (err) {
      console.error("Upload error:", err);
      return "";
    } finally {
      setUploading(false);
    }
  };

  const getRandomFallback = () =>
    fallbackImages[Math.floor(Math.random() * fallbackImages.length)];

  const handleAdd = async () => {
    if (!newMaterial.title || !newMaterial.category || !newMaterial.content) {
      alert("Please fill in all required fields.");
      return;
    }

    let imageUrl = newMaterial.image_url?.trim() || "";
    if (file) imageUrl = await uploadImageAndGetUrl(file);
    if (!imageUrl) imageUrl = getRandomFallback();

    const { data, error } = await supabase
      .from("educational_materials")
      .insert([
        {
          title: newMaterial.title,
          category: newMaterial.category,
          content: newMaterial.content,
          image_url: imageUrl,
        },
      ])
      .select();

    if (error) {
      console.error("Add material failed:", error);
      alert("Failed to add material.");
    } else {
      alert("✅ Material added successfully!");
      setMaterials([...(data || []), ...materials]);
      setNewMaterial({ title: "", category: "", content: "", image_url: "" });
      setFile(null);
      setPreviewUrl("");
    }
  };

  const handleEdit = (item: Material) => {
    setIsEditing(true);
    setNewMaterial(item);
    setPreviewUrl(item.image_url || "");
  };

  const handleUpdate = async () => {
    if (!newMaterial.id) return alert("Invalid material selected.");

    let imageUrl = newMaterial.image_url || "";
    if (file) imageUrl = await uploadImageAndGetUrl(file);
    if (!imageUrl) imageUrl = getRandomFallback();

    const { error } = await supabase
      .from("educational_materials")
      .update({
        title: newMaterial.title,
        category: newMaterial.category,
        content: newMaterial.content,
        image_url: imageUrl,
      })
      .eq("id", newMaterial.id);

    if (error) {
      console.error("Update failed:", error);
      alert("Failed to update.");
    } else {
      alert("✅ Material updated!");
      setIsEditing(false);
      setNewMaterial({ title: "", category: "", content: "", image_url: "" });
      setFile(null);
      setPreviewUrl("");
      fetchMaterials();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    const { error } = await supabase.from("educational_materials").delete().eq("id", id);
    if (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete.");
    } else {
      alert("🗑️ Deleted successfully!");
      setMaterials(materials.filter((m) => m.id !== id));
    }
  };

  const handleView = (material: Material) => setSelectedMaterial(material);
  const closeView = () => setSelectedMaterial(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setPreviewUrl(URL.createObjectURL(uploadedFile));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  return (
    <AdminMainLayout>
      <div className="materials-container">
        <h1>
          <IonIcon icon={bookOutline} /> Maternal Health Educational Materials
        </h1>
        <p>Manage and upload verified educational resources for maternal and child health awareness.</p>

        <div className="materials-form">
          <input
            type="text"
            placeholder="Title"
            value={newMaterial.title}
            onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
          />
          <select
            value={newMaterial.category}
            onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <textarea
            placeholder="Content / Summary"
            value={newMaterial.content}
            onChange={(e) => setNewMaterial({ ...newMaterial, content: e.target.value })}
          />

          <div {...getRootProps()} className={`dropzone ${isDragActive ? "active" : ""}`}>
            <input {...getInputProps()} />
            <IonIcon icon={cloudUploadOutline} size="large" />
            {isDragActive ? <p>Drop the image here...</p> : <p>Drag & drop or click to upload</p>}
          </div>
          {previewUrl && <img src={previewUrl} alt="Preview" className="preview-image" />}

          {isEditing ? (
            <button className="update" onClick={handleUpdate}>
              <IonIcon icon={createOutline} /> Update
            </button>
          ) : (
            <button className="add" onClick={handleAdd} disabled={uploading}>
              <IonIcon icon={addCircleOutline} /> {uploading ? "Uploading..." : "Add"}
            </button>
          )}
        </div>

        <div className="materials-grid">
          {materials.length === 0 ? (
            <p className="empty">No materials yet. Add one!</p>
          ) : (
            materials.map((m) => (
              <div key={m.id} className="material-card">
                <img src={m.image_url || getRandomFallback()} alt={m.title} />
                <div className="info">
                  <h3>{m.title}</h3>
                  <span className="cat">{m.category}</span>
                  <p>{m.content.substring(0, 100)}...</p>
                </div>
                <div className="actions">
                  <button onClick={() => handleView(m)}><IonIcon icon={eyeOutline} /></button>
                  <button onClick={() => handleEdit(m)}><IonIcon icon={createOutline} /></button>
                  <button onClick={() => handleDelete(m.id!)}><IonIcon icon={trashOutline} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedMaterial && (
        <div className="modal">
          <div className="modal-content">
            <button className="close" onClick={closeView}><IonIcon icon={closeOutline} /></button>
            <h2>{selectedMaterial.title}</h2>
            {selectedMaterial.image_url && (
              <img src={selectedMaterial.image_url} alt={selectedMaterial.title} />
            )}
            <div className="modal-text">
              <p>{selectedMaterial.content}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .materials-container { padding: 30px; background: linear-gradient(180deg, #f8e9ef 0%, #fdf5f8 100%); min-height:100vh; }
        h1 { color:#6d214f; font-weight:800; margin-bottom:6px; display:flex; align-items:center; gap:8px; }
        .materials-form { background:#fff; border:1px solid #f4d1e0; border-radius:18px; padding:20px; margin-bottom:28px; box-shadow:0 2px 8px rgba(217,82,140,0.15); }
        input, select, textarea { width:100%; padding:10px 12px; margin-bottom:12px; border:1px solid #e3b7cb; border-radius:12px; font-size:0.95rem; }
        button { background: linear-gradient(135deg,#d6639c,#f197ba); color:#fff; border:none; padding:10px 18px; border-radius:12px; cursor:pointer; font-weight:600; transition: transform 0.2s ease, background 0.3s ease; }
        button:hover { transform: translateY(-2px); background: linear-gradient(135deg,#a43c6b,#d45b94); }
        .materials-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
        .material-card { background:#fff; border-radius:16px; overflow:hidden; box-shadow:0 4px 14px rgba(0,0,0,0.05); transition:all 0.3s ease; position:relative; }
        .material-card:hover { transform:translateY(-4px); box-shadow:0 8px 18px rgba(167,61,104,0.2); }
        .material-card img { width:100%; height:150px; object-fit:cover; }
        .info { padding:14px; }
        .info h3 { color:#6b214e; font-weight:700; }
        .cat { color:#b05d8b; font-weight:600; font-size:0.85rem; }
        .actions { position:absolute; top:10px; right:10px; display:flex; gap:8px; }
        .actions button { background:#fff; color:#a24a75; border-radius:8px; padding:5px 7px; }
        .modal { position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; }
        .modal-content { background:#fff; border-radius:18px; padding:24px 28px; max-width:700px; width:90%; position:relative; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; }
        .modal-content img { width:100%; max-height:260px; object-fit:contain; border-radius:12px; margin-bottom:16px; }
        .modal-text { overflow-y:auto; padding-right:8px; flex:1; }
        .modal-text p { white-space:pre-wrap; line-height:1.6; color:#333; }
        .close { position:absolute; top:10px; right:14px; background:#f8d7e0; color:#8a2957; border:none; border-radius:50%; width:32px; height:32px; font-size:1.2rem; cursor:pointer; }
        .dropzone { border:2px dashed #d6639c; padding:20px; text-align:center; cursor:pointer; border-radius:12px; margin-bottom:12px; transition: background 0.3s ease; }
        .dropzone.active { background:#fce4f3; }
        .preview-image { max-width:100%; max-height:180px; margin-top:10px; border-radius:12px; object-fit:cover; }
      `}</style>
    </AdminMainLayout>
  );
};

export default AdminEducationalMaterials;
