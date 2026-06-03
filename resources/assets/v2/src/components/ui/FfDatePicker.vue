<template>
    <div class="ff-datepicker-wrap" :class="{ disabled }">
        <label v-if="label" class="ff-datepicker__label">{{ label }}</label>
        <div class="ff-datepicker__field-wrap">
            <i class="ff-datepicker__icon fa-regular fa-calendar-days" />
            <input
                class="ff-datepicker__field"
                :class="{ 'has-error': error }"
                type="date"
                :placeholder="placeholder"
                :disabled="disabled"
                :value="modelValue"
                @change="emit('update:modelValue', $event.target.value)"
            />
        </div>
        <p v-if="error" class="ff-datepicker__error">{{ error }}</p>
    </div>
</template>

<script setup>
defineProps({
    modelValue:  { type: String,  default: '' },
    label:       { type: String,  default: undefined },
    placeholder: { type: String,  default: 'Select date' },
    error:       { type: String,  default: undefined },
    disabled:    { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.ff-datepicker-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ff-datepicker-wrap.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.ff-datepicker__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ff-text-muted);
}

.ff-datepicker__field-wrap {
    position: relative;
}

.ff-datepicker__icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ff-text-subtle);
    font-size: 13px;
    pointer-events: none;
    z-index: 1;
}

.ff-datepicker__field {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px 8px 36px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    color: var(--ff-text);
    font-size: 13px;
    outline: none;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
    /* Hide default browser calendar icon */
    -webkit-appearance: none;
    appearance: none;
}

.ff-datepicker__field::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.ff-datepicker__field.has-error { border-color: var(--ff-negative); }

.ff-datepicker__field:focus {
    border-color: var(--ff-primary-500);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.ff-datepicker__field:disabled { cursor: not-allowed; }

.ff-datepicker__error {
    margin: 0;
    font-size: 11px;
    color: var(--ff-negative);
}
</style>
