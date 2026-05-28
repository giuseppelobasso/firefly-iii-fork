<template>
    <form class="tx-form" @submit.prevent="submit">
        <NotificationBar :error="notif.error.value" :wait="notif.wait.value" @close="notif.clear()" />

        <!-- Type tabs -->
        <div class="tx-type-tabs">
            <button
                v-for="t in TYPES"
                :key="t.value"
                type="button"
                class="tx-type-tab"
                :class="{active: form.type === t.value}"
                @click="form.type = t.value"
            >
                <i :class="t.icon"></i> {{ t.label }}
            </button>
        </div>

        <!-- Splits (for split transactions) -->
        <div v-for="(split, idx) in form.splits" :key="idx" class="tx-split">
            <div v-if="form.splits.length > 1" class="split-header">
                <span>Split {{ idx + 1 }}</span>
                <button type="button" class="icon-btn" @click="removeSplit(idx)">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>

            <!-- Description -->
            <div class="form-row">
                <label class="form-label">Description *</label>
                <input
                    v-model="split.description"
                    class="ff-input"
                    placeholder="Transaction description"
                    required
                />
            </div>

            <!-- Date -->
            <div class="form-row">
                <label class="form-label">Date *</label>
                <input v-model="split.date" type="date" class="ff-input" required />
            </div>

            <!-- Amount -->
            <div class="form-row">
                <label class="form-label">Amount *</label>
                <AmountInput
                    v-model="split.amount"
                    :currency="split.currency_code || 'EUR'"
                    :currencies="currencies"
                    v-model:foreignAmount="split.foreign_amount"
                    v-model:foreignCurrency="split.foreign_currency_code"
                />
            </div>

            <!-- Source (From) -->
            <div class="form-row" v-if="form.type !== 'deposit'">
                <label class="form-label">From account *</label>
                <AutocompleteInput
                    v-model="split.sourceAccount"
                    endpoint="accounts"
                    :params="sourceParams"
                    placeholder="Search account…"
                    @select="(item) => { split.source_id = item.id; split.currency_code = item.currency_code || 'EUR'; }"
                />
            </div>

            <!-- Destination (To) -->
            <div class="form-row" v-if="form.type !== 'withdrawal'">
                <label class="form-label">To account *</label>
                <AutocompleteInput
                    v-model="split.destAccount"
                    endpoint="accounts"
                    :params="destParams"
                    placeholder="Search account…"
                    @select="(item) => { split.destination_id = item.id; }"
                />
            </div>

            <!-- Expense destination (for withdrawals) -->
            <div class="form-row" v-if="form.type === 'withdrawal'">
                <label class="form-label">Expense account</label>
                <AutocompleteInput
                    v-model="split.destAccount"
                    endpoint="accounts"
                    :params="{types: 'expense'}"
                    placeholder="Search expense account…"
                    @select="(item) => { split.destination_id = item.id; }"
                />
            </div>

            <!-- Revenue source (for deposits) -->
            <div class="form-row" v-if="form.type === 'deposit'">
                <label class="form-label">Revenue account</label>
                <AutocompleteInput
                    v-model="split.sourceAccount"
                    endpoint="accounts"
                    :params="{types: 'revenue'}"
                    placeholder="Search revenue account…"
                    @select="(item) => { split.source_id = item.id; }"
                />
            </div>

            <!-- Category -->
            <div class="form-row">
                <label class="form-label">Category</label>
                <AutocompleteInput
                    v-model="split.categoryObj"
                    endpoint="categories"
                    placeholder="Search category…"
                    @select="(item) => { split.category_name = item.name; }"
                />
            </div>

            <!-- Budget (withdrawals only) -->
            <div class="form-row" v-if="form.type === 'withdrawal'">
                <label class="form-label">Budget</label>
                <AutocompleteInput
                    v-model="split.budgetObj"
                    endpoint="budgets"
                    placeholder="Search budget…"
                    @select="(item) => { split.budget_id = item.id; }"
                />
            </div>

            <!-- Notes -->
            <div class="form-row">
                <label class="form-label">Notes</label>
                <textarea v-model="split.notes" class="ff-input ff-textarea" rows="2" placeholder="Optional notes"></textarea>
            </div>
        </div>

        <!-- Add split button -->
        <button type="button" class="add-split-btn" @click="addSplit">
            <i class="fa-solid fa-plus"></i> Add another split
        </button>

        <!-- Actions -->
        <div class="form-actions">
            <RouterLink :to="`/transactions/${form.type}`" class="ff-btn ff-btn-secondary">Cancel</RouterLink>
            <button type="submit" class="ff-btn ff-btn-primary" :disabled="submitting">
                <i v-if="submitting" class="fa-solid fa-spinner fa-spin"></i>
                {{ submitLabel }}
            </button>
        </div>
    </form>
