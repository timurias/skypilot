'use client';

import * as React from 'react';
import type { UAVConfiguration, MissionData } from '@/lib/types';
import { initialUavConfigurations } from '@/lib/data';

type AppContextType = {
  configs: UAVConfiguration[];
  setConfigs: React.Dispatch<React.SetStateAction<UAVConfiguration[]>>;
  selectedConfigId: string | null;
  setSelectedConfigId: React.Dispatch<React.SetStateAction<string | null>>;
  mission: MissionData;
  setMission: React.Dispatch<React.SetStateAction<MissionData>>;
  resetAll: () => void;
};

const defaultMission: MissionData = {
  waypoints: [],
  restrictedZones: [],
  flightPath: null,
  safeCorridor: null,
};

const AppContext = React.createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [configs, setConfigs] = React.useState<UAVConfiguration[]>(initialUavConfigurations);
  const [selectedConfigId, setSelectedConfigId] = React.useState<string | null>(initialUavConfigurations[0].id);
  const [mission, setMission] = React.useState<MissionData>(defaultMission);

  const resetAll = () => {
    setMission(defaultMission);
    setConfigs(initialUavConfigurations);
    setSelectedConfigId(initialUavConfigurations[0].id);
  };

  return (
    <AppContext.Provider
      value={{
        configs,
        setConfigs,
        selectedConfigId,
        setSelectedConfigId,
        mission,
        setMission,
        resetAll,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = React.useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
