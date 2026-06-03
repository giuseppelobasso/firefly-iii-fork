<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-plus"></i> New Subscription</h1>
        </div>

        <FfCard title="New Subscription" style="max-width: 680px">
            <form class="form" @submit.prevent="submit">
                <FfInput v-model="form.name" label="Name" placeholder="Netflix, Spotify…" :required="true" />
                <div class="form-row">
                    <FfMoneyInput v-model="form.amount_min" label="Min amount" />
                    <FfMoneyInput v-model="form.amount_max" label="Max amount" />
                </div>
                <FfDatePicker v-model="form.date" label="First expected on" />
                <FfSelect
                    v-model="form.repeat_freq"
                    label="Frequency"
                    :options="freqOptions"
                    placeholder="Select frequency"
                />
                <div class="form-field">
                    <label class="form-label">Notes</label>
                    <textarea v-model="form.notes" class="form-textarea" rows="3" placeholder="Optional notes…" />
                </div>
                <div class="form-actions">
                    <FfButton variant="ghost" type="button" @click="router.back()">Cancel</FfButton>
                    <FfButton variant="primary" type="submit" :loading="saving">Create</FfButton>
                </div>
            </form>
        </FfCard>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useBillsStore } from '../stores/bills.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfInput from '../components/ui/FfInput.vue';
import FfMoneyInput from '../components/ui/FfMoneyInput.vue';
import FfDatePicker from '../components/ui/FfDatePicker.vue';
import FfSelect from '../components/ui/FfSelect.vue';
import FfButton from '../components/ui/FfButton.vue';

const router = useRouter();
const store = useBillsStore();
const toast = useToast();
const saving = ref(false);

const form = reactive({
    name: '',
    amount_min: '',
    amount_max: '',
    date: '',
    repeat_freq: 'monthly',
    notes: '',
});

const freqOptions = [
    { value: 'daily',   label: 'Daily' },
    { value: 'weekly',  label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly',  label: 'Yearly' },
];

async function submit() {
    if (!form.name.trim()) return;
    saving.value = true;
    try {
        await store.store({
            name:        form.name.trim(),
            amount_min:  form.amount_min  || '0',
            amount_max:  form.amount_max  || form.amount_min || '0',
            date:        form.date,
            repeat_freq: form.repeat_freq,
            notes:       form.notes,
        });
        toast.success('Subscription created.');
        router.push('/subscriptions');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to create subscription.');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.form { display: flex; flex-direction: column; gap: 16px; padding: 4px 0; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--ff-text-muted); }
.form-textarea { padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-surface-1); color: var(--ff-text); font-size: 14px; resize: vertical; outline: none; font-family: inherit; }
.form-textarea:focus { border-color: var(--ff-primary-700); }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; }
</style>
