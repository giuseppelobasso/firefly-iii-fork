<template>
    <div class="dashboard">
        <!-- Date is driven by preferences store -->
        <div class="dashboard-header">
            <RouterLink to="/transactions/withdrawal/create" class="ff-btn ff-btn-primary">
                <i class="fa-solid fa-plus"></i> New transaction
            </RouterLink>
        </div>

        <!-- Summary boxes -->
        <div class="dashboard-summary">
            <SummaryBox
                v-for="box in summaryBoxes"
                :key="box.key"
                :label="box.label"
                :value="box.value"
                :currency="box.currency"
                :icon="box.icon"
                :variant="box.variant"
                :loading="store.loading.summary"
            />
        </div>

        <!-- Main grid -->
        <div class="dashboard-grid">
            <!-- Left column -->
            <div class="dashboard-col dashboard-col--main">
                <DashboardAccounts
                    :accounts="store.accounts"
                    :loading="store.loading.accounts"
                />
                <DashboardTransactions
                    :transactions="store.transactions"
                    :loading="store.loading.transactions"
                />
            </div>

            <!-- Right column -->
            <div class="dashboard-col dashboard-col--side">
                <DashboardBudgets
                    :budgets="store.budgets"
                    :loading="store.loading.budgets"
                />
                <DashboardPiggies
                    :piggies="store.piggies"
                    :loading="store.loading.piggies"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, watch} from 'vue';
import {RouterLink} from 'vue-router';
import {useDashboardStore} from '../stores/dashboard.js';
import {usePreferencesStore} from '../stores/preferences.js';
import SummaryBox from '../components/dashboard/SummaryBox.vue';
import DashboardAccounts from '../components/dashboard/DashboardAccounts.vue';
import DashboardTransactions from '../components/dashboard/DashboardTransactions.vue';
import DashboardBudgets from '../components/dashboard/DashboardBudgets.vue';
import DashboardPiggies from '../components/dashboard/DashboardPiggies.vue';

const store = useDashboardStore();
const prefs = usePreferencesStore();

// Find the first entry in store.summary whose key starts with the given prefix.
function findSummaryEntry(prefix) {
    const entry = Object.values(store.summary).find(e => e?.key?.startsWith(prefix));
    return entry ?? null;
}

const summaryBoxes = computed(() => {
    const netWorth = findSummaryEntry('net-worth-in-');
    const earned   = findSummaryEntry('earned-in-');
    const spent    = findSummaryEntry('spent-in-');
    const saved    = findSummaryEntry('balance-in-');
    return [
        {
            key: 'net-worth', label: 'Net worth', icon: 'fa-solid fa-scale-balanced', variant: 'neutral',
            value: netWorth?.monetary_value ?? null, currency: netWorth?.currency_code ?? 'EUR',
        },
        {
            key: 'earned', label: 'Earned', icon: 'fa-solid fa-arrow-trend-up', variant: 'positive',
            value: earned?.monetary_value ?? null, currency: earned?.currency_code ?? 'EUR',
        },
        {
            key: 'spent', label: 'Spent', icon: 'fa-solid fa-arrow-trend-down', variant: 'negative',
            value: spent?.monetary_value ?? null, currency: spent?.currency_code ?? 'EUR',
        },
        {
            key: 'saved', label: 'Saved', icon: 'fa-solid fa-piggy-bank', variant: 'positive',
            value: saved?.monetary_value ?? null, currency: saved?.currency_code ?? 'EUR',
        },
    ];
});

function load() {
    store.loadAll(prefs.start, prefs.end);
}

onMounted(load);
watch([() => prefs.start, () => prefs.end], load);
</script>

<style scoped>
.dashboard-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.dashboard-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: 1fr 360px;
    gap: 20px;
}

.dashboard-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

@media (max-width: 1100px) {
    .dashboard-grid { grid-template-columns: 1fr; }
}

/* Shared button style */
.ff-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    text-decoration: none;
    transition: filter 0.15s;
}
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-primary {
    background: var(--ff-sidebar-accent);
    color: #fff;
}
</style>
