<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-rotate"></i> Subscriptions</h1>
            <FfButton icon="fa-solid fa-plus" @click="router.push('/subscriptions/create')">
                New subscription
            </FfButton>
        </div>

        <FfCard :no-padding="true">
            <div v-if="store.loading" class="table-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
            <FfEmptyState
                v-else-if="!store.list.length"
                icon="fa-solid fa-rotate"
                title="No subscriptions"
                message="Track recurring bills and subscriptions."
            />
            <table v-else class="tbl">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Frequency</th>
                        <th>Next expected</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="bill in store.list"
                        :key="bill.id"
                        class="tbl-row"
                        @click="router.push(`/subscriptions/${bill.id}`)"
                    >
                        <td class="tbl-name">{{ bill.attributes?.name }}</td>
                        <td class="tbl-mono">
                            {{ fmtAmt(bill.attributes?.amount_min, bill.attributes?.currency_symbol) }}
                            <template v-if="bill.attributes?.amount_min !== bill.attributes?.amount_max">
                                — {{ fmtAmt(bill.attributes?.amount_max, bill.attributes?.currency_symbol) }}
                            </template>
                        </td>
                        <td>
                            <FfBadge variant="default">{{ freqLabel(bill.attributes?.repeat_freq) }}</FfBadge>
                        </td>
                        <td class="tbl-muted">{{ fmtDate(bill.attributes?.next_expected_match) }}</td>
                        <td>
                            <FfBadge :variant="bill.attributes?.active ? 'primary' : 'default'">
                                {{ bill.attributes?.active ? 'Active' : 'Inactive' }}
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
import { useBillsStore } from '../stores/bills.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';

const router = useRouter();
const store = useBillsStore();

const FREQ = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };

function freqLabel(f) { return FREQ[f] ?? f ?? '—'; }

function fmtAmt(v, sym) {
    if (v == null) return '—';
    return `${sym ?? '€'}${Number(v).toFixed(2)}`;
}

function fmtDate(d) {
    return d ? new Date(d).toLocaleDateString() : '—';
}

onMounted(() => store.load());
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
.tbl-muted { color: var(--ff-text-muted); }
</style>

