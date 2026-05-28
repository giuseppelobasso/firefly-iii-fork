<template>
    <DashboardCard title="Budgets" icon="fa-solid fa-chart-pie" link="/budgets">
        <div v-if="loading" class="card-skeleton-list">
            <div v-for="i in 4" :key="i" class="card-skeleton-row" style="height: 52px;"></div>
        </div>
        <div v-else-if="!budgets.length" class="card-empty">No budgets configured.</div>
        <ul v-else class="budget-list">
            <li v-for="b in budgets" :key="b.id" class="budget-item">
                <div class="budget-header">
                    <span class="budget-name">{{ b.attributes.name }}</span>
                    <span class="budget-amounts">
                        <span class="budget-spent">{{ fmt(b.attributes.spent?.[0]?.sum) }}</span>
                        <span class="budget-separator">/</span>
                        <span class="budget-limit">{{ fmt(b.attributes.limit) }}</span>
                    </span>
                </div>
                <div class="budget-bar-track">
                    <div class="budget-bar-fill" :class="{'budget-bar-fill--over': pct(b) > 100}" :style="{width: Math.min(pct(b), 100) + '%'}"></div>
                </div>
            </li>
        </ul>
    </DashboardCard>
</template>

<script setup>
import DashboardCard from './DashboardCard.vue';

defineProps({
    budgets: {type: Array, default: () => []},
    loading: {type: Boolean, default: false},
});

function fmt(value, currency = 'EUR') {
    const n = parseFloat(value ?? 0);
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {style: 'currency', currency, minimumFractionDigits: 0}).format(Math.abs(n));
}

function pct(b) {
    const spent = Math.abs(parseFloat(b.attributes.spent?.[0]?.sum ?? 0));
    const limit = parseFloat(b.attributes.limit ?? 0);
    if (!limit) return 0;
    return Math.round((spent / limit) * 100);
}
</script>

<style scoped>
.budget-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }

.budget-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.budget-name { font-size: 13px; font-weight: 500; color: var(--ff-text-primary); }
.budget-amounts { font-size: 12px; color: var(--ff-text-muted); }
.budget-spent { color: var(--ff-text-primary); font-weight: 600; }
.budget-separator { margin: 0 3px; }

.budget-bar-track {
    height: 6px;
    background: var(--ff-border);
    border-radius: 99px;
    overflow: hidden;
}

.budget-bar-fill {
    height: 100%;
    background: var(--ff-sidebar-accent);
    border-radius: 99px;
    transition: width 0.4s ease;
}
.budget-bar-fill--over { background: var(--ff-negative); }

.card-skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.card-skeleton-row {
    background: linear-gradient(90deg, var(--ff-border) 25%, rgba(0,0,0,0.04) 50%, var(--ff-border) 75%);
    background-size: 200% 100%;
    border-radius: 6px;
    animation: shimmer 1.4s infinite;
}
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 12px 0; }
</style>
