<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-chart-pie"></i> Budgets</h1>
            <div class="view-period">{{ periodLabel }}</div>
        </div>

        <div v-if="store.loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
        <div v-else-if="store.error" class="view-error">{{ store.error }}</div>

        <div v-else class="budgets-grid">
            <div v-for="budget in store.list" :key="budget.id" class="budget-card ff-card">
                <div class="budget-header">
                    <span class="budget-name">{{ budget.attributes?.name }}</span>
                    <span class="budget-active-badge" v-if="budget.attributes?.active">Active</span>
                </div>

                <template v-if="budget._limits?.length">
                    <div v-for="limit in budget._limits" :key="limit.id" class="budget-limit">
                        <div class="budget-limit-info">
                            <span class="budget-spent">
                                {{ formatMoney(limit.attributes?.spent, limit.attributes?.currency_code) }}
                            </span>
                            <span class="budget-limit-amount">
                                of {{ formatMoney(limit.attributes?.amount, limit.attributes?.currency_code) }}
                            </span>
                        </div>
                        <div class="budget-progress-bar">
                            <div
                                class="budget-progress-fill"
                                :class="progressClass(limit)"
                                :style="{width: progressPct(limit) + '%'}"
                            ></div>
                        </div>
                        <div class="budget-remaining">
                            {{ remainingLabel(limit) }}
                        </div>
                    </div>
                </template>
                <div v-else class="budget-no-limit">No limit set for current period</div>
            </div>

            <div v-if="!store.list.length" class="view-empty">No budgets found.</div>
        </div>
    </div>
</template>

<script setup>
import {computed, onMounted, watch} from 'vue';
import {useBudgetsStore} from '../stores/budgets.js';
import {usePreferencesStore} from '../stores/preferences.js';
import formatMoney from '../util/format-money.js';

const store = useBudgetsStore();
const prefs = usePreferencesStore();

const periodLabel = computed(() => {
    if (!prefs.start || !prefs.end) return '';
    return `${new Date(prefs.start).toLocaleDateString()} – ${new Date(prefs.end).toLocaleDateString()}`;
});

function progressPct(limit) {
    const spent = Math.abs(parseFloat(limit.attributes?.spent ?? 0));
    const amount = parseFloat(limit.attributes?.amount ?? 0);
    if (!amount) return 0;
    return Math.min(100, Math.round((spent / amount) * 100));
}

function progressClass(limit) {
    const pct = progressPct(limit);
    if (pct >= 100) return 'over';
    if (pct >= 80) return 'warning';
    return 'ok';
}

function remainingLabel(limit) {
    const spent = Math.abs(parseFloat(limit.attributes?.spent ?? 0));
    const amount = parseFloat(limit.attributes?.amount ?? 0);
    const remaining = amount - spent;
    if (remaining < 0) return `Overspent by ${formatMoney(Math.abs(remaining), limit.attributes?.currency_code)}`;
    return `${formatMoney(remaining, limit.attributes?.currency_code)} remaining`;
}

function load() {
    store.load(prefs.start, prefs.end);
}

onMounted(load);
watch([() => prefs.start, () => prefs.end], load);
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-period { font-size: 13px; color: var(--ff-text-muted); }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.view-empty { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.budgets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.budget-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.budget-name { font-weight: 600; font-size: 15px; }
.budget-active-badge { font-size: 11px; background: rgba(34,197,94,.15); color: #22c55e; padding: 2px 8px; border-radius: 99px; font-weight: 600; }
.budget-limit { margin-bottom: 10px; }
.budget-limit-info { display: flex; align-items: baseline; gap: 6px; margin-bottom: 6px; }
.budget-spent { font-size: 18px; font-weight: 700; }
.budget-limit-amount { font-size: 12px; color: var(--ff-text-muted); }
.budget-progress-bar { height: 6px; background: var(--ff-border); border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.budget-progress-fill { height: 100%; border-radius: 3px; transition: width .4s ease; }
.budget-progress-fill.ok { background: #22c55e; }
.budget-progress-fill.warning { background: #f59e0b; }
.budget-progress-fill.over { background: #ef4444; }
.budget-remaining { font-size: 12px; color: var(--ff-text-muted); }
.budget-no-limit { font-size: 13px; color: var(--ff-text-muted); font-style: italic; }
</style>

