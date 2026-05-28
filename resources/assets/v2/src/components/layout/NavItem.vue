<template>
    <RouterLink
        :to="to"
        class="ff-nav-item"
        :class="{'ff-nav-item--active': isActive}"
    >
        <i :class="[icon, 'ff-nav-item-icon']"></i>
        <span class="ff-nav-item-label">{{ label }}</span>
    </RouterLink>
</template>

<script setup>
import {computed} from 'vue';
import {RouterLink, useRoute} from 'vue-router';

const props = defineProps({
    to: {type: String, required: true},
    icon: {type: String, required: true},
    label: {type: String, required: true},
});

const route = useRoute();
const isActive = computed(() => route.path.startsWith(props.to));
</script>

<style scoped>
.ff-nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 20px;
    color: var(--ff-sidebar-text);
    text-decoration: none;
    font-size: 13.5px;
    font-weight: 400;
    border-left: 3px solid transparent;
    transition: color 0.15s, background 0.15s, border-color 0.15s;
    white-space: nowrap;
    overflow: hidden;
}

.ff-nav-item:hover {
    color: var(--ff-sidebar-text-active);
    background: rgba(255,255,255,0.05);
}

.ff-nav-item--active {
    color: var(--ff-sidebar-text-active);
    background: rgba(79,142,247,0.12);
    border-left-color: var(--ff-sidebar-accent);
    font-weight: 500;
}

.ff-nav-item-icon {
    font-size: 14px;
    width: 18px;
    text-align: center;
    flex-shrink: 0;
}

.ff-nav-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
