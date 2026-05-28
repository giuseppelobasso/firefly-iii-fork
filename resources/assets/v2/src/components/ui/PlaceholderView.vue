<template>
    <div class="placeholder-view">
        <div class="placeholder-icon"><i :class="icon"></i></div>
        <h2>{{ title }}</h2>
        <p>This section is under development.</p>
    </div>
</template>

<script setup>
defineProps({
    title: {type: String, required: true},
    icon: {type: String, default: 'fa-solid fa-hammer'},
});
</script>

<style scoped>
.placeholder-view {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 50vh;
    gap: 12px;
    color: var(--ff-text-muted);
    text-align: center;
}
.placeholder-icon { font-size: 48px; opacity: 0.3; margin-bottom: 8px; }
h2 { margin: 0; font-size: 22px; color: var(--ff-text-primary); }
p { margin: 0; font-size: 14px; }
</style>
