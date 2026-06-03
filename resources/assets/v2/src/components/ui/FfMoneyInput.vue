<template>
    <div class="ff-money-wrap" :class="{ disabled }">
        <label v-if="label" class="ff-money__label">{{ label }}</label>
        <div class="ff-money__field-wrap">
            <span class="ff-money__symbol">{{ currencySymbol }}</span>
            <input
                class="ff-money__field"
                :class="{ 'has-error': error }"
                type="number"
                step="0.01"
                min="0"
                :placeholder="placeholder"
                :disabled="disabled"
                :value="modelValue"
                @input="emit('update:modelValue', $event.target.value)"
            />
        </div>
        <p v-if="error" class="ff-money__error">{{ error }}</p>
    </div>
</template>

<script setup>
defineProps({
    modelValue:     { default: '' },
    label:          { type: String,  default: undefined },
    currency:       { type: String,  default: 'EUR' },
    currencySymbol: { type: String,  default: '€' },
    error:          { type: String,  default: undefined },
    disabled:       { type: Boolean, default: false },
    placeholder:    { type: String,  default: '0.00' },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.ff-money-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ff-money-wrap.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.ff-money__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ff-text-muted);
}

.ff-money__field-wrap {
    position: relative;
}

.ff-money__symbol {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 13px;
    color: var(--ff-text-muted);
    pointer-events: none;
    z-index: 1;
}

.ff-money__field {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 40px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    color: var(--ff-text);
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
    /* Hide arrows */
    -moz-appearance: textfield;
}

.ff-money__field::-webkit-inner-spin-button,
.ff-money__field::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.ff-money__field.has-error { border-color: var(--ff-negative); }

.ff-money__field:focus {
    border-color: var(--ff-primary-500);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.ff-money__field:disabled { cursor: not-allowed; }

.ff-money__error {
    margin: 0;
    font-size: 11px;
    color: var(--ff-negative);
}
</style>
