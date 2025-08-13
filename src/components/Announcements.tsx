import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonModal,
  IonInput,
  IonDatetime,
  IonToast,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import CrudToolbar from "./CrudToolBar";

type Row = { id: string; title: string; message: string; posted_date: string };

const Announcements: React.FC = () => {
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Row>>({
    title: "",
    message: "",
    posted_date: new Date().toISOString(),
  });
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("posted_date", { ascending: false });
    if (error) return setToast(error.message);
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = items.filter((i) =>
    [i.title, i.message].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditing({
      title: "",
      message: "",
      posted_date: new Date().toISOString(),
    });
    setOpen(true);
  }

  function openEdit(row: Row) {
    setEditing(row);
    setOpen(true);
  }

  async function save() {
    const payload = {
      title: editing.title!,
      message: editing.message!,
      posted_date: editing.posted_date!,
    };

    if ((editing as any).id) {
      const { error } = await supabase
        .from("announcements")
        .update(payload)
        .eq("id", (editing as any).id);
      if (error) return setToast(error.message);
      setToast("Updated");
    } else {
      const { error } = await supabase
        .from("announcements")
        .insert(payload);
      if (error) return setToast(error.message);
      setToast("Added");
    }
    setOpen(false);
    load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", row.id);
    if (error) return setToast(error.message);
    setToast("Deleted");
    load();
  }

  return (
    <IonPage>
      <IonContent>
        <CrudToolbar onAdd={openAdd} search={search} setSearch={setSearch} />

        <IonList>
          {filtered.map((a) => (
            <IonItem key={a.id} button onClick={() => openEdit(a)}>
              <IonLabel>
                <h2>{a.title}</h2>
                <p>{new Date(a.posted_date).toDateString()}</p>
                <p>{a.message}</p>
              </IonLabel>
              <IonButton
                slot="end"
                color="danger"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(a);
                }}
              >
                Delete
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        {/* Modal for Add/Edit */}
        <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
          <div style={{ padding: 16 }}>
            <h2>{(editing as any).id ? "Edit" : "Add"} Announcement</h2>

            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                value={editing.title}
                onIonChange={(e) =>
                  setEditing((s) => ({ ...s, title: e.detail.value! }))
                }
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Message</IonLabel>
              <IonInput
                value={editing.message}
                onIonChange={(e) =>
                  setEditing((s) => ({ ...s, message: e.detail.value! }))
                }
              />
            </IonItem>

<IonItem>
  <IonLabel position="stacked">Posted Date</IonLabel>
  <IonDatetime
    presentation="date"
    value={
      editing.posted_date
        ? new Date(editing.posted_date).toISOString()
        : new Date().toISOString()
    }
    onIonChange={(e) =>
      setEditing((s) => ({ ...s, posted_date: e.detail.value as string }))
    }
  />
</IonItem>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <IonButton onClick={save}>Save</IonButton>
              <IonButton
                fill="outline"
                color="medium"
                onClick={() => setOpen(false)}
              >
                Cancel
              </IonButton>
            </div>
          </div>
        </IonModal>

        <IonToast
          isOpen={!!toast}
          duration={1800}
          message={toast}
          onDidDismiss={() => setToast("")}
        />
      </IonContent>
    </IonPage>
  );
};

export default Announcements;
