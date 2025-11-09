import React, { FormEvent, useState } from 'react';
import { Child, Status } from '../types';

type ModalType = 'addChild' | 'settings' | 'addNote' | 'confirm' | 'resetConfirm';

interface ModalProps {
  type: ModalType;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: any) => void;
  title: string;
  children?: React.ReactNode;
  initialData?: any;
}

const Modal: React.FC<ModalProps> = ({ type, isOpen, onClose, onSave, title, children, initialData }) => {
  if (!isOpen) return null;

  const handleSave = (data: any) => {
    if (onSave) {
      onSave(data);
    }
    onClose();
  };

  const renderContent = () => {
    switch (type) {
      case 'addChild':
        return <AddChildForm onSave={handleSave} onClose={onClose} />;
      case 'settings':
        return <SettingsForm onSave={handleSave} onClose={onClose} initialStatuses={initialData.statuses} />;
      case 'addNote':
        return <AddNoteForm onSave={handleSave} onClose={onClose} initialNote={initialData.note} />;
      case 'confirm':
      case 'resetConfirm':
        return (
          <div className="text-gray-700">
            {children}
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition">ביטול</button>
              <button onClick={() => handleSave(true)} className={`px-4 py-2 rounded-md text-white ${type === 'confirm' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'} transition`}>
                {type === 'confirm' ? 'אישור מחיקה' : 'אפס סטטוסים'}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold mb-4 text-gray-800">{title}</h2>
        {renderContent()}
      </div>
    </div>
  );
};

const AddChildForm: React.FC<{ onSave: (data: { firstName: string, lastName: string }) => void, onClose: () => void }> = ({ onSave, onClose }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (firstName && lastName) {
      onSave({ firstName, lastName });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <input type="text" placeholder="שם פרטי" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
        <input type="text" placeholder="שם משפחה" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" required />
      </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition">ביטול</button>
        <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">שמירה</button>
      </div>
    </form>
  );
};

const AddNoteForm: React.FC<{ onSave: (data: { note: string }) => void, onClose: () => void, initialNote: string }> = ({ onSave, onClose, initialNote }) => {
  const [note, setNote] = useState(initialNote);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSave({ note });
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md h-24" placeholder="הכנס הערה..."></textarea>
      <div className="mt-6 flex justify-between items-center">
        <div>
          {initialNote && (
            <button
              type="button"
              onClick={() => onSave({ note: '' })}
              className="px-4 py-2 rounded-md text-red-600 hover:bg-red-100 font-semibold transition"
            >
              מחק הערה
            </button>
          )}
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition">ביטול</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">שמירה</button>
        </div>
      </div>
    </form>
  );
};

const SettingsForm: React.FC<{ onSave: (statuses: Status[]) => void, onClose: () => void, initialStatuses: Status[] }> = ({ onSave, onClose, initialStatuses }) => {
  const [statuses, setStatuses] = useState<Status[]>(initialStatuses);
  const [newStatusLabel, setNewStatusLabel] = useState('');
  const colors = ['bg-slate-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-pink-500', 'bg-blue-500'];

  const handleStatusChange = (index: number, field: 'label' | 'color', value: string) => {
    const newStatuses = [...statuses];
    newStatuses[index] = { ...newStatuses[index], [field]: value };
    setStatuses(newStatuses);
  };

  const addStatus = () => {
    if(newStatusLabel.trim() === '') return;
    setStatuses([...statuses, { id: crypto.randomUUID(), label: newStatusLabel, color: 'bg-gray-400' }]);
    setNewStatusLabel('');
  };
  
  const moveStatus = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index > 0) {
      const newStatuses = [...statuses];
      [newStatuses[index - 1], newStatuses[index]] = [newStatuses[index], newStatuses[index - 1]];
      setStatuses(newStatuses);
    }
    if (direction === 'down' && index < statuses.length - 1) {
      const newStatuses = [...statuses];
      [newStatuses[index + 1], newStatuses[index]] = [newStatuses[index], newStatuses[index + 1]];
      setStatuses(newStatuses);
    }
  };

  return (
    <div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
        {statuses.map((status, index) => (
            <div key={status.id} className="flex items-center gap-2 p-2 border rounded-md">
            <input type="text" value={status.label} onChange={e => handleStatusChange(index, 'label', e.target.value)} className="flex-grow px-2 py-1 border rounded-md" />
            <select value={status.color} onChange={e => handleStatusChange(index, 'color', e.target.value)} className={`appearance-none p-2 rounded-md ${status.color} text-white`}>
                {colors.map(color => <option key={color} value={color} className="bg-white text-black">{color.replace('bg-', '').replace('-500', '')}</option>)}
            </select>
            <div className="flex flex-col">
              <button onClick={() => moveStatus(index, 'up')} disabled={index === 0} className="disabled:opacity-25">▲</button>
              <button onClick={() => moveStatus(index, 'down')} disabled={index === statuses.length -1} className="disabled:opacity-25">▼</button>
            </div>
            </div>
        ))}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <input type="text" placeholder="שם סטטוס חדש" value={newStatusLabel} onChange={e => setNewStatusLabel(e.target.value)} className="flex-grow px-2 py-1 border rounded-md" />
          <button onClick={addStatus} className="px-4 py-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition">הוסף</button>
        </div>
      <div className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition">ביטול</button>
        <button type="button" onClick={() => onSave(statuses)} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">שמור הגדרות</button>
      </div>
    </div>
  );
};


export default Modal;