</template>

<script setup>
import {ref, computed, onMounted} from 'vue';
import {RouterLink, useRouter} from 'vue-router';
import {useTransactionsStore} from '../../stores/transactions.js';
import {useNotifications} from '../../composables/useNotifications.js';
import {currencies as currenciesApi} from '../../api/client.js';
import AutocompleteInput from '../ui/AutocompleteInput.vue';
import AmountInput from '../ui/AmountInput.vue';
import NotificationBar from '../ui/NotificationBar.vue';

const props = defineProps({
    initialType: {type: String, default: 'withdrawal'},
    editId: {type: [String, Number], default: null},
});

const emit = defineEmits(['saved']);

const router = useRouter();
const store = useTransactionsStore();
const notif = useNotifications();
const submitting = ref(false);
const currencies = ref([]);

const TYPES = [
    {value: 'withdrawal', label: 'Expense', icon: 'fa-solid fa-arrow-trend-down'},
    {value: 'deposit', label: 'Income', icon: 'fa-solid fa-arrow-trend-up'},
    {value: 'transfer', label: 'Transfer', icon: 'fa-solid fa-arrow-right-arrow-left'},
];

function emptysplits() {
    return [{
        description: '',
        date: new Date().toISOString().slice(0, 10),
        amount: null,
        currency_code: 'EUR',
        foreign_amount: null,
        foreign_currency_code: '',
        source_id: null,
        destination_id: null,
        category_name: '',
        budget_id: null,
        notes: '',
        sourceAccount: null,
        destAccount: null,
        categoryObj: null,
        budgetObj: null,
    }];
}

const form = ref({
    type: props.initialType,
    splits: emptysplits(),
});

const sourceParams = computed(() => ({types: 'asset'}));
const destParams = computed(() => ({types: 'asset'}));
const submitLabel = computed(() => props.editId ? 'Save changes' : 'Create transaction');

function addSplit() {
    const last = form.value.splits[form.value.splits.length - 1];
    form.value.splits.push({
        ...emptysplits()[0],
        date: last?.date ?? new Date().toISOString().slice(0, 10),
        currency_code: last?.currency_code ?? 'EUR',
        source_id: last?.source_id,
        destination_id: last?.destination_id,
        sourceAccount: last?.sourceAccount,
        destAccount: last?.destAccount,
    });
}

function removeSplit(idx) {
    form.value.splits.splice(idx, 1);
}

function buildPayload() {
    return {
        type: form.value.type,
        transactions: form.value.splits.map((s) => ({
            type: form.value.type,
            date: s.date,
            amount: String(s.amount ?? 0),
            currency_code: s.currency_code,
            description: s.description,
            source_id: s.source_id ? String(s.source_id) : undefined,
            destination_id: s.destination_id ? String(s.destination_id) : undefined,
            category_name: s.category_name || undefined,
            budget_id: s.budget_id ? String(s.budget_id) : undefined,
            notes: s.notes || undefined,
            foreign_amount: s.foreign_amount ? String(s.foreign_amount) : undefined,
            foreign_currency_code: s.foreign_currency_code || undefined,
        })),
    };
}

