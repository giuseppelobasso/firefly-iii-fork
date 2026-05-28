<template>
    <div class="ff-card">
        <div class="ff-card-header">
            <div class="ff-card-title-wrap">
                <i :class="[icon, 'ff-card-icon']"></i>
                <h3 class="ff-card-title">{{ title }}</h3>
            </div>
            <RouterLink v-if="link" :to="link" class="ff-card-link">
                View all <i class="fa-solid fa-chevron-right"></i>
            </RouterLink>
        </div>
        <div class="ff-card-body">
            <slot />
        </div>
    </div>
</template>

<script setup>
import {RouterLink} from 'vue-router';

defineProps({
    title: {type: String, required: true},
    icon: {type: String, required: true},
    link: {type: String, default: null},
});
</script>

<style scoped>
.ff-card {
    background: var(--ff-card-bg);
    border: 1px solid var(--ff-border);
    border-radius: 12px;
    overflow: hidden;
}

.ff-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid var(--ff-border);
}

.ff-card-title-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ff-card-icon {
    font-size: 15px;
    color: var(--ff-sidebar-accent);
}

.ff-card-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--ff-text-primary);
}

.ff-card-link {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: var(--ff-sidebar-accent);
    text-decoration: none;
    font-weight: 500;
}
.ff-card-link:hover { text-decoration: underline; }
.ff-card-link i { font-size: 10px; }

.ff-card-body {
    padding: 16px 20px;
}
</style>
