
import React from 'react';
import { Child, Status } from '../types';

interface FooterProps {
  children: Child[];
  statuses: Status[];
  activeFilter: string | null;
  onFilterChange: (statusId: string | null) => void;
}

const Footer: React.FC<FooterProps> = ({ children, statuses, activeFilter, onFilterChange }) => {
  const getStatusCount = (statusId: string) => {
    return children.filter(c => c.statusId === statusId).length;
  };

  const totalChildren = children.length;

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 p-2 z-20">
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <button
          onClick={() => onFilterChange(null)}
          className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition ${
            activeFilter === null ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 hover:bg-blue-100'
          }`}
        >
          <span>הכל</span>
          <span className="bg-white text-blue-600 rounded-full w-6 h-6 flex items-center justify-center">{totalChildren}</span>
        </button>

        {statuses.map(status => {
          const count = getStatusCount(status.id);
          const isActive = activeFilter === status.id;
          return (
            <button
              key={status.id}
              onClick={() => onFilterChange(status.id)}
              className={`px-3 py-1.5 rounded-full flex items-center gap-2 text-sm font-bold transition ${
                isActive ? `${status.color} text-white` : 'bg-white text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>{status.label}</span>
              <span className={`rounded-full w-6 h-6 flex items-center justify-center ${
                isActive ? 'bg-white text-black' : `${status.color.replace('bg-', 'bg-opacity-20 ')} text-black`
              }`}>{count}</span>
            </button>
          );
        })}
      </div>
    </footer>
  );
};

export default Footer;
