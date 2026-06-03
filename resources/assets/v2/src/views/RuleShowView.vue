<template>
    <div class="view">
        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <template v-else-if="store.current">
            <div class="view-header">
                <h1 class="view-title">
                    <i class="fa-solid fa-wand-magic-sparkles"></i>
                    {{ store.current.attributes?.title }}
                </h1>
                <div class="view-header-actions">
                    <FfButton variant="ghost" @click="router.push(`/rules/${id}/edit`)">Edit</FfButton>
                    <FfButton variant="ghost-danger" @click="deleteModal.open = true">Delete</FfButton>
                </div>
            </div>

            <!-- Details -->
            <FfCard title="Details" class="card-mb">
                <dl class="detail-list">
                    <div class="detail-row">
                        <dt>Title</dt>
                        <dd>{{ store.current.attributes?.title }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Group</dt>
                        <dd>
                            <FfBadge v-if="store.current.attributes?.rule_group_title" variant="primary">
                                {{ store.current.attributes.rule_group_title }}
                            </FfBadge>
                            <span v-else class="text-muted">—</span>
                        </dd>
                    </div>
                    <div class="detail-row">
                        <dt>Run when</dt>
                        <dd>{{ labelFor(store.current.attributes?.trigger) }}</dd>
                    </div>
                    <div class="detail-row">
                        <dt>Active</dt>
                        <dd>
                            <FfBadge :variant="store.current.attributes?.active ? 'positive' : 'default'">
                                {{ store.current.attributes?.active ? 'Yes' : 'No' }}
                            </FfBadge>
                        </dd>
                    </div>
                    <div class="detail-row">
                        <dt>Stop processing</dt>
                        <dd>{{ store.current.attributes?.stop_processing ? 'Yes' : 'No' }}</dd>
                    </div>
                </dl>
                <div class="card-actions">
                    <FfButton variant="primary" icon="fa-solid fa-play" :loading="running" @click="runRule">
                        Run rule
                    </FfButton>
                </div>
            </FfCard>

            <!-- Triggers (IF) -->
            <FfCard title="Triggers (IF)" class="card-mb">
                <FfEmptyState
                    v-if="!triggerList.length"
                    icon="fa-solid fa-filter"
                    title="No triggers"
                    message="This rule has no trigger conditions."
                />
                <table v-else class="cond-table">
                    <thead>
                        <tr><th>#</th><th>Type</th><th>Value</th><th>Stop</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="(t, idx) in triggerList" :key="idx">
                            <td class="cond-idx">{{ idx + 1 }}</td>
                            <td>{{ t.type }}</td>
                            <td class="cond-mono">{{ t.value }}</td>
                            <td>
                                <FfBadge :variant="t.stop_processing ? 'warning' : 'default'" size="sm">
                                    {{ t.stop_processing ? 'Yes' : 'No' }}
                                </FfBadge>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </FfCard>

            <!-- Actions (THEN) -->
            <FfCard title="Actions (THEN)">
                <FfEmptyState
                    v-if="!actionList.length"
                    icon="fa-solid fa-bolt"
                    title="No actions"
                    message="This rule has no actions defined."
                />
                <table v-else class="cond-table">
                    <thead>
                        <tr><th>#</th><th>Type</th><th>Value</th><th>Stop</th></tr>
                    </thead>
                    <tbody>
                        <tr v-for="(a, idx) in actionList" :key="idx">
                            <td class="cond-idx">{{ idx + 1 }}</td>
                            <td>{{ a.type }}</td>
                            <td class="cond-mono">{{ a.value }}</td>
                            <td>
                                <FfBadge :variant="a.stop_processing ? 'warning' : 'default'" size="sm">
                                    {{ a.stop_processing ? 'Yes' : 'No' }}
                                </FfBadge>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </FfCard>
        </template>

        <!-- Delete modal -->
        <FfModal :open="deleteModal.open" title="Delete Rule" @close="deleteModal.open = false">
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
import { useRulesStore } from '../stores/rules.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfModal from '../components/ui/FfModal.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';

const route = useRoute();
const router = useRouter();
const store = useRulesStore();
const toast = useToast();
const id = route.params.id;
const running = ref(false);

const deleteModal = reactive({ open: false, loading: false });

const triggerWhenLabels = {
    'store-journal': 'When transaction is stored',
    'update-journal': 'When transaction is updated',
};

function labelFor(val) {
    return triggerWhenLabels[val] ?? val ?? '—';
}

const triggerList = computed(() => store.current?.attributes?.triggers ?? []);
const actionList = computed(() => store.current?.attributes?.actions ?? []);

onMounted(() => store.show(id));

async function runRule() {
    running.value = true;
    try {
        await store.trigger(id);
        toast.success('Rule triggered successfully.');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to trigger rule.');
    } finally {
        running.value = false;
    }
}

async function doDelete() {
    deleteModal.loading = true;
    try {
        await store.destroy(id);
        toast.success('Rule deleted.');
        router.push('/rules');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete rule.');
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
.detail-row { display: flex; gap: 0; padding: 10px 0; border-bottom: 1px solid var(--ff-border); }
.detail-row:last-of-type { border-bottom: none; }
.detail-row dt { width: 160px; font-size: 13px; font-weight: 500; color: var(--ff-text-muted); flex-shrink: 0; }
.detail-row dd { font-size: 13px; color: var(--ff-text); }
.card-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--ff-border); }
.text-muted { color: var(--ff-text-muted); }
.cond-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cond-table th { padding: 8px 12px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.cond-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.cond-table tr:last-child td { border-bottom: none; }
.cond-idx { color: var(--ff-text-muted); font-weight: 600; width: 30px; }
.cond-mono { font-family: 'JetBrains Mono', monospace; font-size: 12px; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
