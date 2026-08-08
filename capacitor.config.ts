import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.forgelearning.app',
  appName: 'Forge Learning',
  webDir: 'mobile-web',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    iosScheme: 'https'
  },
  ios: {
    // Let the web view draw edge-to-edge. The web shell owns safe-area
    // padding for its header, content, and floating tab bar; automatic
    // insets create the white/black strips visible on every native route.
    contentInset: 'never'
  }
};

export default config;
