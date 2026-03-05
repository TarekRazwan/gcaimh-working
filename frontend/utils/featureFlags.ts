/**
 * Feature Flags System
 *
 * Centralized feature flag management with env var support and typed defaults.
 * Add new flags to FeatureFlags interface and provide defaults in getFeatureFlags().
 */

export interface FeatureFlags {
  // Client Portal (homework, tools, journal)
  CLIENT_PORTAL_ENABLED: boolean;
  CLIENT_PORTAL_USE_MOCK_PROVIDER: boolean;
  // Therapist ↔ Client Portal Bridge (between-session plan management)
  THERAPIST_CLIENT_PORTAL_BRIDGE: boolean;
  THERAPIST_CLIENT_PORTAL_BRIDGE_USE_MOCK: boolean;
}

/**
 * Get feature flags from environment variables with typed defaults
 */
export const getFeatureFlags = (): FeatureFlags => {
  return {
    // Client Portal is enabled by default for development
    // Set VITE_CLIENT_PORTAL_ENABLED=false to disable
    CLIENT_PORTAL_ENABLED:
      import.meta.env.VITE_CLIENT_PORTAL_ENABLED !== 'false',

    // Use mock provider by default (no backend required)
    // Set VITE_CLIENT_PORTAL_USE_MOCK_PROVIDER=false when real provider is ready
    CLIENT_PORTAL_USE_MOCK_PROVIDER:
      import.meta.env.VITE_CLIENT_PORTAL_USE_MOCK_PROVIDER !== 'false',

    // Therapist ↔ Client Portal Bridge — enabled by default
    // Set VITE_THERAPIST_CLIENT_PORTAL_BRIDGE=false to hide the feature
    THERAPIST_CLIENT_PORTAL_BRIDGE:
      import.meta.env.VITE_THERAPIST_CLIENT_PORTAL_BRIDGE !== 'false',

    // Use mock bridge provider by default (no backend required)
    // Set VITE_THERAPIST_CLIENT_PORTAL_BRIDGE_USE_MOCK=false when real provider is ready
    THERAPIST_CLIENT_PORTAL_BRIDGE_USE_MOCK:
      import.meta.env.VITE_THERAPIST_CLIENT_PORTAL_BRIDGE_USE_MOCK !== 'false',
  };
};

// Export a singleton instance for convenience
export const featureFlags = getFeatureFlags();
