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
    css: {
        preprocessorOptions: {
            scss: {
                // Hide Sass deprecation noise coming from external dependencies.
                quietDeps: true,
            },
        },
    },
    build: {
        rollupOptions: {
            output: {manualChunks},
        },
    },
    resolve: {
        alias: {
            'vue': fileURLToPath(new URL('./node_modules/vue/dist/vue.esm-bundler.js', import.meta.url)),
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
