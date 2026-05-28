<template>
    <DashboardCard title="Piggy banks" icon="fa-solid fa-coins" link="/piggy-banks">
        <div v-if="loading" class="card-skeleton-list">
            <div v-for="i in 3" :key="i" class="card-skeleton-row" style="height: 52px;"></div>
        </div>
        <div v-else-if="!piggies.length" class="card-empty">No piggy banks configured.</div>
        <ul v-else class="piggy-list">
            <li v-for="p in piggies" :key="p.id" class="piggy-item">
                <div class="piggy-header">
                    <span class="piggy-name">{{ p.attributes.name }}</span>
                    <span class="piggy-amounts">
                        <span class="piggy-saved">{{ fmt(p.attributes.current_amount, p.attributes.currency_code) }}</span>
                        <span class="piggy-sep">/</span>
                        <span class="piggy-target">{{ fmt(p.attributes.target_amount, p.attributes.currency_code) }}</span>
                    </span>
                </div>
                <div class="piggy-bar-track">
                    <div class="piggy-bar-fill" :style="{width: pct(p) + '%'}"></div>
                </div>
            </li>
        </ul>
    </DashboardCard>
</template>

<script setup>
import DashboardCard from './DashboardCard.vue';

defineProps({
    piggies: {type: Array, default: () => []},
    loading: {type: Boolean, default: false},
});

function fmt(value, currency = 'EUR') {
    const n = parseFloat(value ?? 0);
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {style: 'currency', currency, minimumFractionDigits: 0}).format(n);
}

function pct(p) {
    const current = parseFloat(p.attributes.current_amount ?? 0);
    const target = parseFloat(p.attributes.target_amount ?? 0);
    if (!target) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
}
</script>

<style scoped>
.piggy-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }

.piggy-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
.piggy-name { font-size: 13px; font-weight: 500; color: var(--ff-text-primary); }
.piggy-amounts { font-size: 12px; color: var(--ff-text-muted); }
.piggy-saved { color: var(--ff-text-primary); font-weight: 600; }
.piggy-sep { margin: 0 3px; }

.piggy-bar-track {
    height: 6px;
    background: var(--ff-border);
    border-radius: 99px;
    overflow: hidden;
}
.piggy-bar-fill {
    height: 100%;
    background: var(--ff-positive);
    border-radius: 99px;
    transition: width 0.4s ease;
}

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
