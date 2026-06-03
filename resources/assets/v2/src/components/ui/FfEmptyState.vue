<template>
    <div class="ff-empty-state">
        <i :class="[icon, 'ff-empty-state__icon']" />
        <p class="ff-empty-state__title">{{ title }}</p>
        <p v-if="message" class="ff-empty-state__message">{{ message }}</p>
        <div v-if="$slots.action" class="ff-empty-state__action">
            <slot name="action" />
        </div>
    </div>
</template>

<script setup>
defineProps({
    icon:    { type: String, default: 'fa-solid fa-inbox' },
    title:   { type: String, default: 'No data' },
    message: { type: String, default: undefined },
});
</script>

<style scoped>
.ff-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 48px 24px;
    text-align: center;
}

.ff-empty-state__icon {
    font-size: 40px;
    color: var(--ff-text-subtle);
}

.ff-empty-state__title {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--ff-text-muted);
}

.ff-empty-state__message {
    margin: 0;
    font-size: 13px;
    color: var(--ff-text-subtle);
    max-width: 320px;
}

.ff-empty-state__action {
    margin-top: 4px;
}
</style>
