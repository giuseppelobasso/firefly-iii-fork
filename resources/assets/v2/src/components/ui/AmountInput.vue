<template>
    <div class="amount-wrap">
        <div class="amount-input-row">
            <span class="amount-currency-symbol">{{ symbol }}</span>
            <input
                ref="inputEl"
                type="number"
                step="0.01"
                :min="allowNegative ? undefined : 0"
                class="amount-input"
                :class="{negative: isNegative}"
                :value="modelValue"
                :placeholder="placeholder"
                @input="onInput"
            />
            <button
                v-if="showForeignToggle"
                type="button"
                class="amount-foreign-btn"
                :class="{active: foreignOpen}"
                @click="foreignOpen = !foreignOpen"
                title="Foreign currency amount"
            >
                <i class="fa-solid fa-earth-europe"></i>
            </button>
        </div>

        <div v-if="foreignOpen" class="amount-foreign">
            <select class="amount-select" :value="foreignCurrency" @change="$emit('update:foreignCurrency', $event.target.value)">
                <option value="">— select currency —</option>
                <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.code }} — {{ c.name }}</option>
            </select>
            <input
                type="number"
                step="0.01"
                class="amount-input"
                :value="foreignAmount"
                placeholder="Foreign amount"
                @input="$emit('update:foreignAmount', parseFloat($event.target.value) || null)"
            />
        </div>
    </div>
</template>

<script setup>
import {ref, computed} from 'vue';

const props = defineProps({
    modelValue: {type: [Number, String], default: null},
    currency: {type: String, default: 'EUR'},
    placeholder: {type: String, default: '0.00'},
    allowNegative: {type: Boolean, default: false},
    showForeignToggle: {type: Boolean, default: true},
    foreignAmount: {type: [Number, String], default: null},
    foreignCurrency: {type: String, default: ''},
    currencies: {type: Array, default: () => []},
});

const emit = defineEmits(['update:modelValue', 'update:foreignAmount', 'update:foreignCurrency']);

const foreignOpen = ref(false);

const currencySymbols = {
    EUR: '€', USD: '$', GBP: '£', JPY: '¥', CHF: 'Fr',
    CAD: 'C$', AUD: 'A$', CNY: '¥', HKD: 'HK$', SEK: 'kr',
};

const symbol = computed(() => currencySymbols[props.currency] ?? props.currency);
const isNegative = computed(() => Number(props.modelValue) < 0);

function onInput(e) {
    const v = parseFloat(e.target.value);
    emit('update:modelValue', isNaN(v) ? null : v);
}
</script>

<style scoped>
.amount-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.amount-input-row {
    display: flex;
    align-items: center;
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    overflow: hidden;
    background: var(--ff-card);
    transition: border-color 0.15s;
}

.amount-input-row:focus-within {
    border-color: var(--ff-sidebar-accent);
}

.amount-currency-symbol {
    padding: 0 10px;
    font-size: 13px;
    color: var(--ff-text-muted);
    border-right: 1px solid var(--ff-border);
    white-space: nowrap;
}

.amount-input {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--ff-text);
    font-size: 14px;
    padding: 8px 12px;
    outline: none;
    min-width: 0;
}

.amount-input.negative {
    color: #ef4444;
}

.amount-foreign-btn {
    border: none;
    background: transparent;
    color: var(--ff-text-muted);
    padding: 0 10px;
    cursor: pointer;
    font-size: 13px;
    height: 100%;
    border-left: 1px solid var(--ff-border);
    transition: color 0.15s;
}

.amount-foreign-btn.active, .amount-foreign-btn:hover {
    color: var(--ff-sidebar-accent);
}

.amount-foreign {
    display: flex;
    gap: 8px;
}

.amount-select {
    flex: 1;
    padding: 8px 10px;
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    background: var(--ff-card);
    color: var(--ff-text);
    font-size: 13px;
    outline: none;
}
</style>
