<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-rotate"></i> Recurring Transactions</h1>
            <FfButton icon="fa-solid fa-plus" @click="router.push('/recurring/create')">New recurring</FfButton>
        </div>

        <FfCard :no-padding="true">
            <div v-if="store.loading" class="table-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
            <FfEmptyState
                v-else-if="!store.list.length"
                icon="fa-solid fa-rotate"
                title="No recurring transactions"
                message="Set up recurring transactions to automate regular expenses and income."
            />
            <table v-else class="tbl">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th style="text-align: right">Amount</th>
                        <th>Frequency</th>
                        <th>Next date</th>
                        <th style="text-align: center">Active</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="rec in store.list"
                        :key="rec.id"
                        class="tbl-row"
                        @click="router.push(`/recurring/${rec.id}`)"
                    >
                        <td class="tbl-name">{{ rec.attributes?.title }}</td>
                        <td>
                            <FfBadge :variant="typeVariant(rec.attributes?.type)">
                                {{ rec.attributes?.type ?? '—' }}
                            </FfBadge>
                        </td>
                        <td class="tbl-mono tbl-right">
                            {{ formatAmount(rec.attributes?.transactions?.[0]) }}
                        </td>
                        <td>{{ freqLabel(rec.attributes?.repetitions?.[0]) }}</td>
                        <td>{{ nextDate(rec.attributes?.repetitions?.[0]) }}</td>
                        <td style="text-align: center">
                            <FfBadge :variant="rec.attributes?.active ? 'positive' : 'default'">
                                {{ rec.attributes?.active ? 'Yes' : 'No' }}
                            </FfBadge>
                        </td>
                    </tr>
                </tbody>
            </table>
        </FfCard>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRecurringStore } from '../stores/recurring.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';

const router = useRouter();
const store = useRecurringStore();

onMounted(() => store.load());

function typeVariant(type) {
    if (type === 'withdrawal') return 'negative';
    if (type === 'deposit') return 'positive';
    if (type === 'transfer') return 'info';
    return 'default';
}

const freqLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    ndomly: 'N-th day of month',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

function freqLabel(repetition) {
    if (!repetition) return '—';
    // use the human-readable description if available, otherwise map the type key
    if (repetition.description) return repetition.description;
    return freqLabels[repetition.type] ?? repetition.type ?? '—';
}

function nextDate(repetition) {
    const occ = repetition?.occurrences?.[0];
    if (!occ) return '—';
    return new Date(occ).toLocaleDateString();
}

function formatAmount(tx) {
    if (!tx) return '—';
    const sym = tx.currency_symbol ?? '€';
    const amt = tx.amount ?? tx.foreign_amount ?? '0';
    return `${sym}${Number(amt).toFixed(2)}`;
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.table-loading { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { padding: 10px 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.tbl td { padding: 12px 16px; border-bottom: 1px solid var(--ff-border); vertical-align: middle; }
.tbl-row { cursor: pointer; transition: background .1s; }
.tbl-row:hover { background: var(--ff-surface-2); }
.tbl-row:last-child td { border-bottom: none; }
.tbl-name { font-weight: 500; }
.tbl-mono { font-family: 'JetBrains Mono', monospace; }
.tbl-right { text-align: right; }
</style>
