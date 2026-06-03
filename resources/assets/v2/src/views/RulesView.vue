<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-wand-magic-sparkles"></i> Rules</h1>
            <FfButton icon="fa-solid fa-plus" @click="router.push('/rules/create')">New rule</FfButton>
        </div>

        <FfCard :no-padding="true">
            <div v-if="store.loading" class="table-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
            <FfEmptyState
                v-else-if="!store.list.length"
                icon="fa-solid fa-wand-magic-sparkles"
                title="No rules"
                message="Create rules to automatically process your transactions."
            />
            <table v-else class="tbl">
                <thead>
                    <tr>
                        <th style="width: 60px">#</th>
                        <th>Name</th>
                        <th>Group</th>
                        <th style="text-align: center">Triggers</th>
                        <th style="text-align: center">Active</th>
                        <th style="text-align: right">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="rule in store.list" :key="rule.id" class="tbl-row">
                        <td class="tbl-mono tbl-muted">{{ rule.attributes?.order ?? '—' }}</td>
                        <td class="tbl-name" @click="router.push(`/rules/${rule.id}`)">{{ rule.attributes?.title }}</td>
                        <td>
                            <FfBadge v-if="rule.attributes?.rule_group_title" variant="primary">
                                {{ rule.attributes.rule_group_title }}
                            </FfBadge>
                            <span v-else class="tbl-muted">—</span>
                        </td>
                        <td style="text-align: center">
                            <FfBadge variant="info">{{ rule.attributes?.triggers?.length ?? 0 }}</FfBadge>
                        </td>
                        <td style="text-align: center">
                            <FfBadge :variant="rule.attributes?.active ? 'positive' : 'default'">
                                {{ rule.attributes?.active ? 'Yes' : 'No' }}
                            </FfBadge>
                        </td>
                        <td class="tbl-actions">
                            <FfButton size="sm" variant="ghost" @click="runRule(rule.id)">
                                <i class="fa-solid fa-play"></i> Run
                            </FfButton>
                            <FfButton size="sm" variant="ghost" @click="router.push(`/rules/${rule.id}/edit`)">
                                Edit
                            </FfButton>
                            <FfButton size="sm" variant="ghost-danger" @click="confirmDelete(rule)">
                                Delete
                            </FfButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </FfCard>

        <!-- Delete confirmation modal -->
        <FfModal :open="deleteModal.open" title="Delete Rule" @close="deleteModal.open = false">
            <p>Are you sure you want to delete rule <strong>{{ deleteModal.rule?.attributes?.title }}</strong>? This cannot be undone.</p>
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
import { reactive, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRulesStore } from '../stores/rules.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfBadge from '../components/ui/FfBadge.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';
import FfModal from '../components/ui/FfModal.vue';

const router = useRouter();
const store = useRulesStore();
const toast = useToast();

const deleteModal = reactive({ open: false, rule: null, loading: false });

onMounted(() => {
    store.load();
    store.loadGroups();
});

function confirmDelete(rule) {
    deleteModal.rule = rule;
    deleteModal.open = true;
}

async function doDelete() {
    deleteModal.loading = true;
    try {
        await store.destroy(deleteModal.rule.id);
        toast.success('Rule deleted.');
        deleteModal.open = false;
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to delete rule.');
    } finally {
        deleteModal.loading = false;
    }
}

async function runRule(id) {
    try {
        await store.trigger(id);
        toast.success('Rule triggered successfully.');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to trigger rule.');
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.table-loading { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { padding: 10px 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.tbl td { padding: 11px 16px; border-bottom: 1px solid var(--ff-border); vertical-align: middle; }
.tbl-row:last-child td { border-bottom: none; }
.tbl-name { font-weight: 500; cursor: pointer; }
.tbl-name:hover { color: var(--ff-primary-700); }
.tbl-mono { font-family: 'JetBrains Mono', monospace; }
.tbl-muted { color: var(--ff-text-muted); }
.tbl-actions { display: flex; gap: 6px; justify-content: flex-end; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
