import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.attireplanner.app',
  appName: 'Attire Planner',
  webDir: 'dist/attire-planner/browser',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInsetAdjustmentBehavior: 'never'
  }
};

export default config;
