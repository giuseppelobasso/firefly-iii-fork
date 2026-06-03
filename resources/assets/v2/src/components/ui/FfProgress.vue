<template>
    <div class="ff-progress">
        <div v-if="showLabel" class="ff-progress__header">
            <span class="ff-progress__pct">{{ Math.min(value, 100) }}%</span>
            <span v-if="max !== undefined" class="ff-progress__max">di {{ max }}</span>
        </div>
        <div class="ff-progress__track" :style="{ height: height + 'px' }">
            <div
                class="ff-progress__fill"
                :style="{ width: Math.min(value, 100) + '%', background: fillColor }"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    value:     { type: Number,  required: true },
    max:       { type: Number,  default: undefined },
    color:     { type: String,  default: 'auto' },
    showLabel: { type: Boolean, default: true },
    height:    { type: Number,  default: 6 },
});

const fillColor = computed(() => {
    if (props.color === 'primary')  return 'var(--ff-primary-600)';
    if (props.color === 'positive') return 'var(--ff-positive)';
    if (props.color === 'warning')  return 'var(--ff-warning)';
    if (props.color === 'negative') return 'var(--ff-negative)';
    // auto
    if (props.value >= 100) return 'var(--ff-negative)';
    if (props.value >= 80)  return 'var(--ff-warning)';
    return 'var(--ff-positive)';
});
</script>

<style scoped>
.ff-progress {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.ff-progress__header {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--ff-text-muted);
}

.ff-progress__track {
    width: 100%;
    background: var(--ff-surface-3);
    border-radius: 9999px;
    overflow: hidden;
}

.ff-progress__fill {
    height: 100%;
    border-radius: 9999px;
    transition: width 0.4s ease;
}
</style>
