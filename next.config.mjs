/** @type {import('next').NextConfig} */
const nextConfig = {
  // Skjuler hvilken teknologi siden kører på.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: '/:sti*',
        headers: [
          // Browseren må ikke gætte filtyper.
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Siden må ikke vises i en ramme på et andet domæne.
          { key: 'X-Frame-Options', value: 'DENY' },
          // Send ikke den fulde adresse med til andre sider.
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Vi bruger hverken kamera, mikrofon eller placering.
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Sider med virksomhedsoplysninger må aldrig caches undervejs.
        source: '/(svar|mine-tilbud)/:sti*',
        headers: [{ key: 'Cache-Control', value: 'no-store, max-age=0' }],
      },
    ];
  },
};

export default nextConfig;
