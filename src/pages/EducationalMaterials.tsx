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
   PRELOADED EDUCATIONAL MATERIALS
======================================== */
const BUILT_IN_MATERIALS: Material[] = [
  {
    id: "m1",
    title: "🌸 Pregnancy Nutrition Essentials",
    category: "Nutrition",
    image_url: "https://cdn-icons-png.flaticon.com/512/2966/2966487.png",
    content: `Eating well is one of the greatest gifts you can give to your growing baby. 🥗  
- Include colorful fruits and leafy vegetables  
- Enjoy protein-rich foods like eggs, beans, and fish  
- Drink 8–10 glasses of water daily to stay hydrated  
- Take your prenatal vitamins every morning  
- Avoid alcohol, caffeine, and smoking  

A nourished mama builds a strong, healthy baby. 💕`,
    source: "DOH Maternal Health Guide",
  },
  {
    id: "m2",
    title: "🚨 Warning Signs During Pregnancy",
    category: "Warning Signs",
    image_url: "https://cdn-icons-png.flaticon.com/512/3209/3209048.png",
    content: `Always listen to your body, mama.  
Call or visit your health worker right away if you experience:  
⚠️ Severe headache or blurred vision  
⚠️ Sudden swelling in face or hands  
⚠️ Heavy bleeding or leaking fluid  
⚠️ Persistent fever or abdominal pain  
⚠️ Decreased baby movement  

Trust your instincts — your safety matters most. 💖`,
    source: "WHO Maternal Safety Guide",
  },
  {
    id: "m3",
    title: "👜 Preparing for Safe Delivery",
    category: "Birth Preparation",
    image_url: "https://cdn-icons-png.flaticon.com/512/3176/3176292.png",
    content: `As your due date approaches, stay ready and calm. 🌼  
Pack your hospital bag early with:  
- Maternity book, ID, and health records  
- Comfortable clothes and baby blanket  
- Toiletries, snacks, and water bottle  

💗 Know your nearest birthing center and your emergency transport plan.  
Prepared mama = safe, confident birth.`,
    source: "DOH Safe Motherhood Program",
  },
  {
    id: "m4",
    title: "🤱 Postpartum Care for New Mothers",
    category: "Postpartum Care",
    image_url: "https://cdn-icons-png.flaticon.com/512/4849/4849837.png",
    content: `You’ve brought life into the world — now it’s time to care for *you*. 🌷  
- Rest whenever your baby sleeps  
- Eat balanced meals to recover strength  
- Keep your wound clean and dry  
- Breastfeed frequently and drink lots of water  
- Avoid heavy lifting for at least 6 weeks  
- Schedule your postnatal check-up  

Remember: healing takes time and love. You’re doing great, mama. 💞`,
    source: "DOH Postpartum Guide",
  },
  {
    id: "m5",
    title: "💉 Baby Immunization Schedule",
    category: "Immunization",
    image_url: "https://cdn-icons-png.flaticon.com/512/3048/3048704.png",
    content: `Vaccines are your baby’s shield against serious diseases. 🌈  
Here’s the recommended schedule:  
👶 BCG & Hepatitis B – at birth  
🍼 DPT, Polio, Hib – 6, 10, and 14 weeks  
🌼 Measles – 9 months  

Keep your baby’s immunization card safe and updated. A protected baby is a happy baby! 💚`,
    source: "DOH Immunization Guide",
  },
  {
    id: "m6",
    title: "💗 Caring for Your Mental Health",
    category: "Mental Health",
    image_url: "https://cdn-icons-png.flaticon.com/512/2821/2821637.png",
    content: `Pregnancy brings changes — physical, emotional, and mental. 🌸  
It’s okay to feel overwhelmed sometimes. Here are gentle reminders:  
✨ Rest and breathe deeply  
✨ Share your feelings with loved ones  
✨ Accept help — you don’t have to do it all  
✨ Consult your health worker if sadness lingers  

You’re stronger than you think, mama. 💕`,
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

  const categories = [
    "All", 
    "Nutrition", 
    "Prenatal Care", 
    "Warning Signs", 
    "Birth Preparation", 
    "Postpartum Care", 
    "Mental Health", 
    "Family Planning", 
    "Baby Care", 
    "Immunization",
    "Others"
  ];

  const filtered =
    selectedCategory === "All"
      ? materials
      : materials.filter((m) => m.category === selectedCategory);

  return (
    <MotherMainLayout>
      {/* HERO */}
      <motion.section
        className="edu-hero"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2>🌷 Learn & Bloom, Mama</h2>
        <p>
          Gentle guidance and inspiring tips for every stage of motherhood — from pregnancy to postpartum. 💖
        </p>
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
                className="mat-card"
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

      {/* INTERACTIVE MODAL */}
      <IonModal
        isOpen={modalOpen}
        onDidDismiss={() => setModalOpen(false)}
        className="edu-modal"
        backdropDismiss
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
        .edu-hero {
          background: linear-gradient(120deg, #f9e0eb, #fbeaf1, #faf2f7);
          backdrop-filter: blur(10px);
          color: #6a3a55;
          padding: 40px 20px 30px;
          border-radius: 0 0 40px 40px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .edu-hero h2 {
          font-weight: 700;
          font-size: 1.4rem;
          margin-bottom: 6px;
        }
        .edu-hero p {
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

        .mat-card {
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
