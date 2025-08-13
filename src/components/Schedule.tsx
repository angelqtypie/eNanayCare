import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonModal,
  IonInput, IonSelect, IonSelectOption, IonDatetime, IonButton,
  IonToast, IonHeader, IonToolbar, IonTitle
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrudToolbar from './CrudToolBar';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

type Item = {
  id: string;
  title: string;
  date: string;
  type: 'checkup' | 'vitamin' | 'home_visit' | 'event';
  pregnant_woman_id: string | null;
  notes: string | null;
};

type Value = Date | null | [Date | null, Date | null];

type Woman = { id: string; name: string };

const empty: Partial<Item> = {
  title: '',
  type: 'checkup',
  date: new Date().toISOString(),
  pregnant_woman_id: null,
  notes: ''
};

const Schedule: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [women, setWomen] = useState<Woman[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Item>>(empty);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
const [calendarDate, setCalendarDate] = useState<Value>(new Date());


  async function load() {
    const [s1, s2] = await Promise.all([
      supabase.from('schedules').select('*').order('date', { ascending: true }),
      supabase.from('pregnant_women').select('id,name')
    ]);

    if (s1.error) setToast(s1.error.message); else setItems(s1.data || []);
    if (s2.error) setToast(s2.error.message); else setWomen(s2.data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = items.filter(i =>
    [i.title, i.type, i.notes].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() { setEditing(empty); setOpen(true); }
  function openEdit(row: Item) { setEditing(row); setOpen(true); }

  async function save() {
    const payload = {
      title: editing.title?.trim() || '',
      type: editing.type as Item['type'],
      date: editing.date!,
      pregnant_woman_id: editing.pregnant_woman_id || null,
      notes: editing.notes || null
    };

    if ((editing as any).id) {
      const { error } = await supabase.from('schedules').update(payload).eq('id', (editing as any).id);
      if (error) return setToast(error.message);
      setToast('Updated');
    } else {
      const { error } = await supabase.from('schedules').insert(payload);
      if (error) return setToast(error.message);
      setToast('Added');
    }

    setOpen(false);
    load();
  }

  async function remove(row: Item) {
    if (!confirm(`Delete "${row.title}"?`)) return;
    const { error } = await supabase.from('schedules').delete().eq('id', row.id);
    if (error) return setToast(error.message);
    setToast('Deleted');
    load();
  }

  // Highlight calendar tiles with events
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dayEvents = items.filter(i => {
        const itemDate = new Date(i.date);
        return itemDate.getFullYear() === date.getFullYear() &&
               itemDate.getMonth() === date.getMonth() &&
               itemDate.getDate() === date.getDate();
      });
      return dayEvents.length > 0 ? <div style={{ backgroundColor: '#3880ff', color: '#fff', borderRadius: '50%', textAlign: 'center' }}>{dayEvents.length}</div> : null;
    }
    return null;
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Schedule</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <CrudToolbar onAdd={openAdd} search={search} setSearch={setSearch} />

        <IonList>
          {filtered.map(row => (
            <IonItem key={row.id} button onClick={() => openEdit(row)}>
              <IonLabel>
                <h2>{row.title} — {row.type}</h2>
                <p>{new Date(row.date).toDateString()}</p>
                {row.notes && <p>{row.notes}</p>}
              </IonLabel>
              <IonButton slot="end" color="danger" onClick={(e) => { e.stopPropagation(); remove(row); }}>
                Delete
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        {/* Calendar showing all events */}
        <div style={{ padding: 16 }}>
          <Calendar
            value={calendarDate}
            onChange={setCalendarDate}
           tileContent={tileContent}
          /> 
        </div>

        {/* Modal for Add/Edit */}
        <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
          <IonContent className="ion-padding" style={{ maxHeight: '100vh', overflowY: 'auto' }}>
            <h2>{(editing as any).id ? 'Edit' : 'Add'} Schedule</h2>

            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput value={editing.title} onIonChange={e => setEditing(s => ({ ...s, title: e.detail.value! }))} />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Type</IonLabel>
              <IonSelect value={editing.type} onIonChange={e => setEditing(s => ({ ...s, type: e.detail.value }))}>
                <IonSelectOption value="checkup">Prenatal Checkup</IonSelectOption>
                <IonSelectOption value="vitamin">Vitamin Distribution</IonSelectOption>
                <IonSelectOption value="home_visit">Home Visit</IonSelectOption>
                <IonSelectOption value="event">Health Event</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Date</IonLabel>
              <IonDatetime
                presentation="date"
                value={editing.date}
             onIonChange={(e) =>
  setEditing((s) => ({ ...s, date: e.detail.value as string }))
}

              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Pregnant Woman (optional)</IonLabel>
              <IonSelect
                value={editing.pregnant_woman_id ?? undefined}
                onIonChange={e => setEditing(s => ({ ...s, pregnant_woman_id: e.detail.value }))}
              >
                <IonSelectOption value={undefined}>— none —</IonSelectOption>
                {women.map(w => <IonSelectOption key={w.id} value={w.id}>{w.name}</IonSelectOption>)}
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Notes</IonLabel>
              <IonInput value={editing.notes ?? ''} onIonChange={e => setEditing(s => ({ ...s, notes: e.detail.value! }))} />
            </IonItem>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <IonButton onClick={save}>Save</IonButton>
              <IonButton fill="outline" onClick={() => setOpen(false)}>Cancel</IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonToast isOpen={!!toast} duration={1800} message={toast} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
};

export default Schedule;
