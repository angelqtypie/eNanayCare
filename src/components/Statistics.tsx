import {
  IonPage, IonContent, IonGrid, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonToast
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { startOfMonth, endOfMonth } from 'date-fns';

const Stat: React.FC<{title:string; value:string|number}> = ({title,value}) => (
  <IonCard>
    <IonCardHeader><IonCardTitle>{title}</IonCardTitle></IonCardHeader>
    <IonCardContent style={{fontSize:32,fontWeight:700}}>{value}</IonCardContent>
  </IonCard>
);

const Statistics: React.FC = () => {
  const [active, setActive] = useState(0);
  const [rate, setRate] = useState('0%');
  const [missed, setMissed] = useState(0);
  const [toast,setToast]=useState('');
  const { startOfMonth, endOfMonth } = require('date-fns');


  async function load(){
    try{
      const { count: pwCount, error: e1 } = await supabase.from('pregnant_women').select('*',{count:'exact',head:true});
      if (e1) throw e1;
      setActive(pwCount||0);

      const now = new Date(), from = startOfMonth(now).toISOString(), to = endOfMonth(now).toISOString();

      const { data: expected, error: e2 } = await supabase.from('schedules')
        .select('id').gte('date',from).lte('date',to).eq('type','checkup');
      if (e2) throw e2;

      const { data: completed, error: e3 } = await supabase.from('health_records')
        .select('id').gte('created_at',from).lte('created_at',to).ilike('record_type','%checkup%');
      if (e3) throw e3;

      const r = expected?.length ? Math.round(((completed?.length||0)/expected.length)*100) : 0;
      setRate(`${r}%`);

      const { data: past, error: e4 } = await supabase.from('schedules').select('id,date').lt('date', new Date().toISOString()).in('type',['checkup','home_visit']);
      if (e4) throw e4;

      const { data: recs, error: e5 } = await supabase.from('health_records').select('id,record_type');
      if (e5) throw e5;

      const missedCount = (past||[]).filter(p => !(recs||[]).some(r=>r.record_type.includes('checkup')||r.record_type.includes('home_visit'))).length;
      setMissed(missedCount);
    } catch(e:any){ setToast(e.message||'Error'); }
  }
  useEffect(()=>{ load(); },[]);

  return (
    <IonPage>
      <IonContent>
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4"><Stat title="Active Pregnancies" value={active} /></IonCol>
            <IonCol size="12" sizeMd="4"><Stat title="Monthly Checkup Completion" value={rate} /></IonCol>
            <IonCol size="12" sizeMd="4"><Stat title="Missed Visits (Est.)" value={missed} /></IonCol>
          </IonRow>
        </IonGrid>
        <IonToast isOpen={!!toast} duration={1800} message={toast} onDidDismiss={()=>setToast('')} />
      </IonContent>
    </IonPage>
  );
};
export default Statistics;
