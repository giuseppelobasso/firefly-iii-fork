<template>
    <div class="view">
        <h1 class="view-title"><i class="fa-solid fa-gear"></i> Profile</h1>

        <div v-if="loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>

        <template v-else>
            <!-- User info -->
            <div class="ff-card profile-section">
                <h2 class="section-title">Account</h2>
                <div class="profile-row">
                    <span class="profile-label">Email</span>
                    <span>{{ auth.user?.attributes?.email }}</span>
                </div>
                <div class="profile-row">
                    <span class="profile-label">Name</span>
                    <span>{{ auth.user?.attributes?.email }}</span>
                </div>
                <div class="profile-row">
                    <span class="profile-label">Role</span>
                    <span class="badge">{{ auth.user?.attributes?.role }}</span>
                </div>
            </div>

            <!-- Preferences -->
            <div class="ff-card profile-section">
                <h2 class="section-title">Preferences</h2>
                <div class="profile-row">
                    <span class="profile-label">View Range</span>
                    <select class="ff-select" v-model="prefs.viewRange" @change="savePreference('viewRange', prefs.viewRange)">
                        <option value="1D">Day</option>
                        <option value="1W">Week</option>
                        <option value="1M">Month</option>
                        <option value="3M">Quarter</option>
                        <option value="6M">Half year</option>
                        <option value="1Y">Year</option>
                    </select>
                </div>
                <div class="profile-row">
                    <span class="profile-label">Dark Mode</span>
                    <label class="toggle">
                        <input type="checkbox" v-model="prefs.darkMode" @change="savePreference('darkMode', prefs.darkMode)" />
                        <span class="toggle-track"></span>
                    </label>
                </div>
            </div>

            <!-- Actions -->
            <div class="ff-card profile-section">
                <h2 class="section-title">Session</h2>
                <button class="ff-btn ff-btn-danger" @click="auth.logout()">
                    <i class="fa-solid fa-right-from-bracket"></i> Logout
                </button>
            </div>
        </template>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useAuthStore} from '../stores/auth.js';
import {usePreferencesStore} from '../stores/preferences.js';
import {preferences as prefsApi} from '../api/client.js';

const auth = useAuthStore();
const prefs = usePreferencesStore();
const loading = ref(false);

async function savePreference(name, value) {
    try {
        await prefsApi.update(name, {data: value});
    } catch {
        // best effort
    }
}

onMounted(async () => {
    loading.value = true;
    if (!auth.user) await auth.fetchUser();
    loading.value = false;
});
</script>

<style scoped>
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
.view-loading { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); margin-bottom: 16px; }
.profile-section {}
.section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: var(--ff-text-muted); margin-bottom: 16px; }
.profile-row { display: flex; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--ff-border); gap: 16px; }
.profile-row:last-child { border-bottom: none; }
.profile-label { width: 140px; font-weight: 500; font-size: 13.5px; flex-shrink: 0; }
.badge { font-size: 11px; font-weight: 700; background: rgba(99,102,241,.15); color: var(--ff-sidebar-accent); padding: 2px 8px; border-radius: 99px; text-transform: uppercase; }
.ff-select { padding: 6px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-bg); color: var(--ff-text); font-size: 14px; outline: none; }
.ff-select:focus { border-color: var(--ff-sidebar-accent); }
.toggle { position: relative; display: inline-block; width: 40px; height: 22px; cursor: pointer; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-track { position: absolute; inset: 0; background: var(--ff-border); border-radius: 11px; transition: background .2s; }
.toggle input:checked + .toggle-track { background: var(--ff-sidebar-accent); }
.toggle-track::after { content: ''; position: absolute; left: 3px; top: 3px; width: 16px; height: 16px; background: #fff; border-radius: 50%; transition: transform .2s; }
.toggle input:checked + .toggle-track::after { transform: translateX(18px); }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-danger { background: #ef4444; color: #fff; }
</style>

