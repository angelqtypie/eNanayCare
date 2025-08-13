import { IonButton, IonButtons, IonSearchbar } from '@ionic/react';
export default function CrudToolbar({
  onAdd, search, setSearch
}: { onAdd: () => void; search: string; setSearch: (v:string)=>void; }) {
  return (
    <IonButtons style={{padding:8, gap:8}}>
      <IonButton onClick={onAdd}>Add</IonButton>
      <IonSearchbar value={search} onIonChange={e => setSearch(e.detail.value!)} placeholder="Search" />
    </IonButtons>
  );
}
