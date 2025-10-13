import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonModal,
  IonButton,
  IonBadge,
  IonSpinner,
} from "@ionic/react";
import { supabase } from "../utils/supabaseClient";
import MotherMainLayout from "../layouts/MotherMainLayout";
import "../styles/EducationalMaterials.css";

interface Material {
  id: string;
  title: string;
  category: string;
  content: string;
  image_url: string;
  created_at?: string | null;
  source?: string;
}

const BUILT_IN_MATERIALS: Material[] = [
  {
    id: "m1",
    title: "Pregnancy Nutrition Essentials (DOH)",
    category: "Nutrition",
    image_url: "https://cdn-icons-png.flaticon.com/512/2966/2966487.png",
    content: `A balanced diet keeps you and your baby healthy. Include fruits, vegetables, and protein daily. Avoid soft drinks, caffeine, and junk food.
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
- Decreased baby movement

🚑 Don’t wait—contact your midwife or health center right away.`,
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

🏥 Know your nearest birthing center and transport plan.
👩‍⚕️ Always have contact numbers of your midwife or BHW ready.`,
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
- Measles: 9 months
Keep your baby’s immunization card updated!`,
    source: "Philippine DOH Immunization Guide",
  },
  {
    id: "m6",
    title: "Caring for Your Mental Health",
    category: "Mental Health",
    image_url: "https://cdn-icons-png.flaticon.com/512/2821/2821637.png",
    content: `It’s normal to feel emotional changes during pregnancy.
💗 Tips to manage stress:
- Talk about your feelings
- Take short breaks & rest often
- Avoid negative thoughts
- Ask help from family or friends
- If you feel sad for long periods, talk to your health worker.`,
    source: "WHO Mental Health Support",
  },
];

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
        const { data, error } = await supabase
        .from("educational_materials")
        .select("id, title, category, content, image_url, created_at")
        .eq("is_published", true);
      

        if (!error && data && data.length > 0) {
          setMaterials([...BUILT_IN_MATERIALS, ...data]);
        }
      } catch (err) {
        
        console.warn("⚠️ Supabase fetch failed, using built-ins only.", err);
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
<MotherMainLayout >
  <section className="edu-hero">
    <h2>Learn & Grow 💕</h2>
    <p>Trusted maternal and baby care tips from DOH & WHO.</p>
  </section>

  <section className="cat-row">
    {categories.map((c) => (
      <button
        key={c}
        className={`cat-chip ${selectedCategory === c ? "active" : ""}`}
        onClick={() => setSelectedCategory(c)}
      >
        {c}
      </button>
    ))}
  </section>

  {loading ? (
    <div className="spinner-wrap">
      <IonSpinner name="crescent" />
    </div>
  ) : filtered.length === 0 ? (
    <div className="empty">No materials available 💖</div>
  ) : (
    <div className="materials-grid">
      {filtered.map((m) => (
        <div
          key={m.id}
          className="mat-card"
          onClick={() => {
            setActiveMaterial(m);
            setModalOpen(true);
          }}
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
        </div>
      ))}
    </div>
  )}

  <IonModal
    isOpen={modalOpen}
    onDidDismiss={() => setModalOpen(false)}
    className="edu-modal"
  >
    {activeMaterial && (
      <div className="modal-inner">
        <img
          src={activeMaterial.image_url}
          alt={activeMaterial.title}
          className="modal-img"
        />
        <div className="modal-banner">
          <h2>{activeMaterial.title}</h2>
          <div className="mat-cat">{activeMaterial.category}</div>
        </div>

        <div className="modal-scroll">
          <div className="modal-content">{activeMaterial.content}</div>
          {activeMaterial.source && (
            <p className="modal-source">
              📖 Source: {activeMaterial.source}
            </p>
          )}
        </div>

        <IonButton expand="block" onClick={() => setModalOpen(false)}>
          Close
        </IonButton>
      </div>
    )}
  </IonModal>
</MotherMainLayout>

  );
};

export default EducationalMaterials;
