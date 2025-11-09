
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import ChildCard from './components/ChildCard';
import Footer from './components/Footer';
import Modal from './components/Modal';
import { Child, Status } from './types';
import { DEFAULT_STATUSES, LOCAL_STORAGE_KEYS } from './constants';

type ModalState = null | {
  type: 'addChild' | 'settings' | 'addNote' | 'confirm' | 'resetConfirm';
  payload?: any;
};

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  
  const loadDataFromStorage = useCallback(() => {
    try {
      const storedChildren = localStorage.getItem(LOCAL_STORAGE_KEYS.CHILDREN);
      const storedStatuses = localStorage.getItem(LOCAL_STORAGE_KEYS.STATUSES);

      if (storedChildren) {
        setChildren(JSON.parse(storedChildren));
      }
      if (storedStatuses) {
        setStatuses(JSON.parse(storedStatuses));
      } else {
        setStatuses(DEFAULT_STATUSES);
        localStorage.setItem(LOCAL_STORAGE_KEYS.STATUSES, JSON.stringify(DEFAULT_STATUSES));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      setStatuses(DEFAULT_STATUSES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromStorage();
    const intervalId = setInterval(loadDataFromStorage, 3000);
    
    const handleStorageChange = (event: StorageEvent) => {
        if (event.key === LOCAL_STORAGE_KEYS.CHILDREN || event.key === LOCAL_STORAGE_KEYS.STATUSES) {
            loadDataFromStorage();
        }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
        clearInterval(intervalId);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadDataFromStorage]);

  const saveData = (newChildren: Child[], newStatuses: Status[]) => {
      localStorage.setItem(LOCAL_STORAGE_KEYS.CHILDREN, JSON.stringify(newChildren));
      localStorage.setItem(LOCAL_STORAGE_KEYS.STATUSES, JSON.stringify(newStatuses));
      setChildren(newChildren);
      setStatuses(newStatuses);
  };
  
  const handleAddChild = ({ firstName, lastName }: { firstName: string, lastName: string }) => {
    if (statuses.length === 0) return;
    const newChild: Child = {
      id: crypto.randomUUID(),
      firstName,
      lastName,
      statusId: statuses[0].id,
      lastUpdated: new Date().toISOString(),
    };
    saveData([...children, newChild], statuses);
  };

  const handleUpdateChildStatus = (childId: string, statusId: string) => {
    const newChildren = children.map(c => 
      c.id === childId ? { ...c, statusId, lastUpdated: new Date().toISOString() } : c
    );
    saveData(newChildren, statuses);
  };
  
  const handleDeleteChild = (childId: string) => {
    setModal({ type: 'confirm', payload: { childId } });
  };
  
  const confirmDeleteChild = () => {
    if(modal?.type !== 'confirm' || !modal.payload.childId) return;
    const newChildren = children.filter(c => c.id !== modal.payload.childId);
    saveData(newChildren, statuses);
  };

  const handleAddNote = (childId: string, currentNote: string) => {
    setModal({ type: 'addNote', payload: { childId, note: currentNote } });
  };

  const saveNote = ({ note }: { note: string }) => {
      if(modal?.type !== 'addNote' || !modal.payload.childId) return;
      const newChildren = children.map(c => 
        c.id === modal.payload.childId ? { ...c, notes: note } : c
      );
      saveData(newChildren, statuses);
  };
  
  const handleSaveSettings = (newStatuses: Status[]) => {
    // If a status was removed, reassign children to the first status
    const newStatusIds = new Set(newStatuses.map(s => s.id));
    const firstStatusId = newStatuses.length > 0 ? newStatuses[0].id : '';
    const updatedChildren = children.map(c => ({
        ...c,
        statusId: newStatusIds.has(c.statusId) ? c.statusId : firstStatusId,
    }));
    saveData(updatedChildren, newStatuses);
  };
  
  const handleReset = () => {
    setModal({ type: 'resetConfirm' });
  };
  
  const confirmReset = () => {
    if (statuses.length === 0) return;
    const firstStatusId = statuses[0].id;
    const newChildren = children.map(c => ({
        ...c,
        statusId: firstStatusId,
        lastUpdated: new Date().toISOString(),
    }));
    saveData(newChildren, statuses);
  };

  const sortedAndFilteredChildren = useMemo(() => {
    const absentStatus = statuses.find(s => s.label === 'לא הגיע');
    
    return children
      .filter(child => activeFilter === null || child.statusId === activeFilter)
      .sort((a, b) => {
        const isAAbsent = a.statusId === absentStatus?.id;
        const isBAbsent = b.statusId === absentStatus?.id;
        
        if (isAAbsent && !isBAbsent) return 1;
        if (!isAAbsent && isBAbsent) return -1;
        
        const nameA = `${a.firstName} ${a.lastName}`;
        const nameB = `${b.firstName} ${b.lastName}`;
        return nameA.localeCompare(nameB, 'he');
      });
  }, [children, statuses, activeFilter]);

  const modalConfig = {
    'addChild': { title: 'הוספת ילד חדש' },
    'settings': { title: 'הגדרות סטטוסים' },
    'addNote': { title: 'הוספת / עריכת הערה' },
    'confirm': { title: 'אישור מחיקה' },
    'resetConfirm': { title: 'אישור איפוס סטטוסים' }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24" dir="rtl">
      <Header 
        onAddChild={() => setModal({ type: 'addChild' })}
        onSettings={() => setModal({ type: 'settings', payload: { statuses } })}
        onRefresh={loadDataFromStorage}
        onReset={handleReset}
      />
      <main className="container mx-auto p-4">
        {isLoading ? (
          <div className="text-center p-10">טוען נתונים...</div>
        ) : (
          sortedAndFilteredChildren.map(child => (
            <ChildCard 
              key={child.id} 
              child={child} 
              statuses={statuses} 
              onStatusChange={handleUpdateChildStatus}
              onDelete={handleDeleteChild}
              onAddNote={handleAddNote}
            />
          ))
        )}
      </main>
      
      {!isLoading && (
        <Footer 
          children={children} 
          statuses={statuses}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />
      )}

      {modal && (
        <Modal
          isOpen={!!modal}
          type={modal.type}
          title={modalConfig[modal.type].title}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.type === 'addChild') handleAddChild(data);
            if (modal.type === 'settings') handleSaveSettings(data);
            if (modal.type === 'addNote') saveNote(data);
            if (modal.type === 'confirm') confirmDeleteChild();
            if (modal.type === 'resetConfirm') confirmReset();
          }}
          initialData={modal.payload}
        >
          {modal.type === 'confirm' && <p>האם אתה בטוח שברצונך למחוק את הילד/ה?</p>}
          {modal.type === 'resetConfirm' && <p>פעולה זו תאפס את הסטטוס של כל הילדים לסטטוס הראשון ברשימה. האם להמשיך?</p>}
        </Modal>
      )}

    </div>
  );
};

export default App;
