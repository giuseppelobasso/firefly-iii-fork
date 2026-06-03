<template>
    <div class="view">
        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <template v-else-if="store.current">
            <div class="view-header">
                <h1 class="view-title">
                    <i class="fa-solid fa-rotate"></i>
                    {{ store.current.attributes?.name }}
                </h1>
                <div class="view-header-actions">
                    <FfButton variant="ghost" icon="fa-solid fa-pen" @click="router.push(`/subscriptions/${id}/edit`)">
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
                        <div class="dl-row"><dt>Name</dt><dd>{{ store.current.attributes?.name }}</dd></div>
                        <div class="dl-row">
                            <dt>Amount</dt>
                            <dd class="mono">
                                {{ fmtAmt(store.current.attributes?.amount_min, store.current.attributes?.currency_symbol) }}
                                <template v-if="store.current.attributes?.amount_min !== store.current.attributes?.amount_max">
                                    — {{ fmtAmt(store.current.attributes?.amount_max, store.current.attributes?.currency_symbol) }}
                                </template>
                            </dd>
                        </div>
                        <div class="dl-row">
                            <dt>Frequency</dt>
                            <dd>{{ freqLabel(store.current.attributes?.repeat_freq) }}</dd>
                        </div>
                        <div class="dl-row">
                            <dt>First expected</dt>
                            <dd>{{ fmtDate(store.current.attributes?.date) }}</dd>
                        </div>
                        <div class="dl-row">
                            <dt>Next expected</dt>
                            <dd>{{ fmtDate(store.current.attributes?.next_expected_match) }}</dd>
                        </div>
                        <div class="dl-row">
                            <dt>Status</dt>
                            <dd>
                                <FfBadge :variant="store.current.attributes?.active ? 'primary' : 'default'">
                                    {{ store.current.attributes?.active ? 'Active' : 'Inactive' }}
                                </FfBadge>
                            </dd>
                        </div>
                        <div v-if="store.current.attributes?.notes" class="dl-row">
                            <dt>Notes</dt>
                            <dd>{{ store.current.attributes?.notes }}</dd>
                        </div>
                    </dl>
                </FfCard>

                <FfCard title="Upcoming payments">
                    <div v-if="!payDates.length" class="card-empty">No upcoming payment dates.</div>
                    <ul v-else class="pay-list">
                        <li v-for="(d, i) in payDates.slice(0, 5)" :key="i" class="pay-item">
                            <i class="fa-regular fa-calendar-days pay-icon"></i>
                            <span>{{ fmtDate(d) }}</span>
                        </li>
                    </ul>
                </FfCard>
            </div>
        </template>

        <FfModal :open="deleteModal" title="Delete subscription" @close="deleteModal = false">
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
import { useBillsStore } from '../stores/bills.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfModal from '../components/ui/FfModal.vue';

const route = useRoute();
const router = useRouter();
const store = useBillsStore();
const toast = useToast();
const id = route.params.id;
const deleteModal = ref(false);
const deleting = ref(false);

const FREQ = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly' };
function freqLabel(f) { return FREQ[f] ?? f ?? '—'; }
function fmtAmt(v, sym) { return v != null ? `${sym ?? '€'}${Number(v).toFixed(2)}` : '—'; }
function fmtDate(d) { return d ? new Date(d).toLocaleDateString() : '—'; }

const payDates = computed(() => store.current?.attributes?.pay_dates ?? []);

async function doDelete() {
    deleting.value = true;
    try {
        await store.destroy(id);
        toast.success('Subscription deleted.');
        router.push('/subscriptions');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete.');
        deleteModal.value = false;
    } finally {
        deleting.value = false;
    }
}

onMounted(() => store.show(id));
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-header-actions { display: flex; gap: 10px; }
.view-loading { padding: 64px; text-align: center; color: var(--ff-text-muted); }
.layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-list { display: flex; flex-direction: column; gap: 12px; margin: 0; padding: 0; }
.dl-row { display: flex; gap: 12px; }
.dl-row dt { font-size: 12px; font-weight: 500; text-transform: uppercase; letter-spacing: .05em; color: var(--ff-text-muted); min-width: 120px; padding-top: 2px; flex-shrink: 0; }
.dl-row dd { margin: 0; font-size: 14px; color: var(--ff-text); }
.mono { font-family: 'JetBrains Mono', monospace; }
.card-empty { color: var(--ff-text-muted); font-size: 13px; padding: 8px 0; }
.pay-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
.pay-item { display: flex; align-items: center; gap: 10px; font-size: 14px; }
.pay-icon { color: var(--ff-text-muted); }
@media (max-width: 720px) { .layout { grid-template-columns: 1fr; } }
</style>
