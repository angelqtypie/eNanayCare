import {
  IonPage, IonContent, IonAccordionGroup, IonAccordion, IonItem, IonLabel,
  IonModal, IonButton, IonTextarea, IonSelect, IonSelectOption, IonToast
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrudToolbar from './CrudToolBar';

type Row = { id: string; month: number; dos: string; donts: string; tips: string };

const DosAndDonts: React.FC = () => {
  const [items, setItems] = useState<Row[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Row>>({ month: 1, dos: '', donts: '', tips: '' });
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');

  async function load() {
    const { data, error } = await supabase.from('dos_donts').select('*').order('month');
    if (error) return setToast(error.message);
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing({ month: 1, dos: '', donts: '', tips: '' });
    setOpen(true);
  }
  function openEdit(row: Row) {
    setEditing(row);
    setOpen(true);
  }

  const filtered = items.filter(i =>
    [i.dos, i.donts, i.tips].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  async function save() {
    const payload = {
      month: editing.month!,
      dos: editing.dos || '',
      donts: editing.donts || '',
      tips: editing.tips || ''
    };
    if ((editing as any).id) {
      const { error } = await supabase.from('dos_donts').update(payload).eq('id', (editing as any).id);
      if (error) return setToast(error.message);
      setToast('Updated');
    } else {
      const { error } = await supabase.from('dos_donts').insert(payload);
      if (error) return setToast(error.message);
      setToast('Added');
    }
    setOpen(false);
    load();
  }

  async function remove(row: Row) {
    if (!confirm(`Delete month ${row.month}?`)) return;
    const { error } = await supabase.from('dos_donts').delete().eq('id', row.id);
    if (error) return setToast(error.message);
    setToast('Deleted');
    load();
  }

  return (
    <IonPage>
      <IonContent>
        <CrudToolbar onAdd={openAdd} search={search} setSearch={setSearch} />
        <IonAccordionGroup multiple>
          {filtered.map(row => (
            <IonAccordion key={row.id} value={String(row.month)}>
              <IonItem slot="header">
                <IonLabel>Month {row.month}</IonLabel>
                <IonButton slot="end" size="small" onClick={(e) => { e.stopPropagation(); openEdit(row); }}>Edit</IonButton>
                <IonButton slot="end" size="small" color="danger" onClick={(e) => { e.stopPropagation(); remove(row); }}>Delete</IonButton>
              </IonItem>
              <div slot="content" style={{ padding: 12 }}>
                <h3>Do's</h3><p style={{ whiteSpace: 'pre-wrap' }}>{row.dos}</p>
                <h3>Don'ts</h3><p style={{ whiteSpace: 'pre-wrap' }}>{row.donts}</p>
                <h3>Tips</h3><p style={{ whiteSpace: 'pre-wrap' }}>{row.tips}</p>
              </div>
            </IonAccordion>
          ))}
        </IonAccordionGroup>

        <IonModal isOpen={open} onDidDismiss={() => setOpen(false)}>
          <div style={{ padding: 16 }}>
            <h2>{(editing as any).id ? 'Edit' : 'Add'} Do's & Don'ts</h2>
            <IonSelect label="Month" value={editing.month} onIonChange={e => setEditing(s => ({ ...s, month: Number(e.detail.value) }))}>
              {[...Array(9)].map((_, i) => <IonSelectOption key={i + 1} value={i + 1}>{i + 1}</IonSelectOption>)}
            </IonSelect>
            <IonTextarea label="Do's" autoGrow value={editing.dos} onIonChange={e => setEditing(s => ({ ...s, dos: e.detail.value! }))} />
            <IonTextarea label="Don'ts" autoGrow value={editing.donts} onIonChange={e => setEditing(s => ({ ...s, donts: e.detail.value! }))} />
            <IonTextarea label="Tips" autoGrow value={editing.tips} onIonChange={e => setEditing(s => ({ ...s, tips: e.detail.value! }))} />
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <IonButton onClick={save}>Save</IonButton>
              <IonButton fill="outline" onClick={() => setOpen(false)}>Cancel</IonButton>
            </div>
          </div>
        </IonModal>
        <IonToast isOpen={!!toast} duration={1800} message={toast} onDidDismiss={() => setToast('')} />
      </IonContent>
    </IonPage>
  );
};
export default DosAndDonts;
