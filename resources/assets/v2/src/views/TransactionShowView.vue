<template>
    <div class="view">
        <div class="view-header">
            <RouterLink to="/transactions/withdrawal" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> Back
            </RouterLink>
        </div>

        <div v-if="store.loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
        <div v-else-if="store.error" class="view-error">{{ store.error }}</div>

        <template v-else-if="store.current">
            <div class="tx-detail-card ff-card">
                <h2 class="tx-detail-title">
                    <i class="fa-solid fa-receipt"></i>
                    {{ firstSplit?.description }}
                </h2>

                <div class="tx-detail-grid">
                    <div class="tx-detail-row" v-for="(label, key) in detailFields" :key="key">
                        <span class="tx-detail-label">{{ label }}</span>
                        <span class="tx-detail-value">{{ getField(key) }}</span>
                    </div>
                </div>

                <div class="tx-actions">
                    <RouterLink :to="`/transactions/${firstSplit?.type}/edit/${store.current.id}`" class="ff-btn ff-btn-secondary">
                        <i class="fa-solid fa-pen"></i> Edit
                    </RouterLink>
                    <button class="ff-btn ff-btn-danger" @click="deleteTx">
                        <i class="fa-solid fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </template>
    </div>
</template>

<script setup>
import {computed, onMounted} from 'vue';
import {useRoute, useRouter, RouterLink} from 'vue-router';
import {useTransactionsStore} from '../stores/transactions.js';
import formatMoney from '../util/format-money.js';

const route = useRoute();
const router = useRouter();
const store = useTransactionsStore();

const firstSplit = computed(() => store.current?.attributes?.transactions?.[0]);

const detailFields = {
    date: 'Date',
    type: 'Type',
    source_name: 'From',
    destination_name: 'To',
    amount: 'Amount',
    category_name: 'Category',
    budget_name: 'Budget',
    tags: 'Tags',
    notes: 'Notes',
};

function getField(key) {
    const s = firstSplit.value;
    if (!s) return '—';
    if (key === 'amount') return formatMoney(s.amount, s.currency_code);
    if (key === 'date') return s.date ? new Date(s.date).toLocaleDateString() : '—';
    if (key === 'tags') return s.tags?.join(', ') || '—';
    return s[key] || '—';
}

async function deleteTx() {
    if (!confirm('Delete this transaction?')) return;
    await store.destroy(store.current.id);
    router.push('/transactions/withdrawal');
}

onMounted(() => store.show(route.params.id));
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.back-link { color: var(--ff-text-muted); text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
.back-link:hover { color: var(--ff-text); }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 28px; border: 1px solid var(--ff-border); }
.tx-detail-title { font-size: 20px; font-weight: 600; display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
.tx-detail-grid { display: flex; flex-direction: column; gap: 0; }
.tx-detail-row { display: flex; padding: 12px 0; border-bottom: 1px solid var(--ff-border); }
.tx-detail-row:last-child { border-bottom: none; }
.tx-detail-label { width: 160px; font-weight: 600; color: var(--ff-text-muted); font-size: 13px; text-transform: uppercase; letter-spacing: .05em; flex-shrink: 0; }
.tx-detail-value { flex: 1; font-size: 14px; }
.tx-actions { margin-top: 24px; display: flex; gap: 10px; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }
.ff-btn-danger { background: #ef4444; color: #fff; }
</style>

