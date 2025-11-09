import React, { useState, useRef, useEffect } from 'react';
import { Child, Status } from '../types';
import { KebabIcon } from './Icons';

interface ChildCardProps {
  child: Child;
  statuses: Status[];
  onStatusChange: (childId: string, statusId: string) => void;
  onDelete: (childId: string) => void;
  onAddNote: (childId: string, currentNote: string) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, statuses, onStatusChange, onDelete, onAddNote }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 relative ${menuOpen ? 'z-10' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
             <h3 className="text-xl font-bold text-gray-800">{`${child.firstName} ${child.lastName}`}</h3>
            <div ref={menuRef} className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-500 hover:text-gray-800 p-1">
                <KebabIcon />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
                  <button onClick={() => { onAddNote(child.id, child.notes || ''); setMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{child.notes ? 'ערוך הערה' : 'הוסף הערה'}</button>
                  <button onClick={() => { onDelete(child.id); setMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100">הסר ילד</button>
                </div>
              )}
            </div>
        </div>

        <div className="flex-grow flex justify-center items-center gap-2 mx-4">
            {statuses.map(status => {
                const isActive = child.statusId === status.id;
                const buttonColor = isActive ? status.color : 'bg-gray-200';
                const textColor = isActive ? 'text-white' : 'text-gray-700';
                const hoverColor = isActive ? '' : 'hover:bg-gray-300';
                
                return (
                    <button
                        key={status.id}
                        onClick={() => onStatusChange(child.id, status.id)}
                        className={`px-4 py-2 rounded-md font-semibold transition flex-1 text-center ${buttonColor} ${textColor} ${hoverColor}`}
                    >
                      <div>{status.label}</div>
                      {isActive && child.lastUpdated && <div className="text-xs font-normal">{formatTime(child.lastUpdated)}</div>}
                    </button>
                )
            })}
        </div>
      </div>
      {child.notes && (
        <div className="mt-3 pr-12 text-sm text-gray-600 italic">
          <p>הערה: {child.notes}</p>
        </div>
      )}
    </div>
  );
};

export default ChildCard;