<template>
    <header class="ff-topbar">
        <div class="ff-topbar-left">
            <h1 class="ff-topbar-title">{{ pageTitle }}</h1>
        </div>

        <div class="ff-topbar-right">
            <!-- Date range picker -->
            <div class="ff-daterange" ref="dateRangeRef">
                <button class="ff-daterange-btn" @click="showPicker = !showPicker">
                    <i class="fa-regular fa-calendar-days"></i>
                    <span>{{ formattedRange }}</span>
                    <i class="fa-solid fa-chevron-down ff-daterange-chevron" :class="{'rotated': showPicker}"></i>
                </button>
                <Transition name="dropdown">
                    <div v-if="showPicker" class="ff-daterange-dropdown">
                        <button class="ff-daterange-option ff-daterange-option--active" @click="setPreset('current')">
                            <i class="fa-regular fa-circle-dot"></i> Current period
                        </button>
                        <div class="ff-daterange-divider"></div>
                        <button class="ff-daterange-option" @click="prefs.shiftRange('prev')">
                            <i class="fa-solid fa-chevron-left"></i> Previous
                        </button>
                        <button class="ff-daterange-option" @click="prefs.shiftRange('next')">
                            <i class="fa-solid fa-chevron-right"></i> Next
                        </button>
                        <div class="ff-daterange-divider"></div>
                        <button class="ff-daterange-option" @click="setPreset('7d')">Last 7 days</button>
                        <button class="ff-daterange-option" @click="setPreset('30d')">Last 30 days</button>
                        <button class="ff-daterange-option" @click="setPreset('mtd')">Month to date</button>
                        <button class="ff-daterange-option" @click="setPreset('ytd')">Year to date</button>
                    </div>
                </Transition>
            </div>

            <!-- User menu -->
            <div class="ff-user-menu" ref="userMenuRef">
                <button class="ff-user-btn" @click="showUser = !showUser">
                    <i class="fa-solid fa-circle-user"></i>
                </button>
                <Transition name="dropdown">
                    <div v-if="showUser" class="ff-user-dropdown">
                        <div class="ff-user-info">
                            <p class="ff-user-email">{{ auth.user?.attributes?.email }}</p>
                        </div>
                        <div class="ff-daterange-divider"></div>
                        <RouterLink to="/profile" class="ff-user-option" @click="showUser = false">
                            <i class="fa-solid fa-gear"></i> Profile
                        </RouterLink>
                        <button class="ff-user-option ff-user-option--danger" @click="auth.logout()">
                            <i class="fa-solid fa-right-from-bracket"></i> Logout
                        </button>
                    </div>
                </Transition>
            </div>
        </div>
    </header>
</template>

<script setup>
import {ref, computed} from 'vue';
import {useRoute, RouterLink} from 'vue-router';
import {useAuthStore} from '../../stores/auth.js';
import {usePreferencesStore} from '../../stores/preferences.js';
import {onClickOutside} from '../../composables/onClickOutside.js';
import {format} from 'date-fns';
import {getViewRange} from '../../support/get-viewrange.js';

const auth = useAuthStore();
const prefs = usePreferencesStore();
const route = useRoute();

const showPicker = ref(false);
const showUser = ref(false);
const dateRangeRef = ref(null);
const userMenuRef = ref(null);

onClickOutside(dateRangeRef, () => { showPicker.value = false; });
onClickOutside(userMenuRef, () => { showUser.value = false; });

const pageTitle = computed(() => route.meta?.title ?? 'Firefly III');

const formattedRange = computed(() => {
    if (!prefs.start || !prefs.end) return '—';
    const s = new Date(prefs.start);
    const e = new Date(prefs.end);
    return `${format(s, 'dd MMM yyyy')} – ${format(e, 'dd MMM yyyy')}`;
});

function setPreset(preset) {
    const now = new Date();
    let range;
    if (preset === 'current') {
        range = getViewRange(prefs.viewRange, now);
    } else if (preset === '7d') {
        const s = new Date(now); s.setDate(s.getDate() - 6);
        range = {start: s, end: now};
    } else if (preset === '30d') {
        const s = new Date(now); s.setDate(s.getDate() - 29);
        range = {start: s, end: now};
    } else if (preset === 'mtd') {
        range = {start: new Date(now.getFullYear(), now.getMonth(), 1), end: now};
    } else if (preset === 'ytd') {
        range = {start: new Date(now.getFullYear(), 0, 1), end: now};
    }
    if (range) prefs.setDateRange(range.start, range.end);
    showPicker.value = false;
}
</script>

<style scoped>
.ff-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: var(--ff-topbar-height);
    padding: 0 24px;
    background: var(--ff-card-bg);
    border-bottom: 1px solid var(--ff-border);
    position: sticky;
    top: 0;
    z-index: 50;
    gap: 16px;
}

.ff-topbar-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--ff-text-primary);
}

.ff-topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

/* Date range */
.ff-daterange { position: relative; }

.ff-daterange-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 14px;
    background: var(--ff-bg);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    font-size: 13px;
    color: var(--ff-text-primary);
    cursor: pointer;
    transition: border-color 0.15s;
}
.ff-daterange-btn:hover { border-color: var(--ff-sidebar-accent); }

.ff-daterange-chevron { font-size: 10px; transition: transform 0.2s; }
.ff-daterange-chevron.rotated { transform: rotate(180deg); }

.ff-daterange-dropdown, .ff-user-dropdown {
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    background: var(--ff-card-bg);
    border: 1px solid var(--ff-border);
    border-radius: 10px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    min-width: 180px;
    padding: 6px;
    z-index: 200;
}

.ff-daterange-option, .ff-user-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 7px 10px;
    background: none;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    color: var(--ff-text-primary);
    cursor: pointer;
    text-decoration: none;
    transition: background 0.12s;
    text-align: left;
}
.ff-daterange-option:hover, .ff-user-option:hover { background: var(--ff-bg); }
.ff-daterange-option--active { color: var(--ff-sidebar-accent); font-weight: 500; }
.ff-user-option--danger { color: var(--ff-negative); }

.ff-daterange-divider {
    height: 1px;
    background: var(--ff-border);
    margin: 4px 0;
}

/* User */
.ff-user-menu { position: relative; }

.ff-user-btn {
    background: none;
    border: none;
    font-size: 24px;
    color: var(--ff-text-muted);
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: color 0.15s;
}
.ff-user-btn:hover { color: var(--ff-text-primary); }

.ff-user-info { padding: 6px 10px 4px; }
.ff-user-email { margin: 0; font-size: 12px; color: var(--ff-text-muted); }

/* Transitions */
.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.12s, transform 0.12s; }
.dropdown-enter-from, .dropdown-leave-to { opacity: 0; transform: translateY(-4px); }
</style>
