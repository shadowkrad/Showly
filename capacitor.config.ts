import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'eu.taaaac.showly',
  appName: 'Showly',
  webDir: 'mobile-shell',
  server: {
    // 🛡️ Wrapper Nativo Showly con FLAG_SECURE:
    // Punta al server live o all'istanza Vercel del tenant per servire sempre l'ultima versione.
    // In produzione impostare l'URL del tenant, es: "https://showly.taaaac.eu" o "https://cliente-demo.vercel.app"
    androidScheme: 'https',
    cleartext: true,
  },
};

export default config;
