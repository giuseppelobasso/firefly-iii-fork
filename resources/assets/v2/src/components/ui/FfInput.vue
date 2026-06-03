<template>
    <div class="ff-input-wrap" :class="{ disabled }">
        <label v-if="label" class="ff-input__label">
            {{ label }}<span v-if="required" class="ff-input__required">*</span>
        </label>
        <div class="ff-input__field-wrap">
            <i v-if="icon" :class="['ff-input__icon', icon]" />
            <input
                class="ff-input__field"
                :class="{ 'has-icon': icon, 'has-error': error }"
                :type="type"
                :placeholder="placeholder"
                :disabled="disabled"
                :value="modelValue"
                @input="emit('update:modelValue', $event.target.value)"
            />
        </div>
        <p v-if="error" class="ff-input__error">{{ error }}</p>
        <p v-else-if="hint" class="ff-input__hint">{{ hint }}</p>
    </div>
</template>

<script setup>
defineProps({
    modelValue:  { default: '' },
    label:       { type: String,  default: undefined },
    placeholder: { type: String,  default: '' },
    type:        { type: String,  default: 'text' },
    error:       { type: String,  default: undefined },
    hint:        { type: String,  default: undefined },
    icon:        { type: String,  default: undefined },
    disabled:    { type: Boolean, default: false },
    required:    { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.ff-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ff-input-wrap.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.ff-input__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ff-text-muted);
}

.ff-input__required {
    color: var(--ff-negative);
    margin-left: 2px;
}

.ff-input__field-wrap {
    position: relative;
}

.ff-input__icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ff-text-subtle);
    font-size: 14px;
    pointer-events: none;
}

.ff-input__field {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    color: var(--ff-text);
    font-size: 13px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.ff-input__field.has-icon {
    padding-left: 36px;
}

.ff-input__field.has-error {
    border-color: var(--ff-negative);
}

.ff-input__field:focus {
    border-color: var(--ff-primary-500);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.ff-input__field:disabled {
    cursor: not-allowed;
}

.ff-input__error {
    margin: 0;
    font-size: 11px;
    color: var(--ff-negative);
}

.ff-input__hint {
    margin: 0;
    font-size: 11px;
    color: var(--ff-text-muted);
}
</style>
