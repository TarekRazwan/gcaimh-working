import React, { createContext, useContext } from 'react';
import { TherapistClientBridgeProvider } from '../types/therapistClientBridge';
import { TherapistClientBridgeMockProvider } from '../providers/TherapistClientBridgeMockProvider';
import { TherapistClientBridgeRealProvider } from '../providers/TherapistClientBridgeRealProvider';
import { featureFlags } from '../utils/featureFlags';

const TherapistClientBridgeContext = createContext<TherapistClientBridgeProvider | null>(null);

function createProvider(): TherapistClientBridgeProvider {
  if (featureFlags.THERAPIST_CLIENT_PORTAL_BRIDGE_USE_MOCK) {
    console.log('[TherapistBridge] Using MOCK provider');
    return new TherapistClientBridgeMockProvider();
  }
  console.log('[TherapistBridge] Using REAL provider');
  return new TherapistClientBridgeRealProvider();
}

// Singleton — one instance per app lifecycle
const providerInstance = createProvider();

export const TherapistClientBridgeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <TherapistClientBridgeContext.Provider value={providerInstance}>
    {children}
  </TherapistClientBridgeContext.Provider>
);

export function useTherapistBridge(): TherapistClientBridgeProvider {
  const ctx = useContext(TherapistClientBridgeContext);
  if (!ctx) throw new Error('useTherapistBridge must be used inside TherapistClientBridgeProviderWrapper');
  return ctx;
}
