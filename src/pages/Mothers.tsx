import React, { useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonModal,
  IonItem,
  IonLabel,
  IonInput,
  IonList,
  IonSpinner,
  IonToast,
  IonSearchbar,
  IonIcon,
} from "@ionic/react";
import { addCircleOutline, closeOutline } from "ionicons/icons";
import { supabase } from "../utils/supabaseClient";
import MainLayout from "../layouts/MainLayouts";

interface Mother {
  mother_id?: string;
  user_id?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  birthdate: string;
  age: number;
  civil_status: string;
  address: string;
  contact_number: string;
  husband_name: string;
  education: string;
  religion: string;
  lmp_date?: string;
  edc?: string;
  gpa?: string;
  aog?: string;
  email: string;
  password: string;
  users?: { email: string };
}

const Mothers: React.FC = () => {
  const [mothers, setMothers] = useState<Mother[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
const [selectedMother, setSelectedMother] = useState<Mother | null>(null);


  const [formData, setFormData] = useState<Mother>({
    first_name: "",
    middle_name: "",
    last_name: "",
    birthdate: "",
    age: 0,
    civil_status: "",
    address: "",
    contact_number: "",
    husband_name: "",
    education: "",
    religion: "",
    lmp_date: "",
    edc: "",
    gpa: "",
    aog: "",
    email: "",
    password: "",
  });

  const fetchMothers = async () => {
    setLoading(true);
  
    //  1. Get current authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
  
    if (authError || !user) {
      console.error("Auth Error:", authError);
      setToastMsg("Failed to fetch user info.");
      setLoading(false);
      return;
    }
  
    // 2. Fetch current BHW info (assuming in `users` table or `bhw` table)
    const { data: bhwData, error: bhwError } = await supabase
      .from("users")
      .select("zone")
      .eq("id", user.id)
      .single();
  
    if (bhwError || !bhwData) {
      console.error("Fetch BHW zone error:", bhwError);
      setToastMsg("Failed to get your assigned zone.");
      setLoading(false);
      return;
    }
  
    const bhwZone = bhwData.zone?.trim(); // e.g. "Zone 2"
  
    //  3. Fetch only mothers matching that zone
    const { data, error } = await supabase
      .from("mothers")
      .select("*, users(email)")
      .ilike("address", `%${bhwZone}%`) // partial match: "Zone 2"
      .order("last_name", { ascending: true });
  
    if (error) {
      console.error("Fetch mothers error:", error);
      setToastMsg("Failed to load mothers.");
    } else {
      setMothers(data as Mother[]);
    }
  
    setLoading(false);
  };
   useEffect(() => {
    fetchMothers();
  }, []);

  const calculateAge = (birthdate: string): number => {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  const calculateEDC = (lmp: string): string => {
    const date = new Date(lmp);
    date.setDate(date.getDate() + 280);
    return date.toISOString().split("T")[0];
  };

  const calculateAOG = (lmp: string): string => {
    const lmpDate = new Date(lmp);
    const today = new Date();
    const diffTime = today.getTime() - lmpDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 3600 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;
    return `${weeks} weeks ${days} days`;
  };

  const handleChange = (field: keyof Mother, value: any) => {
    if (field === "birthdate" && value) {
      const age = calculateAge(value);
      setFormData((prev) => ({ ...prev, birthdate: value, age }));
    } else if (field === "lmp_date" && value) {
      const edc = calculateEDC(value);
      const aog = calculateAOG(value);
      setFormData((prev) => ({
        ...prev,
        lmp_date: value,
        edc,
        aog,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const saveMother = async () => {
    if (
      !formData.first_name ||
      !formData.last_name ||
      !formData.birthdate ||
      !formData.email ||
      !formData.password
    ) {
      setToastMsg("Please fill out all required fields.");
      return;
    }
  
    setSaving(true);
  
    try {
      //  1. Sign up user
      const { data: authUser, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });
  
      if (signUpError || !authUser?.user) {
        console.error("Supabase Auth SignUp Error:", signUpError);
        setToastMsg("Failed to register user.");
        return;
      }
  
      const userId = authUser.user.id;
  
      //  2. Insert to 'users' table (custom)
      const { error: insertUserError } = await supabase.from("users").insert([
        {
          id: userId,
          email: formData.email,
          full_name: `${formData.first_name} ${formData.last_name}`,
          role: "mother",
        },
      ]);
  
      if (insertUserError) {
        console.error("Insert to users table failed:", insertUserError);
        setToastMsg("Failed to save user profile.");
        return;
      }
  
      //  3. Insert to 'mothers' table
      const { error: motherError } = await supabase.from("mothers").insert([
        {
          user_id: userId,
          first_name: formData.first_name,
          middle_name: formData.middle_name,
          last_name: formData.last_name,
          birthdate: formData.birthdate,
          age: formData.age,
          civil_status: formData.civil_status,
          address: formData.address,
          contact_number: formData.contact_number,
          husband_name: formData.husband_name,
          education: formData.education,
          religion: formData.religion,
          lmp_date: formData.lmp_date,
          edc: formData.edc,
          gpa: formData.gpa,
          aog: formData.aog,
        },
      ]);
  
      if (motherError) {
        console.error("Insert to mothers table failed:", motherError);
        setToastMsg("Failed to save mother info.");
        return;
      }
  
      // 4. Check if confirmation email is required
      if (!authUser.session) {
        setToastMsg(
          "Registration successful! A confirmation link has been sent to the email. Please verify before logging in."
        );
      } else {
        setToastMsg("Mother successfully registered and authenticated!");
      }
  
      // Close modal and reset form
      setShowModal(false);
      fetchMothers();
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        birthdate: "",
        age: 0,
        civil_status: "",
        address: "",
        contact_number: "",
        husband_name: "",
        education: "",
        religion: "",
        lmp_date: "",
        edc: "",
        gpa: "",
        aog: "",
        email: "",
        password: "",
      });
    } catch (err) {
      console.error("Unexpected Error:", err);
      setToastMsg("Unexpected error occurred.");
    } finally {
      setSaving(false);
    }
  };
  
  
  const filteredMothers = mothers.filter((m) =>
    `${m.first_name} ${m.middle_name || ""} ${m.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  useEffect(() => {
    if (showModal) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showModal]);

  return (
    <MainLayout>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mother Records</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="page-content">
        <div className="toolbar">
          <IonSearchbar
            placeholder="Search mother..."
            value={search}
            onIonChange={(e) => setSearch(e.detail.value!)}
          />
          <IonButton className="btn-register" onClick={() => setShowModal(true)}>
            <IonIcon slot="start" icon={addCircleOutline} />
            Register Mother
          </IonButton>
        </div>

        {loading ? (
          <div className="centered">
            <IonSpinner name="dots" />
          </div>
        ) : (
          <div className="table-wrap">
            <table className="mother-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Contact</th>
                  <th>EDC</th>
                </tr>
              </thead>
              <tbody>
                {filteredMothers.map((m) => (
                  <tr
                    key={m.mother_id}
                    className="clickable-row"
                    onClick={() => setSelectedMother(m)}
                  >
                    <td>
                      {m.first_name} {m.middle_name?.charAt(0)}. {m.last_name}
                    </td>
                    <td>{m.age}</td>
                    <td>{m.civil_status}</td>
                    <td>{m.contact_number}</td>
                    <td>{m.edc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Full info modal */}
        <IonModal isOpen={!!selectedMother} onDidDismiss={() => setSelectedMother(null)}>
          <div className="modal-overlay">
            <div className="modal-container" style={{ maxWidth: 720 }}>
              <div className="modal-header">
                <h2>
                  {selectedMother?.first_name}{" "}
                  {selectedMother?.middle_name?.charAt(0)}.{" "}
                  {selectedMother?.last_name}
                </h2>
                <IonButton fill="clear" onClick={() => setSelectedMother(null)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </div>
              <div className="modal-body">
                <p><strong>Age:</strong> {selectedMother?.age}</p>
                <p><strong>Status:</strong> {selectedMother?.civil_status}</p>
                <p><strong>Address:</strong> {selectedMother?.address}</p>
                <p><strong>Contact:</strong> {selectedMother?.contact_number}</p>
                <p><strong>Email:</strong> {selectedMother?.users?.email}</p>
                <p><strong>LMP:</strong> {selectedMother?.lmp_date}</p>
                <p><strong>EDC:</strong> {selectedMother?.edc}</p>
                <p><strong>GPA:</strong> {selectedMother?.gpa}</p>
                <p><strong>AOG:</strong> {selectedMother?.aog}</p>
              </div>
              <div className="modal-footer">
                <IonButton onClick={() => setSelectedMother(null)} className="btn-cancel">
                  Close
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>

        <IonModal
          isOpen={showModal}
          onDidDismiss={() => setShowModal(false)}
          backdropDismiss={false}
        >
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-header">
                <h2>Register Mother</h2>
                <IonButton fill="clear" onClick={() => setShowModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </div>

              <div className="modal-body">
                <IonList>
                  <section>
                    <h3>Personal Information</h3>
                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">First Name</IonLabel>
                        <IonInput
                          value={formData.first_name}
                          onIonChange={(e) =>
                            handleChange("first_name", e.detail.value!)
                          }
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Middle Name</IonLabel>
                        <IonInput
                          value={formData.middle_name}
                          onIonChange={(e) =>
                            handleChange("middle_name", e.detail.value!)
                          }
                        />
                      </IonItem>
                    </div>

                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">Last Name</IonLabel>
                        <IonInput
                          value={formData.last_name}
                          onIonChange={(e) =>
                            handleChange("last_name", e.detail.value!)
                          }
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Birthdate</IonLabel>
                        <IonInput
                          type="date"
                          value={formData.birthdate}
                          onIonChange={(e) =>
                            handleChange("birthdate", e.detail.value!)
                          }
                        />
                      </IonItem>
                    </div>

                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">Age</IonLabel>
                        <IonInput type="number" value={formData.age} readonly />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Civil Status</IonLabel>
                        <IonInput
                          value={formData.civil_status}
                          onIonChange={(e) =>
                            handleChange("civil_status", e.detail.value!)
                          }
                        />
                      </IonItem>
                    </div>

                    <IonItem>
                      <IonLabel position="stacked">Husband's Name</IonLabel>
                      <IonInput
                        value={formData.husband_name}
                        onIonChange={(e) =>
                          handleChange("husband_name", e.detail.value!)
                        }
                      />
                    </IonItem>

                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">Education</IonLabel>
                        <IonInput
                          value={formData.education}
                          onIonChange={(e) =>
                            handleChange("education", e.detail.value!)
                          }
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">Religion</IonLabel>
                        <IonInput
                          value={formData.religion}
                          onIonChange={(e) =>
                            handleChange("religion", e.detail.value!)
                          }
                        />
                      </IonItem>
                    </div>
                  </section>

                  <section>
                    <h3>Pregnancy / LMP Info</h3>
                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">LMP Date</IonLabel>
                        <IonInput
                          type="date"
                          value={formData.lmp_date}
                          onIonChange={(e) =>
                            handleChange("lmp_date", e.detail.value!)
                          }
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">EDC</IonLabel>
                        <IonInput type="date" value={formData.edc} readonly />
                      </IonItem>
                    </div>

                    <div className="grid-2">
                      <IonItem>
                        <IonLabel position="stacked">GPA</IonLabel>
                        <IonInput
                          value={formData.gpa}
                          onIonChange={(e) =>
                            handleChange("gpa", e.detail.value!)
                          }
                        />
                      </IonItem>
                      <IonItem>
                        <IonLabel position="stacked">AOG</IonLabel>
                        <IonInput value={formData.aog} readonly />
                      </IonItem>
                    </div>
                  </section>

                  <section>
                    <h3>Contact & Account</h3>
                    <IonItem>
                      <IonLabel position="stacked">Address</IonLabel>
                      <IonInput
                        value={formData.address}
                        onIonChange={(e) =>
                          handleChange("address", e.detail.value!)
                        }
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Contact Number</IonLabel>
                      <IonInput
                        type="tel"
                        value={formData.contact_number}
                        onIonChange={(e) =>
                          handleChange("contact_number", e.detail.value!)
                        }
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={formData.email}
                        onIonChange={(e) =>
                          handleChange("email", e.detail.value!)
                        }
                      />
                    </IonItem>

                    <IonItem>
                      <IonLabel position="stacked">Password</IonLabel>
                      <IonInput
                        type="password"
                        value={formData.password}
                        onIonChange={(e) =>
                          handleChange("password", e.detail.value!)
                        }
                      />
                    </IonItem>
                  </section>
                </IonList>
              </div>
 
              <div className="modal-footer">
                <IonButton
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </IonButton>
                <IonButton className="btn-save" onClick={saveMother}>
                  {saving ? <IonSpinner name="dots" /> : "Save"}
                </IonButton>
              </div>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={!!toastMsg}
          message={toastMsg}
          duration={2500}
          onDidDismiss={() => setToastMsg("")}
        />
      </IonContent>

      <style>{`/* ---------- PAGE CONTENT ---------- */
       .page-content { padding: 16px; background: #f8f9fb; }
       .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
       .btn-register { background: #2bbf6d; border-radius: 12px; color: #fff; font-weight: 600; }

       /* TABLE */
       .table-wrap { overflow-x: auto; }
       .mother-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 8px; }
       .mother-table th, .mother-table td { padding: 12px 14px; text-align: left; border-bottom: 1px solid #eee; }
       .mother-table th { background: #f3f5f7; font-weight: 600; }
       .clickable-row:hover { background: #f9fdf9; cursor: pointer; }

.mother-list { 
  display: grid; 
  gap: 12px; 
}

.mother-card {
  background: #fff; 
  padding: 14px 16px; 
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

/* ---------- BODY SCROLL LOCK (disable main scroll) ---------- */
body.modal-open {
  overflow: hidden !important; /* ✅ disables background scroll completely */
}


/* ---------- MODAL CONTAINER ---------- */
.modal-container {
  background: #fff; 
  width: 95%; 
  max-width: 900px;
  max-height: 90vh;
  border-radius: 20px; 
  display: flex; 
  flex-direction: column;
  overflow: hidden; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
  animation: popIn 0.25s ease;
}

@keyframes popIn {
  from { transform: scale(0.97); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* ---------- HEADER ---------- */
.modal-header {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  background: #f3f5f7; 
  padding: 20px 22px; 
  border-bottom: 1px solid #ddd;
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #333;
  margin: 0;
}

/* ---------- BODY ---------- */
.modal-body { 
  flex: 1; 
  overflow-y: auto; 
  padding: 20px 26px 120px; /* ✅ enough space for footer */
  background: #fff;
  scroll-behavior: smooth;
}


section { 
  margin-bottom: 28px; 
  background: #fafbfc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
}

section h3 { 
  font-size: 1.05rem; 
  color: #2a2a2a; 
  margin-bottom: 16px; 
  font-weight: 600; 
  border-left: 4px solid #2bbf6d;
  padding-left: 8px;
}

.grid-2 { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 14px; 
}

/* ---------- FOOTER ---------- */
.modal-footer {
  position: absolute;       /* ✅ stays at bottom inside modal */
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 26px;
  border-top: 1px solid #ddd;
  background: #fff;
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.05);
}


.btn-cancel { 
  --background: #999; 
  --color: #fff; 
  border-radius: 10px; 
  font-weight: 600; 
  min-width: 90px;
}

.btn-save { 
  --background: #2bbf6d; 
  --color: white; 
  border-radius: 10px; 
  font-weight: 600; 
  min-width: 90px;
}

ion-item {
  --background: #fff;
  --border-color: #ddd;
  border-radius: 8px;
  margin-bottom: 8px;
}

ion-label {
  font-weight: 500;
  color: #444;
}

/* ---------- SCROLLBAR ---------- */
.modal-body::-webkit-scrollbar {
  width: 8px;
}
.modal-body::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 4px;
}

  `}</style>
    </MainLayout>
  );
};

export default Mothers;