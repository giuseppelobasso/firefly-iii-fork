<template>
    <div class="summary-box" :class="`summary-box--${variant}`">
        <div class="summary-box-icon">
            <i :class="icon"></i>
        </div>
        <div class="summary-box-body">
            <p class="summary-box-label">{{ label }}</p>
            <p class="summary-box-value">
                <template v-if="loading">
                    <span class="summary-box-skeleton"></span>
                </template>
                <template v-else>
                    {{ formattedValue }}
                </template>
            </p>
        </div>
    </div>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    label: {type: String, required: true},
    icon: {type: String, required: true},
    variant: {type: String, default: 'neutral'},  // 'positive' | 'negative' | 'neutral'
    value: {type: [Number, String, null], default: null},
    currency: {type: String, default: 'EUR'},
    loading: {type: Boolean, default: false},
});

const formattedValue = computed(() => {
    if (props.value === null || props.value === undefined) return '—';
    const n = typeof props.value === 'string' ? parseFloat(props.value) : props.value;
    if (isNaN(n)) return '—';
    return new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: props.currency,
        minimumFractionDigits: 2,
    }).format(n);
});
</script>

<style scoped>
.summary-box {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--ff-card-bg);
    border: 1px solid var(--ff-border);
    border-radius: 12px;
    padding: 18px 20px;
}

.summary-box-icon {
    width: 44px;
    height: 44px;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
}

.summary-box--positive .summary-box-icon {
    background: rgba(56,161,105,0.12);
    color: var(--ff-positive);
}
.summary-box--negative .summary-box-icon {
    background: rgba(229,62,62,0.10);
    color: var(--ff-negative);
}
.summary-box--neutral .summary-box-icon {
    background: rgba(79,142,247,0.12);
    color: var(--ff-sidebar-accent);
}

.summary-box-body { flex: 1; min-width: 0; }

.summary-box-label {
    margin: 0 0 4px;
    font-size: 12px;
    font-weight: 500;
    color: var(--ff-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.summary-box-value {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--ff-text-primary);
}

.summary-box--positive .summary-box-value { color: var(--ff-positive); }
.summary-box--negative .summary-box-value { color: var(--ff-negative); }

.summary-box-skeleton {
    display: inline-block;
    width: 100px;
    height: 20px;
    background: linear-gradient(90deg, var(--ff-border) 25%, rgba(0,0,0,0.04) 50%, var(--ff-border) 75%);
    background-size: 200% 100%;
    border-radius: 6px;
    animation: shimmer 1.4s infinite;
}

@keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
</style>
