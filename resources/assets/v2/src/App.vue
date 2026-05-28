<template>
    <div class="ff-app" :class="{'dark': prefs.darkMode}">
        <template v-if="booted">
            <AppSidebar />
            <div class="ff-main">
                <AppTopbar />
                <main class="ff-content">
                    <RouterView v-slot="{Component, route}">
                        <Transition name="fade" mode="out-in">
                            <component :is="Component" :key="route.path" />
                        </Transition>
                    </RouterView>
                </main>
            </div>
        </template>
        <div v-else class="ff-boot-loader">
            <span class="ff-spinner"></span>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {RouterView} from 'vue-router';
import AppSidebar from './components/layout/AppSidebar.vue';
import AppTopbar from './components/layout/AppTopbar.vue';
import {usePreferencesStore} from './stores/preferences.js';

const prefs = usePreferencesStore();
const booted = ref(false);

onMounted(async () => {
    await prefs.load();
    booted.value = true;
});
</script>

<style>
.ff-app {
    display: flex;
    min-height: 100vh;
}

.ff-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin-left: var(--ff-sidebar-width);
    min-width: 0;
}

.ff-content {
    flex: 1;
    padding: 24px;
    background: var(--ff-bg);
}

.ff-boot-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    background: var(--ff-bg);
}

.ff-spinner {
    display: inline-block;
    width: 32px;
    height: 32px;
    border: 3px solid var(--ff-border);
    border-top-color: var(--ff-sidebar-accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
    .ff-main { margin-left: 0; }
}
</style>
