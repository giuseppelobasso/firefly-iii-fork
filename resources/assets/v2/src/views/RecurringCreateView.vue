<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-rotate"></i> New Recurring Transaction</h1>
        </div>

        <form class="rec-form" @submit.prevent="submit">
            <FfCard title="Transaction details">
                <div class="form-grid">
                    <FfInput v-model="form.title" label="Title" placeholder="e.g. Monthly rent" :required="true" />
                    <FfSelect
                        v-model="form.transaction_type"
                        label="Transaction type"
                        :options="typeOptions"
                        placeholder="Select type…"
                    />
                    <FfInput v-model="form.description" label="Description" placeholder="Optional description" />
                    <div class="form-row-2">
                        <FfInput v-model="form.source_id" label="From account" placeholder="Account name or ID" />
                        <FfInput v-model="form.destination_id" label="To account" placeholder="Account name or ID" />
                    </div>
                    <div class="form-row-2">
                        <FfInput v-model="form.amount" label="Amount" placeholder="0.00" type="number" step="0.01" :required="true" />
                    </div>
                </div>
            </FfCard>

            <FfCard title="Schedule">
                <div class="form-grid">
                    <div class="form-row-2">
                        <FfSelect
                            v-model="form.repeat_freq"
                            label="Frequency"
                            :options="freqOptions"
                            placeholder="Select frequency…"
                        />
                        <div class="form-field">
                            <label class="form-label">First date</label>
                            <input type="date" v-model="form.first_date" class="form-date" required />
                        </div>
                    </div>
                    <div class="form-row-2">
                        <FfInput
                            v-model="form.repetitions"
                            label="Number of repetitions (0 = infinite)"
                            type="number"
                            min="0"
                            placeholder="0"
                        />
                        <FfInput
                            v-model="form.skip"
                            label="Skip N occurrences"
                            type="number"
                            min="0"
                            placeholder="0"
                        />
                    </div>
                    <label class="check-label">
                        <input type="checkbox" v-model="form.active" class="check-input" />
                        Active
                    </label>
                </div>
            </FfCard>

            <FfCard title="Notes">
                <div class="form-field">
                    <textarea v-model="form.notes" class="form-textarea" rows="4" placeholder="Optional notes…" />
                </div>
            </FfCard>

            <div class="form-actions">
                <FfButton variant="ghost" type="button" @click="router.push('/recurring')">Cancel</FfButton>
                <FfButton variant="primary" type="submit" :loading="saving">Create</FfButton>
            </div>
        </form>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRecurringStore } from '../stores/recurring.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfInput from '../components/ui/FfInput.vue';
import FfSelect from '../components/ui/FfSelect.vue';

const router = useRouter();
const store = useRecurringStore();
const toast = useToast();
const saving = ref(false);

const typeOptions = [
    { value: 'withdrawal', label: 'Withdrawal' },
    { value: 'deposit', label: 'Deposit' },
    { value: 'transfer', label: 'Transfer' },
];

const freqOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'ndomly', label: 'N-th day of month' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
];

const form = reactive({
    title: '',
    transaction_type: 'withdrawal',
    description: '',
    amount: '',
    source_id: '',
    destination_id: '',
    repeat_freq: 'monthly',
    first_date: new Date().toISOString().slice(0, 10),
    repetitions: 0,
    active: true,
    skip: 0,
    notes: '',
});

async function submit() {
    if (!form.title.trim() || !form.amount) return;
    saving.value = true;
    try {
        await store.store({
            type: 'fire-the-same',
            title: form.title.trim(),
            description: form.description,
            first_date: form.first_date,
            repeat_freq: form.repeat_freq,
            repetitions: Number(form.repetitions),
            apply_rules: true,
            active: form.active,
            notes: form.notes,
            transactions: [{
                type: form.transaction_type,
                amount: String(form.amount),
                source_id: form.source_id || undefined,
                destination_id: form.destination_id || undefined,
                description: form.title.trim(),
                skip: Number(form.skip),
            }],
        });
        toast.success('Recurring transaction created.');
        router.push('/recurring');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to create recurring transaction.');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.rec-form { display: flex; flex-direction: column; gap: 20px; max-width: 720px; }
.form-grid { display: flex; flex-direction: column; gap: 14px; }
.form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--ff-text-muted); }
.form-date { padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-surface-1); color: var(--ff-text); font-size: 14px; outline: none; font-family: inherit; }
.form-date:focus { border-color: var(--ff-primary-700); }
.form-textarea { padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-surface-1); color: var(--ff-text); font-size: 14px; resize: vertical; outline: none; font-family: inherit; width: 100%; box-sizing: border-box; }
.form-textarea:focus { border-color: var(--ff-primary-700); }
.check-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--ff-text); cursor: pointer; }
.check-input { width: 15px; height: 15px; accent-color: var(--ff-primary-700); cursor: pointer; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
</style>
