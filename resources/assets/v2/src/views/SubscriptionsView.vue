<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-rotate"></i> Subscriptions</h1>
        </div>

        <div v-if="loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
        <div v-else-if="error" class="view-error">{{ error }}</div>

        <div v-else class="ff-card">
            <table class="ff-table">
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
                    <tr v-for="bill in bills" :key="bill.id">
                        <td class="bill-name">{{ bill.attributes?.name }}</td>
                        <td>
                            {{ formatMoney(bill.attributes?.amount_min, bill.attributes?.currency_code) }}
                            <template v-if="bill.attributes?.amount_min !== bill.attributes?.amount_max">
                                – {{ formatMoney(bill.attributes?.amount_max, bill.attributes?.currency_code) }}
                            </template>
                        </td>
                        <td class="text-muted">{{ bill.attributes?.repeat_freq }}</td>
                        <td class="text-muted">{{ formatDate(bill.attributes?.next_expected_match) }}</td>
                        <td>
                            <span class="status-badge" :class="bill.attributes?.paid_dates?.length ? 'paid' : 'unpaid'">
                                {{ bill.attributes?.paid_dates?.length ? 'Paid' : 'Unpaid' }}
                            </span>
                        </td>
                    </tr>
                    <tr v-if="!bills.length">
                        <td colspan="5" class="empty-row">No subscriptions found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {bills as api} from '../api/client.js';
import formatMoney from '../util/format-money.js';

const bills = ref([]);
const loading = ref(false);
const error = ref(null);

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString() : '—';
}

onMounted(async () => {
    loading.value = true;
    try {
        const res = await api.list({limit: 100});
        bills.value = res.data.data ?? [];
    } catch (e) {
        error.value = e.response?.data?.message ?? e.message;
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.ff-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ff-table th { text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid var(--ff-border); color: var(--ff-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
.ff-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.ff-table tr:last-child td { border-bottom: none; }
.text-muted { color: var(--ff-text-muted); }
.bill-name { font-weight: 500; }
.empty-row { text-align: center; color: var(--ff-text-muted); padding: 32px !important; }
.status-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 99px; }
.status-badge.paid { background: rgba(34,197,94,.15); color: #22c55e; }
.status-badge.unpaid { background: rgba(239,68,68,.12); color: #ef4444; }
</style>

