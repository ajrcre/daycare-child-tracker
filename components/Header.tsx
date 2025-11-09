
import React, { useState, useEffect, useRef } from 'react';
import { SettingsIcon, AddIcon, RefreshIcon, ResetIcon, MenuIcon, HouseIcon } from './Icons';

interface HeaderProps {
  onAddChild: () => void;
  onSettings: () => void;
  onRefresh: () => void;
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onAddChild, onSettings, onRefresh, onReset }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const menuItems = [
    { label: 'הגדרות', icon: <SettingsIcon />, action: onSettings },
    { label: 'הוסף ילד', icon: <AddIcon />, action: onAddChild },
    { label: 'רענן', icon: <RefreshIcon />, action: onRefresh },
    { label: 'איפוס', icon: <ResetIcon className="text-orange-500"/>, action: onReset, color: 'text-orange-500' },
  ];

  return (
    <header className="bg-blue-600 text-white shadow-md sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="text-sm">
          <div>{formatDate(currentTime)}</div>
          <div className="font-bold text-lg">{formatTime(currentTime)}</div>
        </div>
        
        <h1 className="text-2xl font-bold flex items-center gap-2">
            <HouseIcon className="w-8 h-8"/>
            <span>צהרון</span>
        </h1>
        
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-blue-700 transition">
            <MenuIcon />
          </button>
          {isMenuOpen && (
            <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-30 text-gray-800">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    item.action();
                    setIsMenuOpen(false);
                  }}
                  className={`w-full text-right px-4 py-2 text-sm flex items-center gap-3 hover:bg-gray-100 transition ${item.color || ''}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
