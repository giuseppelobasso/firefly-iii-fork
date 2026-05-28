import {defineConfig} from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

function manualChunks(id) {
    if (id.includes('node_modules')) {
        return 'vendor';
    }
}

export default defineConfig({
    base: './',
    build: {
        rollupOptions: {
            output: {manualChunks},
        },
    },
    plugins: [
        vue(),
        laravel({
            input: [
                'src/css/app.css',
                'src/main.js',
            ],
            publicDirectory: '../../../public',
            buildDirectory: 'build/v2',
            refresh: true,
        }),
    ],
    resolve: {
        alias: {
            '@': '/src',
        },
    },
    server: {
        cors: true,
        watch: {usePolling: true},
        port: 5173,
        host: true,
    },
});
