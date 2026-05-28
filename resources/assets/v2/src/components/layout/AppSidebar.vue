<template>
    <aside class="ff-sidebar" :class="{'ff-sidebar--collapsed': collapsed}">
        <!-- Logo -->
        <div class="ff-sidebar-header">
            <RouterLink to="/dashboard" class="ff-sidebar-logo">
                <i class="fa-solid fa-fire-flame-curved"></i>
                <span class="ff-sidebar-logo-text">Firefly III</span>
            </RouterLink>
            <button class="ff-sidebar-toggle" @click="collapsed = !collapsed" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'">
                <i :class="collapsed ? 'fa-solid fa-chevron-right' : 'fa-solid fa-chevron-left'"></i>
            </button>
        </div>

        <!-- Navigation -->
        <nav class="ff-sidebar-nav">
            <div class="ff-sidebar-section">
                <p class="ff-sidebar-section-label">Overview</p>
                <NavItem to="/dashboard" icon="fa-solid fa-gauge-high" label="Dashboard" />
            </div>

            <div class="ff-sidebar-section">
                <p class="ff-sidebar-section-label">Money</p>
                <NavItem to="/transactions/withdrawal" icon="fa-solid fa-arrow-trend-down" label="Expenses" />
                <NavItem to="/transactions/deposit" icon="fa-solid fa-arrow-trend-up" label="Income" />
                <NavItem to="/transactions/transfer" icon="fa-solid fa-right-left" label="Transfers" />
            </div>

            <div class="ff-sidebar-section">
                <p class="ff-sidebar-section-label">Accounts</p>
                <NavItem to="/accounts/asset" icon="fa-solid fa-piggy-bank" label="Asset accounts" />
                <NavItem to="/accounts/expense" icon="fa-solid fa-store" label="Expense accounts" />
                <NavItem to="/accounts/revenue" icon="fa-solid fa-building-columns" label="Revenue accounts" />
                <NavItem to="/accounts/liabilities" icon="fa-solid fa-file-invoice-dollar" label="Liabilities" />
            </div>

            <div class="ff-sidebar-section">
                <p class="ff-sidebar-section-label">Planning</p>
                <NavItem to="/budgets" icon="fa-solid fa-chart-pie" label="Budgets" />
                <NavItem to="/categories" icon="fa-solid fa-tags" label="Categories" />
                <NavItem to="/piggy-banks" icon="fa-solid fa-coins" label="Piggy banks" />
                <NavItem to="/subscriptions" icon="fa-solid fa-rotate" label="Subscriptions" />
            </div>

            <div class="ff-sidebar-section">
                <p class="ff-sidebar-section-label">Reports</p>
                <NavItem to="/reports" icon="fa-solid fa-chart-bar" label="Reports" />
                <NavItem to="/tags" icon="fa-solid fa-tag" label="Tags" />
            </div>
        </nav>

        <!-- User at bottom -->
        <div class="ff-sidebar-footer">
            <RouterLink to="/profile" class="ff-sidebar-user">
                <span class="ff-sidebar-user-avatar">
                    <i class="fa-solid fa-circle-user"></i>
                </span>
                <span class="ff-sidebar-user-name">{{ auth.user?.attributes?.email ?? '' }}</span>
            </RouterLink>
        </div>
    </aside>
</template>

<script setup>
import {ref} from 'vue';
import {RouterLink} from 'vue-router';
import {useAuthStore} from '../../stores/auth.js';
import NavItem from './NavItem.vue';

const auth = useAuthStore();
const collapsed = ref(false);
</script>

<style scoped>
.ff-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: var(--ff-sidebar-width);
    height: 100vh;
    background: var(--ff-sidebar-bg);
    display: flex;
    flex-direction: column;
    z-index: 100;
    transition: width 0.2s ease;
    overflow: hidden;
}

.ff-sidebar--collapsed {
    width: 64px;
}

.ff-sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 16px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}

.ff-sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--ff-sidebar-text-active);
    font-weight: 700;
    font-size: 15px;
}

.ff-sidebar-logo i {
    font-size: 20px;
    color: var(--ff-sidebar-accent);
    flex-shrink: 0;
}

.ff-sidebar-logo-text {
    white-space: nowrap;
    overflow: hidden;
}

.ff-sidebar--collapsed .ff-sidebar-logo-text { display: none; }

.ff-sidebar-toggle {
    background: none;
    border: none;
    color: var(--ff-sidebar-text);
    cursor: pointer;
    padding: 4px;
    font-size: 12px;
    border-radius: 4px;
    transition: background 0.15s;
}
.ff-sidebar-toggle:hover { background: rgba(255,255,255,0.08); }

.ff-sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.ff-sidebar-section {
    margin-bottom: 4px;
}

.ff-sidebar-section-label {
    margin: 0;
    padding: 10px 20px 4px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: rgba(168,184,216,0.45);
    white-space: nowrap;
    overflow: hidden;
}

.ff-sidebar--collapsed .ff-sidebar-section-label { opacity: 0; }

.ff-sidebar-footer {
    border-top: 1px solid rgba(255,255,255,0.06);
    padding: 12px 16px;
}

.ff-sidebar-user {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--ff-sidebar-text);
    font-size: 13px;
    border-radius: 8px;
    padding: 6px 4px;
    transition: color 0.15s;
}
.ff-sidebar-user:hover { color: var(--ff-sidebar-text-active); }

.ff-sidebar-user-avatar { font-size: 22px; flex-shrink: 0; }
.ff-sidebar-user-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ff-sidebar--collapsed .ff-sidebar-user-name { display: none; }
</style>
