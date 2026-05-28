<template>
    <div v-if="totalPages > 1" class="pagination-bar">
        <button class="pg-btn" :disabled="page <= 1" @click="$emit('prev')" aria-label="Previous page">
            <i class="fa-solid fa-chevron-left"></i>
        </button>

        <template v-for="n in pages" :key="n">
            <span v-if="n === '…'" class="pg-ellipsis">…</span>
            <button
                v-else
                class="pg-btn"
                :class="{active: n === page}"
                @click="$emit('goto', n)"
            >{{ n }}</button>
        </template>

        <button class="pg-btn" :disabled="page >= totalPages" @click="$emit('next')" aria-label="Next page">
            <i class="fa-solid fa-chevron-right"></i>
        </button>

        <span class="pg-info">{{ page }} / {{ totalPages }} ({{ total }} items)</span>
    </div>
</template>

<script setup>
import {computed} from 'vue';

const props = defineProps({
    page: {type: Number, required: true},
    totalPages: {type: Number, required: true},
    total: {type: Number, default: 0},
});

defineEmits(['prev', 'next', 'goto']);

const pages = computed(() => {
    const {page, totalPages} = props;
    if (totalPages <= 7) {
        return Array.from({length: totalPages}, (_, i) => i + 1);
    }
    const result = [1];
    if (page > 3) result.push('…');
    const from = Math.max(2, page - 1);
    const to = Math.min(totalPages - 1, page + 1);
    for (let i = from; i <= to; i++) result.push(i);
    if (page < totalPages - 2) result.push('…');
    result.push(totalPages);
    return result;
});
</script>

<style scoped>
.pagination-bar {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
    margin-top: 16px;
}

.pg-btn {
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    border: 1px solid var(--ff-border);
    background: var(--ff-card);
    color: var(--ff-text);
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s, color 0.15s;
}

.pg-btn:hover:not(:disabled) {
    background: var(--ff-sidebar-accent);
    color: #fff;
    border-color: var(--ff-sidebar-accent);
}

.pg-btn.active {
    background: var(--ff-sidebar-accent);
    color: #fff;
    border-color: var(--ff-sidebar-accent);
    font-weight: 600;
}

.pg-btn:disabled {
    opacity: 0.4;
    cursor: default;
}

.pg-ellipsis {
    color: var(--ff-text-muted);
    padding: 0 4px;
}

.pg-info {
    margin-left: 8px;
    font-size: 12px;
    color: var(--ff-text-muted);
}
</style>