async function submit() {
    submitting.value = true;
    try {
        if (props.editId) {
            await store.update(props.editId, buildPayload());
        } else {
            await store.store(buildPayload());
        }
        emit('saved');
        router.push(`/transactions/${form.value.type}`);
    } catch (e) {
        const msg = e.response?.data?.message ?? e.message ?? 'Error saving transaction';
        notif.showError(msg);
    } finally {
        submitting.value = false;
    }
}

onMounted(async () => {
    // Load currencies for AmountInput
    try {
        const res = await currenciesApi.list({limit: 100, enabled: true});
        currencies.value = (res.data.data ?? []).map((c) => ({
            code: c.attributes?.code,
            name: c.attributes?.name,
        }));
    } catch {}

    // Pre-fill for editing
    if (props.editId) {
        const tx = await store.show(props.editId);
        if (tx) {
            form.value.type = tx.attributes.transactions[0]?.type ?? props.initialType;
            form.value.splits = tx.attributes.transactions.map((s) => ({
                description: s.description,
                date: s.date?.slice(0, 10) ?? '',
                amount: parseFloat(s.amount),
                currency_code: s.currency_code ?? 'EUR',
                foreign_amount: s.foreign_amount ? parseFloat(s.foreign_amount) : null,
                foreign_currency_code: s.foreign_currency_code ?? '',
                source_id: s.source_id,
                destination_id: s.destination_id,
                category_name: s.category_name ?? '',
                budget_id: s.budget_id,
                notes: s.notes ?? '',
                sourceAccount: s.source_id ? {id: s.source_id, name: s.source_name} : null,
                destAccount: s.destination_id ? {id: s.destination_id, name: s.destination_name} : null,
                categoryObj: s.category_name ? {name: s.category_name} : null,
                budgetObj: s.budget_id ? {id: s.budget_id, name: s.budget_name} : null,
            }));
        }
    }
});
</script>

<style scoped>
.tx-form { max-width: 720px; }

.tx-type-tabs { display: flex; gap: 8px; margin-bottom: 24px; }
.tx-type-tab { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: 1px solid var(--ff-border); background: var(--ff-card); color: var(--ff-text); transition: all .15s; }
.tx-type-tab.active { background: var(--ff-sidebar-accent); color: #fff; border-color: var(--ff-sidebar-accent); }
.tx-type-tab:hover:not(.active) { border-color: var(--ff-sidebar-accent); color: var(--ff-sidebar-accent); }

.tx-split { background: var(--ff-card); border: 1px solid var(--ff-border); border-radius: 12px; padding: 20px; margin-bottom: 16px; }
.split-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; font-weight: 600; font-size: 14px; }

.form-row { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
.form-label { font-size: 13px; font-weight: 600; color: var(--ff-text-muted); }

.ff-input { padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-bg); color: var(--ff-text); font-size: 14px; outline: none; width: 100%; box-sizing: border-box; }
.ff-input:focus { border-color: var(--ff-sidebar-accent); }
.ff-textarea { resize: vertical; font-family: inherit; }

.add-split-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: 8px; font-size: 13px; cursor: pointer; border: 1px dashed var(--ff-border); background: transparent; color: var(--ff-text-muted); margin-bottom: 20px; transition: all .15s; }
.add-split-btn:hover { border-color: var(--ff-sidebar-accent); color: var(--ff-sidebar-accent); }

.form-actions { display: flex; gap: 10px; justify-content: flex-end; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover:not(:disabled) { filter: brightness(1.1); }
.ff-btn:disabled { opacity: .5; cursor: default; }
.ff-btn-primary { background: var(--ff-sidebar-accent); color: #fff; }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--ff-text-muted); padding: 4px 6px; border-radius: 4px; }
.icon-btn:hover { color: #ef4444; }
</style>
