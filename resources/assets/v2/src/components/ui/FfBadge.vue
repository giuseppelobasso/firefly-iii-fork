<template>
    <span class="ff-badge" :class="[`ff-badge--${variant}`, `ff-badge--${size}`]">
        <slot />
    </span>
</template>

<script setup>
defineProps({
    variant: { type: String, default: 'default' },
    size:    { type: String, default: 'sm' },
});
</script>

<style scoped>
.ff-badge {
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    font-weight: 500;
    white-space: nowrap;
}

/* Sizes */
.ff-badge--sm { font-size: 11px; padding: 2px 8px; font-weight: 500; }
.ff-badge--md { font-size: 12px; padding: 4px 10px; font-weight: 600; }

/* Variants */
.ff-badge--default  { background: var(--ff-surface-2); color: var(--ff-text-muted); }
.ff-badge--primary  { background: rgba(124, 58, 237, 0.15); color: #a78bfa; }
.ff-badge--positive { background: rgba(16, 185, 129, 0.15); color: #34d399; }
.ff-badge--warning  { background: rgba(245, 158, 11, 0.15);  color: #fbbf24; }
.ff-badge--negative { background: rgba(239, 68, 68, 0.15);   color: #f87171; }
.ff-badge--info     { background: rgba(99, 102, 241, 0.15);  color: #818cf8; }
</style>
