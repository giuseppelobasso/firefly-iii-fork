<template>
    <div class="ff-card" :class="{ elevated }">
        <div v-if="$slots.header || title || subtitle" class="ff-card__header">
            <slot name="header">
                <p v-if="title" class="ff-card__title">{{ title }}</p>
                <p v-if="subtitle" class="ff-card__subtitle">{{ subtitle }}</p>
            </slot>
        </div>

        <div class="ff-card__body" :class="{ 'no-padding': noPadding }">
            <slot />
        </div>

        <div v-if="$slots.footer" class="ff-card__footer">
            <slot name="footer" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    title:     { type: String,  default: undefined },
    subtitle:  { type: String,  default: undefined },
    elevated:  { type: Boolean, default: false },
    noPadding: { type: Boolean, default: false },
});
</script>

<style scoped>
.ff-card {
    background: var(--ff-surface-1);
    border: 1px solid var(--ff-border);
    border-radius: 12px;
    overflow: hidden;
}

.ff-card.elevated {
    background: var(--ff-surface-2);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.ff-card__header {
    padding: 16px 20px 0;
}

.ff-card__title {
    margin: 0 0 2px;
    font-size: 14px;
    font-weight: 600;
    color: var(--ff-text);
}

.ff-card__subtitle {
    margin: 0;
    font-size: 12px;
    color: var(--ff-text-muted);
}

.ff-card__body {
    padding: 20px;
}

.ff-card__body.no-padding {
    padding: 0;
}

.ff-card__footer {
    padding: 12px 20px;
    border-top: 1px solid var(--ff-border-subtle);
}
</style>
