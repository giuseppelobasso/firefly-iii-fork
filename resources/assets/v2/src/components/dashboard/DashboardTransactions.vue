<template>
    <DashboardCard title="Recent transactions" icon="fa-solid fa-arrow-right-arrow-left" link="/transactions/all">
        <div v-if="loading" class="card-skeleton-list">
            <div v-for="i in 5" :key="i" class="card-skeleton-row"></div>
        </div>
        <div v-else-if="!transactions.length" class="card-empty">No transactions found.</div>
        <ul v-else class="tx-list">
            <li v-for="tx in transactions" :key="tx.id" class="tx-item">
                <div class="tx-icon" :class="`tx-icon--${txType(tx)}`">
                    <i :class="txIcon(tx)"></i>
                </div>
                <div class="tx-info">
                    <span class="tx-desc">{{ firstSplit(tx).description }}</span>
                    <span class="tx-date">{{ formatDate(firstSplit(tx).date) }}</span>
                </div>
                <span class="tx-amount" :class="`tx-amount--${txType(tx)}`">
                    {{ formatCurrency(firstSplit(tx).amount, firstSplit(tx).currency_code) }}
                </span>
            </li>
        </ul>
    </DashboardCard>
</template>

<script setup>
import {format} from 'date-fns';
import DashboardCard from './DashboardCard.vue';

defineProps({
    transactions: {type: Array, default: () => []},
    loading: {type: Boolean, default: false},
});

function firstSplit(tx) {
    return tx?.attributes?.transactions?.[0] ?? {};
}

function txType(tx) {
    const t = firstSplit(tx)?.transaction_type_string ?? '';
    if (t === 'Withdrawal') return 'negative';
    if (t === 'Deposit') return 'positive';
    return 'neutral';
}

function txIcon(tx) {
    const type = txType(tx);
    if (type === 'negative') return 'fa-solid fa-arrow-trend-down';
    if (type === 'positive') return 'fa-solid fa-arrow-trend-up';
    return 'fa-solid fa-right-left';
}

function formatDate(value) {
    if (!value) return '—';
    try { return format(new Date(value), 'dd MMM'); } catch { return value; }
}

function formatCurrency(value, currency = 'EUR') {
    const n = parseFloat(value);
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {style: 'currency', currency, minimumFractionDigits: 2}).format(n);
}
</script>

<style scoped>
.tx-list { list-style: none; margin: 0; padding: 0; }

.tx-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 9px 0;
    border-bottom: 1px solid var(--ff-border);
}
.tx-item:last-child { border-bottom: none; }

.tx-icon {
    width: 34px;
    height: 34px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    flex-shrink: 0;
}
.tx-icon--positive { background: rgba(56,161,105,0.12); color: var(--ff-positive); }
.tx-icon--negative { background: rgba(229,62,62,0.10); color: var(--ff-negative); }
.tx-icon--neutral  { background: rgba(79,142,247,0.12); color: var(--ff-sidebar-accent); }

.tx-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.tx-desc { font-size: 13px; font-weight: 500; color: var(--ff-text-primary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.tx-date { font-size: 11px; color: var(--ff-text-muted); }

.tx-amount { font-size: 13.5px; font-weight: 600; white-space: nowrap; }
.tx-amount--positive { color: var(--ff-positive); }
.tx-amount--negative { color: var(--ff-negative); }
.tx-amount--neutral  { color: var(--ff-sidebar-accent); }

.card-skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.card-skeleton-row {
    height: 34px;
    background: linear-gradient(90deg, var(--ff-border) 25%, rgba(0,0,0,0.04) 50%, var(--ff-border) 75%);
    background-size: 200% 100%;
    border-radius: 6px;
    animation: shimmer 1.4s infinite;
}
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 12px 0; }
</style>
