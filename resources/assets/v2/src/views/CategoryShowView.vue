<template>
    <div class="view">
        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <template v-else-if="store.current">
            <div class="view-header">
                <h1 class="view-title">
                    <i class="fa-solid fa-tag"></i>
                    {{ store.current.attributes?.name }}
                </h1>
                <div class="view-header-actions">
                    <FfButton variant="ghost" icon="fa-solid fa-pen" @click="router.push(`/categories/${id}/edit`)">
                        Edit
                    </FfButton>
                    <FfButton variant="danger" icon="fa-solid fa-trash" @click="deleteModal = true">
                        Delete
                    </FfButton>
                </div>
            </div>

            <div class="layout">
                <FfCard title="Details">
                    <dl class="detail-list">
                        <div class="dl-row">
                            <dt>Name</dt>
                            <dd>{{ store.current.attributes?.name }}</dd>
                        </div>
                        <div class="dl-row">
                            <dt>Spending this month</dt>
                            <dd class="mono negative">{{ monthlySpend }}</dd>
                        </div>
                        <div v-if="store.current.attributes?.notes" class="dl-row">
                            <dt>Notes</dt>
                            <dd>{{ store.current.attributes?.notes }}</dd>
                        </div>
                    </dl>
                </FfCard>

                <FfCard title="Recent Transactions">
                    <div v-if="txLoading" class="card-loading">
                        <i class="fa-solid fa-spinner fa-spin"></i>
                    </div>
                    <div v-else-if="!transactions.length" class="card-empty">No transactions found.</div>
                    <table v-else class="tx-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th style="text-align: right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="tx in transactions" :key="tx.id">
                                <td class="tx-date">{{ fmtDate(tx.attributes?.date) }}</td>
                                <td class="tx-desc">{{ tx.attributes?.transactions?.[0]?.description ?? '—' }}</td>
                                <td class="tx-amount" :class="amtClass(tx)">{{ fmtTxAmt(tx) }}</td>
                            </tr>
                        </tbody>
                    </table>
                </FfCard>
            </div>
        </template>

        <FfModal :open="deleteModal" title="Delete category" @close="deleteModal = false">
            <p>Delete <strong>{{ store.current?.attributes?.name }}</strong>? This action cannot be undone.</p>
            <template #footer>
                <FfButton variant="ghost" @click="deleteModal = false">Cancel</FfButton>
                <FfButton variant="danger" :loading="deleting" @click="doDelete">Delete</FfButton>
            </template>
        </FfModal>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoriesStore } from '../stores/categories.js';
import { useToast } from '../composables/useToast.js';
import { transactions as txApi } from '../api/client.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfModal from '../components/ui/FfModal.vue';

const route = useRoute();
const router = useRouter();
const store = useCategoriesStore();
const toast = useToast();
const id = route.params.id;
const deleteModal = ref(false);
const deleting = ref(false);
const transactions = ref([]);
const txLoading = ref(false);

function startOfMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

const monthlySpend = computed(() => {
    if (!store.insight.length) return '—';
    const name = store.current?.attributes?.name;
    const entry = store.insight.find((i) => i.name === name);
    if (!entry) return '—';
    const diff = entry.difference_float ?? entry.difference ?? null;
    if (diff == null) return '—';
    return `${entry.currency_symbol ?? '€'}${Math.abs(Number(diff)).toFixed(2)}`;
});

function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—'; }

function fmtTxAmt(tx) {
    const splits = tx.attributes?.transactions ?? [];
    if (!splits.length) return '—';
    const s = splits[0];
    return `${s.currency_symbol ?? '€'}${Number(s.amount ?? 0).toFixed(2)}`;
}

function amtClass(tx) {
    const type = tx.attributes?.transactions?.[0]?.type ?? '';
    return type === 'withdrawal' ? 'negative' : 'positive';
}

async function doDelete() {
    deleting.value = true;
    try {
        await store.destroy(id);
        toast.success('Category deleted.');
        router.push('/categories');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete.');
        deleteModal.value = false;
    } finally {
        deleting.value = false;
    }
}

onMounted(async () => {
    await store.show(id);
    store.loadInsight(startOfMonth(), today());
    txLoading.value = true;
    try {
        const res = await txApi.list({ category_id: id, limit: 10 });
        transactions.value = res.data.data ?? [];
    } catch (e) {
        // silent — transactions section just stays empty
    } finally {
        txLoading.value = false;
    }
});
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-header-actions { display: flex; gap: 10px; }
.view-loading { padding: 64px; text-align: center; color: var(--ff-text-muted); }
.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-list { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; }
.dl-row { display: flex; gap: 12px; }
.dl-row dt { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--ff-text-muted); min-width: 140px; padding-top: 2px; flex-shrink: 0; }
.dl-row dd { margin: 0; font-size: 14px; color: var(--ff-text); }
.mono { font-family: 'JetBrains Mono', monospace; }
.negative { color: var(--ff-negative); }
.positive { color: var(--ff-positive); }
.card-loading { padding: 24px; text-align: center; color: var(--ff-text-muted); }
.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 8px 0; }
.tx-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tx-table th { padding: 8px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.tx-table td { padding: 10px 0; border-bottom: 1px solid var(--ff-border); }
.tx-table tr:last-child td { border-bottom: none; }
.tx-date { color: var(--ff-text-muted); font-size: 12px; white-space: nowrap; }
.tx-desc { padding-left: 12px; }
.tx-amount { text-align: right; font-family: 'JetBrains Mono', monospace; }
@media (max-width: 720px) { .layout { grid-template-columns: 1fr; } }
</style>
