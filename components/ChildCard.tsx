import React, { useState, useRef, useEffect } from 'react';
import { Child, Status } from '../types';
import { KebabIcon, ChevronDownIcon } from './Icons';

interface ChildCardProps {
  child: Child;
  statuses: Status[];
  onStatusChange: (childId: string, statusId: string) => void;
  onDelete: (childId: string) => void;
  onAddNote: (childId: string, currentNote: string) => void;
}

const ChildCard: React.FC<ChildCardProps> = ({ child, statuses, onStatusChange, onDelete, onAddNote }) => {
  const [optionsMenuOpen, setOptionsMenuOpen] = useState(false);
  const [statusMenuOpen, setStatusMenuOpen] = useState(false);

  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setOptionsMenuOpen(false);
      }
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target as Node)) {
        setStatusMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };
  
  const currentStatus = statuses.find(s => s.id === child.statusId) || statuses[0];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 flex items-center justify-between gap-3">
      {/* Left Section: Name and Note */}
      <div className="flex-grow flex flex-col items-start overflow-hidden">
        <h3 className="text-lg font-bold text-gray-800 truncate w-full" title={`${child.firstName} ${child.lastName}`}>
          {`${child.firstName} ${child.lastName}`}
        </h3>
        {child.notes && (
          <p className="text-xs text-gray-500 italic truncate w-full" title={child.notes}>
            {child.notes}
          </p>
        )}
      </div>

      {/* Right Section: Status and Options */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Status Selector */}
        <div ref={statusMenuRef} className="relative w-32">
          <button
            onClick={() => setStatusMenuOpen(!statusMenuOpen)}
            className={`w-full px-2 py-1.5 rounded-md font-semibold text-white transition flex items-center justify-between text-sm ${currentStatus?.color || 'bg-gray-400'}`}
          >
            <div className="flex flex-col items-start">
              <span>{currentStatus?.label || 'N/A'}</span>
              {child.lastUpdated && <span className="text-xs font-normal">{formatTime(child.lastUpdated)}</span>}
            </div>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {statusMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white rounded-md shadow-lg py-1 z-20 max-h-48 overflow-y-auto">
              {statuses.map(status => (
                <button
                  key={status.id}
                  onClick={() => {
                    onStatusChange(child.id, status.id);
                    setStatusMenuOpen(false);
                  }}
                  className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  {status.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Options Menu */}
        <div ref={optionsMenuRef} className="relative">
          <button onClick={() => setOptionsMenuOpen(!optionsMenuOpen)} className="text-gray-500 hover:text-gray-800 p-1">
            <KebabIcon />
          </button>
          {optionsMenuOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-10">
              <button onClick={() => { onAddNote(child.id, child.notes || ''); setOptionsMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{child.notes ? 'ערוך הערה' : 'הוסף הערה'}</button>
              <button onClick={() => { onDelete(child.id); setOptionsMenuOpen(false); }} className="block w-full text-right px-4 py-2 text-sm text-red-600 hover:bg-gray-100">הסר ילד</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChildCard;