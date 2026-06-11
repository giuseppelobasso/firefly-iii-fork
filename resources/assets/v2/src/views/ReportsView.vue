<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-chart-bar"></i> Reports</h1>
            <div class="view-period">
                <span class="period-label">{{ periodLabel }}</span>
                <button class="ff-btn ff-btn-secondary" @click="reload">
                    <i class="fa-solid fa-rotate"></i> Refresh
                </button>
            </div>
        </div>

        <NotificationBar :error="notif.error.value" @close="notif.clear()" />

        <!-- Section 1: Account balances over time -->
        <section class="report-section">
            <h2 class="section-title">
                <i class="fa-solid fa-wallet"></i>
                Account balances
            </h2>
            <div class="ff-card">
                <div v-if="!loadingAccounts && !accountChartData.length" class="chart-empty">No account data for this period.</div>
                <LineChart v-else :data="accountChartData" :loading="loadingAccounts" :height="320" />
            </div>
        </section>

        <!-- Section 2: Income vs Expense by category -->
        <div class="report-row">
            <section class="report-section report-section--half">
                <h2 class="section-title">
                    <i class="fa-solid fa-arrow-trend-down"></i>
                    Expenses by category
                </h2>
                <div class="ff-card">
                    <DoughnutChart
                        :data="expenseByCategoryData"
                        :loading="loadingInsight"
                        :height="260"
                    />
                </div>
            </section>

            <section class="report-section report-section--half">
                <h2 class="section-title">
                    <i class="fa-solid fa-arrow-trend-up"></i>
                    Income by category
                </h2>
                <div class="ff-card">
                    <div v-if="!loadingInsight && !incomeByCategoryData.length" class="chart-empty">No categorised income for this period.</div>
                    <DoughnutChart
                        v-else
                        :data="incomeByCategoryData"
                        :loading="loadingInsight"
                        :height="260"
                    />
                </div>
            </section>
        </div>

        <!-- Section 3: Expenses by budget -->
        <section class="report-section">
            <h2 class="section-title">
                <i class="fa-solid fa-chart-pie"></i>
                Expenses by budget
            </h2>
            <div class="ff-card">
                <BarChart
                    :data="expenseByBudgetData"
                    :horizontal="true"
                    :loading="loadingInsight"
                    :height="Math.max(180, expenseByBudgetData.length * 36)"
                />
            </div>
        </section>

        <!-- Section 4: Sankey flow chart -->
        <section class="report-section">
            <h2 class="section-title">
                <i class="fa-solid fa-diagram-project"></i>
                Money flow (Sankey)
                <span class="section-badge">{{ sankeyFlows.length }} flows</span>
            </h2>
            <div class="ff-card">
                <SankeyChart
                    :flows="sankeyFlows"
                    :labels="sankeyLabels"
                    :loading="sankeyLoading"
                    :height="480"
                />
            </div>
        </section>
    </div>
</template>

<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {usePreferencesStore} from '../stores/preferences.js';
import {useNotifications} from '../composables/useNotifications.js';
import {useSankeyData} from '../composables/useSankeyData.js';
import {charts as chartsApi, insight as insightApi} from '../api/client.js';
import formatMoney from '../util/format-money.js';
import NotificationBar from '../components/ui/NotificationBar.vue';
import LineChart from '../components/charts/LineChart.vue';
import BarChart from '../components/charts/BarChart.vue';
import DoughnutChart from '../components/charts/DoughnutChart.vue';
import SankeyChart from '../components/charts/SankeyChart.vue';

const prefs = usePreferencesStore();
const notif = useNotifications();
const sankey = useSankeyData();

// ── State ────────────────────────────────────────────────────────────────────
const loadingAccounts = ref(false);
const loadingInsight = ref(false);
const accountChartRaw = ref([]);
const expenseByCategoryRaw = ref([]);
const incomeByCategoryRaw = ref([]);
const expenseByBudgetRaw = ref([]);

// ── Computed: period label ────────────────────────────────────────────────────
const periodLabel = computed(() => {
    if (!prefs.start || !prefs.end) return '';
    return `${new Date(prefs.start).toLocaleDateString()} – ${new Date(prefs.end).toLocaleDateString()}`;
});

// ── Computed: chart data adapters ─────────────────────────────────────────────

// /chart/account/dashboard returns array of { label, entries: {date:val}, currency_code }
const accountChartData = computed(() => accountChartRaw.value);

// /insight/expense/category returns array of { name, currency_code, difference, difference_float }
const expenseByCategoryData = computed(() =>
    expenseByCategoryRaw.value.map((item) => ({
        label: item.name || 'No category',
        amount: Math.abs(parseFloat(item.difference_float ?? item.difference ?? 0)),
        currency_code: item.currency_code,
    })).filter((d) => d.amount > 0)
);

const incomeByCategoryData = computed(() =>
    incomeByCategoryRaw.value.map((item) => ({
        label: item.name || 'No category',
        amount: Math.abs(parseFloat(item.difference_float ?? item.difference ?? 0)),
        currency_code: item.currency_code,
    })).filter((d) => d.amount > 0)
);

// /insight/expense/budget returns array of { name, currency_code, difference_float }
const expenseByBudgetData = computed(() =>
    expenseByBudgetRaw.value.map((item) => ({
        label: item.name || 'No budget',
        amount: Math.abs(parseFloat(item.difference_float ?? 0)),
        currency_code: item.currency_code,
    })).filter((d) => d.amount > 0)
);

const sankeyFlows = computed(() => sankey.flows.value);
const sankeyLabels = computed(() => sankey.labels.value);
const sankeyLoading = computed(() => sankey.loading.value);

// ── Data loading ──────────────────────────────────────────────────────────────
function fmt(d) {
    if (!d) return undefined;
    return d instanceof Date ? d.toISOString().slice(0, 10) : d;
}

async function loadAccountChart() {
    loadingAccounts.value = true;
    try {
        const start = fmt(prefs.start);
        const end = fmt(prefs.end);
        const res = await chartsApi.accountDashboard({start, end});
        accountChartRaw.value = Array.isArray(res.data) ? res.data : [];
    } catch (e) {
        notif.showError('Failed to load account chart: ' + (e.response?.data?.message ?? e.message));
    } finally {
        loadingAccounts.value = false;
    }
}

async function loadInsight() {
    loadingInsight.value = true;
    try {
        const start = fmt(prefs.start);
        const end = fmt(prefs.end);
        const [expCat, incCat, expBudget] = await Promise.all([
            insightApi.expense.byCategory({start, end}),
            insightApi.income.byCategory({start, end}),
            insightApi.expense.byBudget({start, end}),
        ]);
        expenseByCategoryRaw.value = expCat.data ?? [];
        incomeByCategoryRaw.value = incCat.data ?? [];
        expenseByBudgetRaw.value = expBudget.data ?? [];
    } catch (e) {
        notif.showError('Failed to load insight data: ' + (e.response?.data?.message ?? e.message));
    } finally {
        loadingInsight.value = false;
    }
}

async function reload() {
    const start = fmt(prefs.start);
    const end = fmt(prefs.end);
    await Promise.all([
        loadAccountChart(),
        loadInsight(),
        sankey.load(start, end),
    ]);
}

onMounted(reload);
watch([() => prefs.start, () => prefs.end], reload);
</script>

<style scoped>
.view-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
}

.view-title {
    font-size: 22px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 10px;
}

.view-period {
    display: flex;
    align-items: center;
    gap: 12px;
}

.period-label {
    font-size: 13px;
    color: var(--ff-text-muted);
}

.report-section {
    margin-bottom: 28px;
}

.chart-empty {
    padding: 40px;
    text-align: center;
    color: var(--ff-text-muted);
    font-size: 13px;
}

.report-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 28px;
}

@media (max-width: 900px) {
    .report-row { grid-template-columns: 1fr; }
}

.section-title {
    font-size: 15px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 12px;
    color: var(--ff-text);
}

.section-badge {
    font-size: 11px;
    background: rgba(99, 102, 241, .15);
    color: var(--ff-sidebar-accent);
    padding: 2px 8px;
    border-radius: 99px;
    font-weight: 600;
}

.ff-card {
    background: var(--ff-card);
    border-radius: 12px;
    padding: 20px;
    border: 1px solid var(--ff-border);
}

.ff-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: filter .15s;
}

.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }
</style>

