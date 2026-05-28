<template>
    <div>
        <div v-if="error?.show" class="notif notif-error" role="alert">
            <i class="fa-solid fa-circle-exclamation"></i>
            <span>{{ error.text }}</span>
            <a v-if="error.url" :href="error.url" class="notif-link">Details</a>
            <button class="notif-close" @click="$emit('close')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div v-if="success?.show" class="notif notif-success" role="status">
            <i class="fa-solid fa-circle-check"></i>
            <span>{{ success.text }}</span>
            <a v-if="success.url" :href="success.url" class="notif-link">View</a>
            <button class="notif-close" @click="$emit('close')"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div v-if="wait?.show" class="notif notif-wait">
            <i class="fa-solid fa-spinner fa-spin"></i>
            <span>{{ wait.text }}</span>
        </div>
    </div>
</template>

<script setup>
defineProps({
    error: {type: Object, default: null},
    success: {type: Object, default: null},
    wait: {type: Object, default: null},
});

defineEmits(['close']);
</script>

<style scoped>
.notif {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 16px;
    border-radius: 8px;
    margin-bottom: 14px;
    font-size: 14px;
}

.notif-error { background: rgba(239, 68, 68, .12); color: #ef4444; border: 1px solid rgba(239, 68, 68, .25); }
.notif-success { background: rgba(34, 197, 94, .12); color: #22c55e; border: 1px solid rgba(34, 197, 94, .25); }
.notif-wait { background: rgba(99, 102, 241, .12); color: var(--ff-sidebar-accent); border: 1px solid rgba(99, 102, 241, .25); }

.notif span { flex: 1; }

.notif-link {
    color: inherit;
    font-weight: 600;
    text-decoration: underline;
}

.notif-close {
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    opacity: .7;
    padding: 2px 4px;
}

.notif-close:hover { opacity: 1; }
</style>
