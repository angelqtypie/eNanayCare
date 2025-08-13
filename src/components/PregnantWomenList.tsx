import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonButton, IonModal,
  IonInput, IonSelect, IonSelectOption, IonDatetime, IonToast, IonItem, IonLabel
} from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrudToolbar from './CrudToolBar';

type Row = {
  id: string;
  name: string;
  age: number | null;
  contact: string | null;
  zone: string | null;
  month_of_pregnancy: number | null;
  expected_delivery_date: string | null;
};

const empty: Partial<Row> = { name: '', age: null, contact: '', zone: '', month_of_pregnancy: null, expected_delivery_date: '' };

const PregnantWomenList: React.FC = () => {
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Row>>(empty);
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    const { data, error } = await supabase.from('pregnant_women').select('*').order('created_at', { ascending: false });
    if (error) return setToast(error.message);
    setItems(data || []);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const s = search.toLowerCase();
    return items.filter(i => [i.name, i.contact, i.zone].join(' ').toLowerCase().includes(s));
  }, [items, search]);

  function openAdd() { setEditing(empty); setOpen(true); }
  function openEdit(row: Row) { setEditing(row); setOpen(true); }

  async function save() {
    const payload = {
      name: editing.name?.trim() || '',
      age: editing.age ?? null,
      contact: editing.contact || null,
      zone: editing.zone || null,
      month_of_pregnancy: editing.month_of_pregnancy ?? null,
      expected_delivery_date: editing.expected_delivery_date || null
    };
    if ((editing as any).id) {
      const { error } = await supabase.from('pregnant_women').update(payload).eq('id', (editing as any).id);
      if (error) return setToast(error.message);
      setToast('Updated');
    } else {
      const { error } = await supabase.from('pregnant_women').insert(payload);
      if (error) return setToast(error.message);
      setToast('Added');
    }
    setOpen(false); load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete ${row.name}?`)) return;
    const { error } = await supabase.from('pregnant_women').delete().eq('id', row.id);
    if (error) return setToast(error.message);
    setToast('Deleted'); load();
  }

  return (
    <IonPage>
      <IonContent>
        <CrudToolbar onAdd={openAdd} search={search} setSearch={setSearch} />

        <IonGrid>
          <IonRow style={{ fontWeight: 600 }}>
            <IonCol size="3">Name</IonCol>
            <IonCol size="1">Age</IonCol>
            <IonCol size="2">Contact</IonCol>
            <IonCol size="2">Zone</IonCol>
            <IonCol size="2">Month</IonCol>
            <IonCol size="2">EDD</IonCol>
          </IonRow>

          {filtered.map(row => (
            <IonRow key={row.id} style={{ alignItems: 'center' }}>
              <IonCol size="3">{row.name}</IonCol>
              <IonCol size="1">{row.age ?? '-'}</IonCol>
              <IonCol size="2">{row.contact ?? '-'}</IonCol>
              <IonCol size="2">{row.zone ?? '-'}</IonCol>
              <IonCol size="2">{row.month_of_pregnancy ?? '-'}</IonCol>
              <IonCol size="2">{row.expected_delivery_date ?? '-'}</IonCol>
              <IonCol size="12" className="ion-text-right">
                <IonButton size="small" onClick={() => openEdit(row)}>Edit</IonButton>
                <IonButton size="small" color="danger" onClick={() => remove(row)}>Delete</IonButton>
              </IonCol>
            </IonRow>
          ))}
        </IonGrid>

<IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
  <IonContent className="ion-padding">
    <h2>{(editing as any).id ? 'Edit' : 'Add'} Pregnant Woman</h2>

    <IonItem>
      <IonLabel position="stacked">Name</IonLabel>
      <IonInput value={editing.name} onIonChange={e => setEditing(s => ({ ...s, name: e.detail.value! }))} />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Age</IonLabel>
      <IonInput type="number" value={editing.age ?? ''} onIonChange={e => setEditing(s => ({ ...s, age: Number(e.detail.value) || null }))} />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Contact</IonLabel>
      <IonInput value={editing.contact ?? ''} onIonChange={e => setEditing(s => ({ ...s, contact: e.detail.value! }))} />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Zone</IonLabel>
      <IonInput value={editing.zone ?? ''} onIonChange={e => setEditing(s => ({ ...s, zone: e.detail.value! }))} />
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Month of Pregnancy</IonLabel>
      <IonSelect value={editing.month_of_pregnancy ?? undefined} onIonChange={e => setEditing(s => ({ ...s, month_of_pregnancy: Number(e.detail.value) }))}>
        {[...Array(9)].map((_, i) => <IonSelectOption key={i + 1} value={i + 1}>{i + 1}</IonSelectOption>)}
      </IonSelect>
    </IonItem>

    <IonItem>
      <IonLabel position="stacked">Expected Delivery Date</IonLabel>
      <IonDatetime presentation="date" value={editing.expected_delivery_date ?? undefined} onIonChange={e => setEditing(s => ({ ...s, expected_delivery_date: e.detail.value as string }))} />
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

export default PregnantWomenList;
