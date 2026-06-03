<template>
    <button
        :type="type"
        class="ff-btn"
        :class="[`ff-btn--${variant}`, `ff-btn--${size}`, { loading, disabled: disabled || loading }]"
        :disabled="disabled || loading"
        @click="!disabled && !loading && emit('click', $event)"
    >
        <span v-if="loading" class="ff-btn__spinner" />
        <i v-else-if="icon" :class="icon" />
        <slot />
    </button>
</template>

<script setup>
defineProps({
    variant:  { type: String,  default: 'primary' },
    size:     { type: String,  default: 'md' },
    loading:  { type: Boolean, default: false },
    disabled: { type: Boolean, default: false },
    icon:     { type: String,  default: undefined },
    type:     { type: String,  default: 'button' },
});

const emit = defineEmits(['click']);
</script>

<style scoped>
.ff-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    border: 1px solid transparent;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, opacity 0.15s;
    white-space: nowrap;
    user-select: none;
}

.ff-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Sizes */
.ff-btn--sm { padding: 5px 12px; font-size: 12px; }
.ff-btn--md { padding: 8px 16px;  font-size: 13px; }
.ff-btn--lg { padding: 10px 20px; font-size: 14px; }

/* Variants */
.ff-btn--primary {
    background: var(--ff-primary-700);
    color: #fff;
}
.ff-btn--primary:not(.disabled):hover { background: var(--ff-primary-600); }

.ff-btn--secondary {
    background: var(--ff-surface-2);
    border-color: var(--ff-border);
    color: var(--ff-text);
}
.ff-btn--secondary:not(.disabled):hover { background: var(--ff-surface-3); }

.ff-btn--danger {
    background: #dc2626;
    color: #fff;
}
.ff-btn--danger:not(.disabled):hover { background: #b91c1c; }

.ff-btn--ghost {
    background: transparent;
    color: var(--ff-primary-500);
}
.ff-btn--ghost:not(.disabled):hover { background: var(--ff-surface-2); }

/* Spinner */
.ff-btn__spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: ff-spin 0.7s linear infinite;
}

.ff-btn--secondary .ff-btn__spinner,
.ff-btn--ghost .ff-btn__spinner {
    border-color: rgba(0, 0, 0, 0.15);
    border-top-color: var(--ff-primary-600);
}

@keyframes ff-spin {
    to { transform: rotate(360deg); }
}
</style>
