import {
  IonPage, IonContent, IonList, IonItem, IonLabel, IonButton, IonModal,
  IonSelect, IonSelectOption, IonInput, IonToast
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import CrudToolbar from './CrudToolBar';

type Rec = { id:string; pregnant_woman_id:string; record_type:string; file_url:string|null; note:string|null; };
type Woman = { id:string; name:string };

const HealthRecords: React.FC = () => {
  const [records, setRecords] = useState<Rec[]>([]);
  const [women, setWomen] = useState<Woman[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Rec>>({record_type:'', note:'', pregnant_woman_id:undefined});
  const [file, setFile] = useState<File|null>(null);
  const [toast, setToast] = useState(''); const [search,setSearch]=useState('');

  async function load(){
    const [r1,r2] = await Promise.all([
      supabase.from('health_records').select('*').order('created_at',{ascending:false}),
      supabase.from('pregnant_women').select('id,name')
    ]);
    if (r1.error) setToast(r1.error.message); else setRecords(r1.data||[]);
    if (r2.error) setToast(r2.error.message); else setWomen(r2.data||[]);
  }
  useEffect(()=>{ load(); },[]);

  const filtered = records.filter(r => [r.record_type,r.note].join(' ').toLowerCase().includes(search.toLowerCase()));

  function openAdd(){ setEditing({record_type:'', note:'', pregnant_woman_id:undefined}); setFile(null); setOpen(true); }
  function openEdit(r: Rec){ setEditing(r); setFile(null); setOpen(true); }

  async function upload(womanId:string, f:File){
    const path = `${womanId}/${Date.now()}_${f.name}`;
    const { data, error } = await supabase.storage.from('health-records').upload(path, f);
    if (error) throw error;
    const { data: urlData } = supabase.storage.from('health-records').getPublicUrl(data.path);
    return urlData.publicUrl;
  }

  async function save(){
    try{
      let file_url = editing.file_url || null;
      if (file && editing.pregnant_woman_id) file_url = await upload(editing.pregnant_woman_id, file);
      const payload = {
        pregnant_woman_id: editing.pregnant_woman_id!,
        record_type: editing.record_type || 'record',
        note: editing.note || null,
        file_url
      };
      if ((editing as any).id){
        const { error } = await supabase.from('health_records').update(payload).eq('id',(editing as any).id);
        if (error) throw error;
        setToast('Updated');
      } else {
        const { error } = await supabase.from('health_records').insert(payload);
        if (error) throw error;
        setToast('Added');
      }
      setOpen(false); load();
    } catch(e:any){ setToast(e.message||'Error'); }
  }

  async function remove(row: Rec){
    if(!confirm('Delete this record?')) return;
    const { error } = await supabase.from('health_records').delete().eq('id',row.id);
    if (error) return setToast(error.message);
    setToast('Deleted'); load();
  }

  return (
    <IonPage>
      <IonContent>
        <CrudToolbar onAdd={openAdd} search={search} setSearch={setSearch} />
        <IonList>
          {filtered.map(r=>(
            <IonItem key={r.id}>
              <IonLabel>
                <h2>{r.record_type}</h2>
                {r.note && <p>{r.note}</p>}
                {r.file_url && <a href={r.file_url} target="_blank">Open file</a>}
              </IonLabel>
              <IonButton slot="end" onClick={()=>openEdit(r)}>Edit</IonButton>
              <IonButton slot="end" color="danger" onClick={()=>remove(r)}>Delete</IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonModal isOpen={open} onDidDismiss={()=>setOpen(false)}>
          <div style={{padding:16}}>
            <h2>{(editing as any).id ? 'Edit' : 'Add'} Health Record</h2>
            <IonSelect label="Pregnant Woman" value={editing.pregnant_woman_id} onIonChange={e=>setEditing(s=>({...s,pregnant_woman_id:e.detail.value}))}>
              {women.map(w=><IonSelectOption key={w.id} value={w.id}>{w.name}</IonSelectOption>)}
            </IonSelect>
            <IonInput label="Record Type" value={editing.record_type} onIonChange={e=>setEditing(s=>({...s,record_type:e.detail.value!}))}/>
            <IonInput label="Note" value={editing.note ?? ''} onIonChange={e=>setEditing(s=>({...s,note:e.detail.value!}))}/>
            <input type="file" accept="image/*,application/pdf,video/*" onChange={e=>setFile(e.target.files?.[0]||null)} />
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <IonButton onClick={save}>Save</IonButton>
              <IonButton fill="outline" onClick={()=>setOpen(false)}>Cancel</IonButton>
            </div>
          </div>
        </IonModal>
        <IonToast isOpen={!!toast} duration={1800} message={toast} onDidDismiss={()=>setToast('')} />
      </IonContent>
    </IonPage>
  );
};
export default HealthRecords;
