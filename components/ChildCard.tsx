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
  const [statusMenuPosition, setStatusMenuPosition] = useState<'top' | 'bottom'>('top');
  const [optionsMenuStyle, setOptionsMenuSyle] = useState<React.CSSProperties>({});

  const optionsMenuRef = useRef<HTMLDivElement>(null);
  const optionsButtonRef = useRef<HTMLButtonElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);
  const statusButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleStatusButtonClick = () => {
    if (statusButtonRef.current) {
        const rect = statusButtonRef.current.getBoundingClientRect();
        // If there's not enough space above (e.g., less than 250px), open downwards
        if (rect.top < 250) {
            setStatusMenuPosition('bottom');
        } else {
            setStatusMenuPosition('top');
        }
    }
    setStatusMenuOpen(prev => !prev);
  };

  const handleOptionsMenuToggle = () => {
    if (!optionsMenuOpen && optionsButtonRef.current) {
        const rect = optionsButtonRef.current.getBoundingClientRect();
        const menuHeight = 80; // Estimated height for 2 items
        const menuWidth = 160; // w-40 in tailwind is 10rem = 160px

        const style: React.CSSProperties = {};

        // Vertical positioning: check if there's enough space below
        if (rect.bottom + menuHeight > window.innerHeight) {
            style.bottom = '100%';
            style.marginBottom = '0.5rem';
        } else {
            style.top = '100%';
            style.marginTop = '0.5rem';
        }

        // Horizontal positioning: check if there's enough space to the left (for RTL)
        if (rect.left < menuWidth) {
            style.left = 0;
        } else {
            style.right = 0;
        }

        setOptionsMenuSyle(style);
    }
    setOptionsMenuOpen(prev => !prev);
  };

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
          <p className="text-xs text-gray-500 italic truncate w-full text-right" title={child.notes}>
            {child.notes}
          </p>
        )}
      </div>

      {/* Right Section: Status and Options */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Status Selector */}
        <div ref={statusMenuRef} className="relative w-32">
          <button
            ref={statusButtonRef}
            onClick={handleStatusButtonClick}
            className={`w-full px-2 py-1.5 rounded-md font-semibold text-white transition flex items-center justify-between text-sm ${currentStatus?.color || 'bg-gray-400'}`}
          >
            <div className="flex flex-col items-start">
              <span>{currentStatus?.label || 'N/A'}</span>
              {child.lastUpdated && <span className="text-xs font-normal">{formatTime(child.lastUpdated)}</span>}
            </div>
            <ChevronDownIcon className="w-4 h-4" />
          </button>
          {statusMenuOpen && (
            <div className={`absolute left-0 right-0 w-full bg-white rounded-md shadow-lg py-1 z-20 max-h-48 overflow-y-auto ${
                statusMenuPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
            }`}>
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
          <button ref={optionsButtonRef} onClick={handleOptionsMenuToggle} className="text-gray-500 hover:text-gray-800 p-1">
            <KebabIcon />
          </button>
          {optionsMenuOpen && (
            <div style={optionsMenuStyle} className="absolute w-40 bg-white rounded-md shadow-lg py-1 z-30">
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