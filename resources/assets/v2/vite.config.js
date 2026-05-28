import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

function manualChunks(id) {
    if (id.includes('node_modules')) {
        return 'vendor';
    }
}

export default defineConfig({
    plugins: [
        vue(),
        laravel({
            input: [
                'resources/assets/v2/src/css/app.css',
                'resources/assets/v2/src/main.js',
                'resources/assets/v2/src/sass/app.scss',
            ],
            publicDirectory: 'public',
            buildDirectory: 'build/v2',
            refresh: true,
        }),
    ],
    build: {
        rollupOptions: {
            output: {manualChunks},
        },
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    server: {
        cors: true,
        watch: {usePolling: true},
        port: 5173,
        host: true,
    },
});
