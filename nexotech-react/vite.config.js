import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Las imágenes están en src/public/img y se sirven como /img/...
  publicDir: 'src/public',
  server: {
    proxy: {
      // /api/productos.php -> http://localhost/nexotech-api/productos.php (Apache de XAMPP)
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        rewrite: (ruta) => ruta.replace(/^\/api/, '/nexotech-api'),
      },
    },
  },
});
