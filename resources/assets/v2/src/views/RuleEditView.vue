<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-pen"></i> Edit Rule</h1>
        </div>

        <div v-if="store.loading" class="view-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Loading…
        </div>

        <form v-else class="rule-form" @submit.prevent="submit">
            <!-- General -->
            <FfCard title="General">
                <div class="form-grid">
                    <FfInput v-model="form.title" label="Title" placeholder="Rule name" :required="true" />
                    <FfInput v-model="form.description" label="Description" placeholder="Optional description" />
                    <FfSelect
                        v-model="form.rule_group_id"
                        label="Rule group"
                        :options="groupOptions"
                        placeholder="Select a group…"
                        :searchable="true"
                    />
                    <FfSelect
                        v-model="form.trigger"
                        label="Run rule when"
                        :options="triggerWhenOptions"
                        placeholder="Select trigger event…"
                    />
                    <div class="form-row-checks">
                        <label class="check-label">
                            <input type="checkbox" v-model="form.active" class="check-input" />
                            Active
                        </label>
                        <label class="check-label">
                            <input type="checkbox" v-model="form.stop_processing" class="check-input" />
                            Stop processing other rules after this one matches
                        </label>
                    </div>
                </div>
            </FfCard>

            <!-- Triggers (IF) -->
            <FfCard title="Triggers (IF)">
                <div class="condition-list">
                    <div v-for="(trigger, idx) in triggers" :key="idx" class="condition-row">
                        <span class="condition-idx">{{ idx + 1 }}</span>
                        <FfSelect
                            v-model="trigger.type"
                            :options="TRIGGER_TYPES"
                            placeholder="Select trigger…"
                            class="condition-select"
                        />
                        <FfInput v-model="trigger.value" placeholder="Value" class="condition-value" />
                        <label class="check-label check-label--inline">
                            <input type="checkbox" v-model="trigger.stop_processing" class="check-input" />
                            Stop
                        </label>
                        <button type="button" class="btn-remove" @click="removeTrigger(idx)" :disabled="triggers.length === 1">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <FfButton type="button" variant="ghost" icon="fa-solid fa-plus" @click="addTrigger">
                    Add trigger
                </FfButton>
            </FfCard>

            <!-- Actions (THEN) -->
            <FfCard title="Actions (THEN)">
                <div class="condition-list">
                    <div v-for="(action, idx) in actions" :key="idx" class="condition-row">
                        <span class="condition-idx">{{ idx + 1 }}</span>
                        <FfSelect
                            v-model="action.type"
                            :options="ACTION_TYPES"
                            placeholder="Select action…"
                            class="condition-select"
                        />
                        <FfInput v-model="action.value" placeholder="Value (optional)" class="condition-value" />
                        <label class="check-label check-label--inline">
                            <input type="checkbox" v-model="action.stop_processing" class="check-input" />
                            Stop
                        </label>
                        <button type="button" class="btn-remove" @click="removeAction(idx)" :disabled="actions.length === 1">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>
                </div>
                <FfButton type="button" variant="ghost" icon="fa-solid fa-plus" @click="addAction">
                    Add action
                </FfButton>
            </FfCard>

            <div class="form-actions">
                <FfButton variant="ghost" type="button" @click="router.push(`/rules/${id}`)">Cancel</FfButton>
                <FfButton variant="primary" type="submit" :loading="saving">Save changes</FfButton>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRulesStore } from '../stores/rules.js';
import { useToast } from '../composables/useToast.js';
import { TRIGGER_TYPES, ACTION_TYPES } from '../support/rule-types.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfInput from '../components/ui/FfInput.vue';
import FfSelect from '../components/ui/FfSelect.vue';

const route = useRoute();
const router = useRouter();
const store = useRulesStore();
const toast = useToast();
const saving = ref(false);
const id = route.params.id;

const triggerWhenOptions = [
    { value: 'store-journal', label: 'When transaction is stored' },
    { value: 'update-journal', label: 'When transaction is updated' },
];

const form = reactive({
    title: '',
    description: '',
    rule_group_id: '',
    trigger: 'store-journal',
    active: true,
    stop_processing: false,
});

const triggers = ref([{ type: '', value: '', stop_processing: false }]);
const actions = ref([{ type: '', value: '', stop_processing: false }]);

const groupOptions = computed(() =>
    store.groups.map((g) => ({ value: g.id, label: g.attributes?.title ?? g.id }))
);

onMounted(async () => {
    await Promise.all([store.show(id), store.loadGroups()]);
    const attr = store.current?.attributes ?? {};
    form.title = attr.title ?? '';
    form.description = attr.description ?? '';
    form.rule_group_id = String(attr.rule_group_id ?? '');
    form.trigger = attr.trigger ?? 'store-journal';
    form.active = attr.active ?? true;
    form.stop_processing = attr.stop_processing ?? false;
    if (attr.triggers?.length) {
        triggers.value = attr.triggers.map((t) => ({
            type: t.type ?? '',
            value: t.value ?? '',
            stop_processing: t.stop_processing ?? false,
        }));
    }
    if (attr.actions?.length) {
        actions.value = attr.actions.map((a) => ({
            type: a.type ?? '',
            value: a.value ?? '',
            stop_processing: a.stop_processing ?? false,
        }));
    }
});

function addTrigger() {
    triggers.value.push({ type: '', value: '', stop_processing: false });
}
function removeTrigger(idx) {
    if (triggers.value.length > 1) triggers.value.splice(idx, 1);
}
function addAction() {
    actions.value.push({ type: '', value: '', stop_processing: false });
}
function removeAction(idx) {
    if (actions.value.length > 1) actions.value.splice(idx, 1);
}

async function submit() {
    if (!form.title.trim()) return;
    saving.value = true;
    try {
        await store.update(id, {
            title: form.title.trim(),
            description: form.description,
            rule_group_id: form.rule_group_id || undefined,
            trigger: form.trigger,
            active: form.active,
            stop_processing: form.stop_processing,
            triggers: triggers.value,
            actions: actions.value,
        });
        toast.success('Rule updated.');
        router.push(`/rules/${id}`);
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to update rule.');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading { padding: 48px; text-align: center; color: var(--ff-text-muted); }
.rule-form { display: flex; flex-direction: column; gap: 20px; max-width: 860px; }
.form-grid { display: flex; flex-direction: column; gap: 14px; }
.form-row-checks { display: flex; flex-direction: column; gap: 8px; }
.check-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ff-text); cursor: pointer; }
.check-label--inline { white-space: nowrap; }
.check-input { width: 15px; height: 15px; accent-color: var(--ff-primary-700); cursor: pointer; }
.condition-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.condition-row { display: flex; align-items: center; gap: 10px; }
.condition-idx { font-size: 11px; font-weight: 600; color: var(--ff-text-muted); min-width: 20px; text-align: right; }
.condition-select { flex: 1; min-width: 0; }
.condition-value { flex: 1; min-width: 0; }
.btn-remove { display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1px solid var(--ff-border); border-radius: 6px; background: var(--ff-surface-2); color: var(--ff-text-muted); cursor: pointer; font-size: 13px; flex-shrink: 0; }
.btn-remove:hover:not(:disabled) { background: rgba(239,68,68,.12); border-color: #f87171; color: #f87171; }
.btn-remove:disabled { opacity: 0.4; cursor: not-allowed; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
