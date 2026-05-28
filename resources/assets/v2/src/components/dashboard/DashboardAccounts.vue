<template>
    <DashboardCard title="Asset accounts" icon="fa-solid fa-piggy-bank" link="/accounts/asset">
        <div v-if="loading" class="card-skeleton-list">
            <div v-for="i in 4" :key="i" class="card-skeleton-row"></div>
        </div>
        <div v-else-if="!accounts.length" class="card-empty">No accounts found.</div>
        <ul v-else class="account-list">
            <li v-for="acc in accounts" :key="acc.id" class="account-item">
                <div class="account-info">
                    <span class="account-name">{{ acc.attributes.name }}</span>
                    <span class="account-type">{{ acc.attributes.account_type }}</span>
                </div>
                <span class="account-balance" :class="balanceClass(acc.attributes.current_balance)">
                    {{ formatCurrency(acc.attributes.current_balance, acc.attributes.currency_code) }}
                </span>
            </li>
        </ul>
    </DashboardCard>
</template>

<script setup>
import DashboardCard from './DashboardCard.vue';

defineProps({
    accounts: {type: Array, default: () => []},
    loading: {type: Boolean, default: false},
});

function formatCurrency(value, currency = 'EUR') {
    const n = parseFloat(value);
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {style: 'currency', currency, minimumFractionDigits: 2}).format(n);
}

function balanceClass(value) {
    const n = parseFloat(value);
    if (isNaN(n)) return '';
    return n >= 0 ? 'balance-positive' : 'balance-negative';
}
</script>

<style scoped>
.account-list { list-style: none; margin: 0; padding: 0; }

.account-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--ff-border);
}
.account-item:last-child { border-bottom: none; }

.account-info { display: flex; flex-direction: column; gap: 2px; }
.account-name { font-size: 13.5px; font-weight: 500; color: var(--ff-text-primary); }
.account-type { font-size: 11px; color: var(--ff-text-muted); text-transform: capitalize; }

.account-balance { font-size: 14px; font-weight: 600; }
.balance-positive { color: var(--ff-positive); }
.balance-negative { color: var(--ff-negative); }

.card-skeleton-list { display: flex; flex-direction: column; gap: 12px; }
.card-skeleton-row {
    height: 36px;
    background: linear-gradient(90deg, var(--ff-border) 25%, rgba(0,0,0,0.04) 50%, var(--ff-border) 75%);
    background-size: 200% 100%;
    border-radius: 6px;
    animation: shimmer 1.4s infinite;
}
@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }

.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 12px 0; }
</style>
