import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import ChildCard from './components/ChildCard';
import Footer from './components/Footer';
import Modal from './components/Modal';
import { Child, Status } from './types';
import { DEFAULT_STATUSES } from './constants';

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

  const fetchData = async () => {
    // We don't set loading to true for polling refreshes to avoid UI flicker
    try {
      const response = await fetch('/api/data');
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      const data = await response.json();
      setChildren(data.children || []);
      // Use default statuses as a fallback if fetch fails or returns empty
      setStatuses(data.statuses && data.statuses.length > 0 ? data.statuses : DEFAULT_STATUSES);
    } catch (error) {
      console.error("Failed to fetch data from server:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(intervalId);
  }, []);

  const saveDataToServer = async (newChildren: Child[], newStatuses: Status[]) => {
    // Optimistically update the local state for a snappy UI
    setChildren(newChildren);
    setStatuses(newStatuses);

    try {
      await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ children: newChildren, statuses: newStatuses }),
      });
    } catch (error) {
      console.error("Failed to save data to server:", error);
      // Optional: Add logic to revert optimistic update or show an error toast
    }
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
    saveDataToServer([...children, newChild], statuses);
  };

  const handleUpdateChildStatus = (childId: string, statusId: string) => {
    const newChildren = children.map(c => 
      c.id === childId ? { ...c, statusId, lastUpdated: new Date().toISOString() } : c
    );
    saveDataToServer(newChildren, statuses);
  };
  
  const handleDeleteChild = (childId: string) => {
    setModal({ type: 'confirm', payload: { childId } });
  };
  
  const confirmDeleteChild = () => {
    if(modal?.type !== 'confirm' || !modal.payload.childId) return;
    const newChildren = children.filter(c => c.id !== modal.payload.childId);
    saveDataToServer(newChildren, statuses);
  };

  const handleAddNote = (childId: string, currentNote: string) => {
    setModal({ type: 'addNote', payload: { childId, note: currentNote } });
  };

  const saveNote = ({ note }: { note: string }) => {
      if(modal?.type !== 'addNote' || !modal.payload.childId) return;
      const newChildren = children.map(c => 
        c.id === modal.payload.childId ? { ...c, notes: note } : c
      );
      saveDataToServer(newChildren, statuses);
  };
  
  const handleSaveSettings = (newStatuses: Status[]) => {
    const newStatusIds = new Set(newStatuses.map(s => s.id));
    const firstStatusId = newStatuses.length > 0 ? newStatuses[0].id : '';
    const updatedChildren = children.map(c => ({
        ...c,
        statusId: newStatusIds.has(c.statusId) ? c.statusId : firstStatusId,
    }));
    saveDataToServer(updatedChildren, newStatuses);
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
    saveDataToServer(newChildren, statuses);
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
    <div className="bg-gray-50 min-h-screen flex flex-col" dir="rtl">
      <Header 
        onAddChild={() => setModal({ type: 'addChild' })}
        onSettings={() => setModal({ type: 'settings', payload: { statuses } })}
        onRefresh={fetchData}
        onReset={handleReset}
      />
      <main className="container mx-auto p-4 flex-grow">
        {isLoading ? (
          <div className="text-center p-10">טוען נתונים...</div>
        ) : (
          <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
            {sortedAndFilteredChildren.map(child => (
              <ChildCard 
                key={child.id} 
                child={child} 
                statuses={statuses} 
                onStatusChange={handleUpdateChildStatus}
                onDelete={handleDeleteChild}
                onAddNote={handleAddNote}
              />
            ))}
          </div>
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
