<template>
    <div class="view">
        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <template v-else-if="store.current">
            <div class="view-header">
                <h1 class="view-title">
                    <i class="fa-solid fa-rotate"></i>
                    {{ store.current.attributes?.title }}
                </h1>
                <div class="view-header-actions">
                    <FfButton variant="ghost" @click="router.push(`/recurring/${id}/edit`)">Edit</FfButton>
                    <FfButton variant="ghost-danger" @click="deleteModal.open = true">Delete</FfButton>
                </div>
            </div>

            <!-- Details card -->
            <FfCard title="Details" class="card-mb">
                <dl class="detail-list">
                    <div class="detail-row">
                        <dt>Title</dt>
                        <dd>{{ store.current.attributes?.title }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Type</dt>
                        <dd>
                            <FfBadge :variant="typeVariant(tx?.type)">
                                {{ tx?.type ?? '—' }}
                            </FfBadge>
                        </dd>
                    </div>
                    <div class="detail-row">
                        <dt>Amount</dt>
                        <dd class="dd-mono">{{ formatAmount(tx) }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Frequency</dt>
                        <dd>{{ freqLabel(store.current.attributes?.repeat_freq) }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>First date</dt>
                        <dd>{{ store.current.attributes?.first_date ?? '—' }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Next occurrence</dt>
                        <dd>{{ store.current.attributes?.next_recurrence ?? '—' }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Active</dt>
                        <dd>
                            <FfBadge :variant="store.current.attributes?.active ? 'positive' : 'default'">
                                {{ store.current.attributes?.active ? 'Yes' : 'No' }}
                            </FfBadge>
                        </dd>
                    </div>
                    <div v-if="store.current.attributes?.notes" class="detail-row">
                        <dt>Notes</dt>
                        <dd>{{ store.current.attributes?.notes }}</dd>
                    </div>
                </dl>
            </FfCard>

            <!-- Generated transactions -->
            <FfCard v-if="generatedTxList.length" title="Generated transactions" class="card-mb">
                <table class="gen-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th style="text-align: right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(gtx, idx) in generatedTxList" :key="idx">
                            <td>{{ gtx.attributes?.date ?? '—' }}</td>
                            <td>{{ gtx.attributes?.transactions?.[0]?.description ?? '—' }}</td>
                            <td class="gen-mono gen-right">
                                {{ formatAmount(gtx.attributes?.transactions?.[0]) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </FfCard>
        </template>

        <!-- Delete modal -->
        <FfModal :open="deleteModal.open" title="Delete Recurring Transaction" @close="deleteModal.open = false">
            <p>Are you sure you want to delete <strong>{{ store.current?.attributes?.title }}</strong>? This cannot be undone.</p>
            <template #footer>
                <div class="modal-actions">
                    <FfButton variant="ghost" @click="deleteModal.open = false">Cancel</FfButton>
                    <FfButton variant="danger" :loading="deleteModal.loading" @click="doDelete">Delete</FfButton>
                </div>
            </template>
        </FfModal>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRecurringStore } from '../stores/recurring.js';
import { useToast } from '../composables/useToast.js';
import { recurring as api } from '../api/client.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfModal from '../components/ui/FfModal.vue';

const route = useRoute();
const router = useRouter();
const store = useRecurringStore();
const toast = useToast();
const id = route.params.id;

const deleteModal = reactive({ open: false, loading: false });
const generatedTxList = ref([]);

const tx = computed(() => store.current?.attributes?.transactions?.[0] ?? null);

const freqLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    ndomly: 'N-th day of month',
    monthly: 'Monthly',
    yearly: 'Yearly',
};

function freqLabel(val) {
    return freqLabels[val] ?? val ?? '—';
}

function typeVariant(type) {
    if (type === 'withdrawal') return 'negative';
    if (type === 'deposit') return 'positive';
    if (type === 'transfer') return 'info';
    return 'default';
}

function formatAmount(t) {
    if (!t) return '—';
    const sym = t.currency_symbol ?? '€';
    const amt = t.amount ?? t.foreign_amount ?? '0';
    return `${sym}${Number(amt).toFixed(2)}`;
}

onMounted(async () => {
    await store.show(id);
    try {
        const res = await api.transactions(id, { limit: 10 });
        generatedTxList.value = res.data.data ?? [];
    } catch (_) {
        // transactions endpoint may not be available — silently ignore
    }
});

async function doDelete() {
    deleteModal.loading = true;
    try {
        await store.destroy(id);
        toast.success('Recurring transaction deleted.');
        router.push('/recurring');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete.');
        deleteModal.loading = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-header-actions { display: flex; gap: 8px; }
.view-loading { padding: 48px; text-align: center; color: var(--ff-text-muted); }
.card-mb { margin-bottom: 20px; }
.detail-list { display: flex; flex-direction: column; gap: 0; }
.detail-row { display: flex; padding: 10px 0; border-bottom: 1px solid var(--ff-border); }
.detail-row:last-of-type { border-bottom: none; }
.detail-row dt { width: 160px; font-size: 13px; font-weight: 500; color: var(--ff-text-muted); flex-shrink: 0; }
.detail-row dd { font-size: 13px; color: var(--ff-text); }
.dd-mono { font-family: 'JetBrains Mono', monospace; }
.gen-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.gen-table th { padding: 8px 12px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.gen-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.gen-table tr:last-child td { border-bottom: none; }
.gen-mono { font-family: 'JetBrains Mono', monospace; }
.gen-right { text-align: right; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
