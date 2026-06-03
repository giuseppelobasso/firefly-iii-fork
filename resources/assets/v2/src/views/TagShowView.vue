<template>
    <div class="view">
        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <template v-else-if="store.current">
            <div class="view-header">
                <h1 class="view-title">
                    <i class="fa-solid fa-tag"></i>
                    {{ store.current.attributes?.tag }}
                </h1>
                <div class="view-header-actions">
                    <FfButton variant="ghost" icon="fa-solid fa-pen" @click="router.push(`/tags/${id}/edit`)">
                        Edit
                    </FfButton>
                    <FfButton variant="danger" icon="fa-solid fa-trash" @click="deleteModal = true">
                        Delete
                    </FfButton>
                </div>
            </div>

            <div class="layout">
                <FfCard :title="`Tag: ${store.current.attributes?.tag ?? ''}`">
                    <dl class="detail-list">
                        <div class="dl-row">
                            <dt>Tag</dt>
                            <dd>{{ store.current.attributes?.tag }}</dd>
                        </div>
                    </dl>
                </FfCard>

                <FfCard title="Transactions">
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

        <FfModal :open="deleteModal" title="Delete tag" @close="deleteModal = false">
            <p>Delete tag <strong>{{ store.current?.attributes?.tag }}</strong>? This action cannot be undone.</p>
            <template #footer>
                <FfButton variant="ghost" @click="deleteModal = false">Cancel</FfButton>
                <FfButton variant="danger" :loading="deleting" @click="doDelete">Delete</FfButton>
            </template>
        </FfModal>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useTagsStore } from '../stores/tags.js';
import { useToast } from '../composables/useToast.js';
import { transactions as txApi } from '../api/client.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfModal from '../components/ui/FfModal.vue';

const route = useRoute();
const router = useRouter();
const store = useTagsStore();
const toast = useToast();
const id = route.params.id;
const deleteModal = ref(false);
const deleting = ref(false);
const transactions = ref([]);
const txLoading = ref(false);

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
        toast.success('Tag deleted.');
        router.push('/tags');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete.');
        deleteModal.value = false;
    } finally {
        deleting.value = false;
    }
}

onMounted(async () => {
    await store.show(id);
    txLoading.value = true;
    try {
        const tagName = store.current?.attributes?.tag;
        const res = await txApi.list({ tag: tagName, limit: 25 });
        transactions.value = res.data.data ?? [];
    } catch (e) {
        // silent — transactions section stays empty
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
.dl-row dt { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--ff-text-muted); min-width: 80px; padding-top: 2px; flex-shrink: 0; }
.dl-row dd { margin: 0; font-size: 14px; color: var(--ff-text); }
.card-loading { padding: 24px; text-align: center; color: var(--ff-text-muted); }
.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 8px 0; }
.tx-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.tx-table th { padding: 8px 0; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.tx-table td { padding: 10px 0; border-bottom: 1px solid var(--ff-border); }
.tx-table tr:last-child td { border-bottom: none; }
.tx-date { color: var(--ff-text-muted); font-size: 12px; white-space: nowrap; }
.tx-desc { padding-left: 12px; }
.tx-amount { text-align: right; font-family: 'JetBrains Mono', monospace; }
.negative { color: var(--ff-negative); }
.positive { color: var(--ff-positive); }
@media (max-width: 720px) { .layout { grid-template-columns: 1fr; } }
</style>
