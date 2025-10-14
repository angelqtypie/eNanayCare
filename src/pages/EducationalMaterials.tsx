import React, { useEffect, useState } from "react";
import { IonSpinner, IonBadge, IonButton, IonModal } from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";
import { motion, AnimatePresence } from "framer-motion";

/* ========================================
   TYPE DEFINITIONS
======================================== */
interface Material {
  id: string;
  title: string;
  category: string;
  content: string;
  image_url: string;
  created_at?: string | null;
  source?: string;
}

/* ========================================
   BUILT-IN MATERIALS (DEFAULT DATA)
======================================== */
const BUILT_IN_MATERIALS: Material[] = [
  {
    id: "m1",
    title: "Pregnancy Nutrition Essentials (DOH)",
    category: "Nutrition",
    image_url: "https://cdn-icons-png.flaticon.com/512/2966/2966487.png",
    content: `A balanced diet keeps you and your baby healthy. Include fruits, vegetables, and protein daily.
✅ Eat small frequent meals
✅ Drink 8–10 glasses of water
✅ Take your prenatal vitamins regularly
✅ Avoid alcohol and smoking

🍎 Healthy mama = healthy baby!`,
    source: "DOH Maternal Health Guide",
  },
  {
    id: "m2",
    title: "Signs of Pregnancy Danger (WHO)",
    category: "Risk Awareness",
    image_url: "https://cdn-icons-png.flaticon.com/512/3209/3209048.png",
    content: `⚠️ Seek medical help immediately if you experience:
- Severe headache or blurred vision
- Heavy bleeding or leaking fluid
- Swelling of hands and face
- Abdominal pain or fever
- Decreased baby movement`,
    source: "WHO Maternal Safety Guide",
  },
  {
    id: "m3",
    title: "Preparing for Safe Delivery",
    category: "Delivery Readiness",
    image_url: "https://cdn-icons-png.flaticon.com/512/3176/3176292.png",
    content: `Before labor starts:
👜 Prepare your hospital bag early:
- Maternity book & ID
- Clothes, baby blanket
- Toiletries & snacks

🏥 Know your nearest birthing center and transport plan.`,
    source: "DOH Safe Motherhood Program",
  },
  {
    id: "m4",
    title: "Postpartum Care for Mothers",
    category: "Postpartum Care",
    image_url: "https://cdn-icons-png.flaticon.com/512/4849/4849837.png",
    content: `Your body needs recovery after giving birth. 💕
- Rest and eat nutritious meals
- Keep your wound clean and dry
- Breastfeed your baby frequently
- Avoid heavy work for at least 6 weeks
- Visit your health center for check-ups`,
    source: "DOH Postpartum Guide",
  },
  {
    id: "m5",
    title: "Baby Immunization Schedule",
    category: "Immunization",
    image_url: "https://cdn-icons-png.flaticon.com/512/3048/3048704.png",
    content: `💉 Vaccines protect your baby from serious diseases.
Here’s the basic immunization schedule:
- BCG & Hepatitis B: at birth
- DPT, Polio, Hib: 6, 10, 14 weeks
- Measles: 9 months`,
    source: "DOH Immunization Guide",
  },
  {
    id: "m6",
    title: "Caring for Your Mental Health",
    category: "Mental Health",
    image_url: "https://cdn-icons-png.flaticon.com/512/2821/2821637.png",
    content: `It’s normal to feel emotional changes during pregnancy.
💗 Tips to manage stress:
- Talk about your feelings
- Rest often
- Ask help from family or friends
- If sadness persists, consult your health worker.`,
    source: "WHO Mental Health Support",
  },
];

