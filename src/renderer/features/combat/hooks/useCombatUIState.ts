import { useState } from 'react';

export const useCombatUIState = () => {
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [bgInputUrl, setBgInputUrl] = useState('');
  const [showGridLines, setShowGridLines] = useState(true);
  const [gridOpacity] = useState(0.2);
  const [saveNotification, setSaveNotification] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(true);

  const [viewingToken, setViewingToken] = useState<any>(null);
  const [sidebarTab, setSidebarTab] = useState<'combatants' | 'objects'>('combatants');
  const [prevSidebarTab, setPrevSidebarTab] = useState<'combatants' | 'objects' | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const [healthModalToken, setHealthModalToken] = useState<any>(null);
  const [healthInput, setHealthInput] = useState<string>('');
  const [conditionInput, setConditionInput] = useState<string>('');
  const [activeActionMenu, setActiveActionMenu] = useState<'PH' | 'TS' | null>(null);
  const [isRadialOpen, setIsRadialOpen] = useState(false);

  const switchTab = (tab: 'combatants' | 'objects') => {
    if (tab === sidebarTab || isTabTransitioning) return;
    setPrevSidebarTab(sidebarTab);
    setIsTabTransitioning(true);
    setTimeout(() => {
      setSidebarTab(tab);
      setIsTabTransitioning(false);
      setPrevSidebarTab(null);
    }, 220);
  };

  return {
    bgImage, setBgImage,
    bgInputUrl, setBgInputUrl,
    showGridLines, setShowGridLines,
    gridOpacity,
    saveNotification, setSaveNotification,
    isSidebarOpen, setIsSidebarOpen,
    isChatOpen, setIsChatOpen,
    viewingToken, setViewingToken,
    sidebarTab, setSidebarTab,
    prevSidebarTab, setPrevSidebarTab,
    isTabTransitioning, setIsTabTransitioning,
    healthModalToken, setHealthModalToken,
    healthInput, setHealthInput,
    conditionInput, setConditionInput,
    activeActionMenu, setActiveActionMenu,
    isRadialOpen, setIsRadialOpen,
    switchTab
  };
};