/* ========================================
   COMPONENT
======================================== */
const EducationalMaterials: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>(BUILT_IN_MATERIALS);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [activeMaterial, setActiveMaterial] = useState<Material | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data } = await supabase
          .from("educational_materials")
          .select("id, title, category, content, image_url, created_at")
          .eq("is_published", true);
        if (data && data.length > 0) {
          setMaterials([...BUILT_IN_MATERIALS, ...data]);
        }
      } catch {
        console.warn("⚠️ Using built-in materials only.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const categories = ["All", ...Array.from(new Set(materials.map((m) => m.category)))];
  const filtered =
    selectedCategory === "All"
      ? materials
      : materials.filter((m) => m.category === selectedCategory);

  return (
    <MotherMainLayout>
      {/* HERO */}
      <motion.section
        className="edu-hero glassy-hero"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>Learn & Grow 🌷</h2>
        <p>Curated maternal and baby care guides from DOH & WHO</p>
      </motion.section>

      {/* CATEGORY FILTER */}
      <motion.div
        className="cat-row"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {categories.map((c) => (
          <button
            key={c}
            className={`cat-chip ${selectedCategory === c ? "active" : ""}`}
            onClick={() => setSelectedCategory(c)}
          >
            {c}
          </button>
        ))}
      </motion.div>

      {/* MATERIAL GRID */}
      {loading ? (
        <div className="spinner-wrap">
          <IonSpinner name="crescent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">No materials available 💖</div>
      ) : (
        <div className="materials-grid">
          <AnimatePresence>
            {filtered.map((m) => (
              <motion.div
                key={m.id}
                className="mat-card glassy-card"
                onClick={() => {
                  setActiveMaterial(m);
                  setModalOpen(true);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <img src={m.image_url} alt={m.title} className="mat-img" />
                <div className="mat-body">
                  <IonBadge color="light" className="mat-cat">
                    {m.category}
                  </IonBadge>
                  <h3>{m.title}</h3>
                  <p>
                    {m.content.slice(0, 100)}
                    {m.content.length > 100 && "..."}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <IonModal
        isOpen={modalOpen}
        onDidDismiss={() => setModalOpen(false)}
        className="edu-modal"
      >
        <AnimatePresence>
          {activeMaterial && (
            <motion.div
              className="modal-inner"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <div className="modal-header">
                <img
                  src={activeMaterial.image_url}
                  alt={activeMaterial.title}
                  className="modal-img"
                />
                <div className="modal-title">
                  <h2>{activeMaterial.title}</h2>
                  <span className="mat-cat">{activeMaterial.category}</span>
                </div>
              </div>

              <div className="modal-body">
                <p className="modal-content">{activeMaterial.content}</p>
                {activeMaterial.source && (
                  <p className="modal-source">
                    📖 Source: {activeMaterial.source}
                  </p>
                )}
              </div>

              <IonButton expand="block" fill="outline" onClick={() => setModalOpen(false)}>
                Close
              </IonButton>
            </motion.div>
          )}
        </AnimatePresence>
      </IonModal>

      {/* STYLING */}
      <style>{`
        /* HERO */
        .glassy-hero {
          background: linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7);
          backdrop-filter: blur(10px);
          color: #6a3a55;
          padding: 40px 20px 30px;
          border-radius: 0 0 40px 40px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .glassy-hero h2 {
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 6px;
        }
        .glassy-hero p {
          font-size: 0.95rem;
          opacity: 0.8;
        }

        /* CATEGORIES */
        .cat-row {
          display: flex;
          overflow-x: auto;
          gap: 10px;
          padding: 14px 18px;
          scrollbar-width: none;
        }
        .cat-chip {
          background: rgba(255,255,255,0.8);
          color: #a24a75;
          border: 1px solid #f1cde1;
          border-radius: 25px;
          padding: 8px 18px;
          font-weight: 500;
          transition: all 0.25s;
        }
        .cat-chip.active {
          background: linear-gradient(135deg, #dfa6c8, #f3bcd9);
          color: white;
          box-shadow: 0 4px 10px rgba(223,166,200,0.4);
        }

        /* GRID */
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
          gap: 14px;
          padding: 15px;
        }

        .glassy-card {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
          transition: all 0.25s ease;
          cursor: pointer;
          overflow: hidden;
        }

        .mat-img {
          width: 100%;
          height: 130px;
          object-fit: contain;
          background: linear-gradient(135deg, #fff, #fcebf4);
        }

        .mat-body {
          padding: 12px 14px 16px;
        }

        .mat-cat {
          background: #fde9f3;
          color: #b05d8b;
          font-size: 0.75rem;
          margin-bottom: 8px;
          border-radius: 12px;
          padding: 2px 8px;
        }

        .mat-body h3 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #9a4578;
          margin: 4px 0 6px;
        }

        .mat-body p {
          font-size: 0.8rem;
          color: #555;
          line-height: 1.35;
        }

        .spinner-wrap, .empty {
          text-align: center;
          margin: 30px;
          color: #a24a75;
        }

        /* MODAL */
        .edu-modal {
          --background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .modal-inner {
          background: rgba(255,255,255,0.95);
          backdrop-filter: blur(12px);
          border-radius: 24px;
          padding: 20px 18px;
          margin: 10px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        }
        .modal-header {
          text-align: center;
        }
        .modal-img {
          width: 85px;
          height: 85px;
          object-fit: contain;
          border-radius: 50%;
          margin-bottom: 10px;
        }
        .modal-title h2 {
          color: #a24a75;
          font-size: 1.05rem;
          font-weight: 700;
        }
        .modal-body {
          margin-top: 10px;
          text-align: left;
        }
        .modal-content {
          white-space: pre-line;
          color: #444;
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 10px;
        }
        .modal-source {
          font-size: 0.8rem;
          color: #888;
          text-align: right;
        }

        @media (max-width: 450px) {
          .materials-grid { grid-template-columns: repeat(2, 1fr); }
          .mat-img { height: 110px; }
          .modal-inner { max-height: 90vh; }
        }
      `}</style>
    </MotherMainLayout>
  );
};

export default EducationalMaterials;
