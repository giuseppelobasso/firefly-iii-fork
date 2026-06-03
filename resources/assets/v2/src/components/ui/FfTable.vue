<template>
    <div class="ff-table-container">
        <table class="ff-table">
            <thead>
                <tr>
                    <th
                        v-for="col in columns"
                        :key="col.key"
                        :style="{ textAlign: col.align || 'left' }"
                        :class="{ sortable: col.sortable }"
                        @click="col.sortable && handleSort(col.key)"
                    >
                        {{ col.label }}
                        <span v-if="col.sortable" class="ff-table__sort-icon">
                            <i
                                :class="sortKey === col.key
                                    ? (sortDir === 'asc' ? 'fa-solid fa-sort-up' : 'fa-solid fa-sort-down')
                                    : 'fa-solid fa-sort'"
                            />
                        </span>
                    </th>
                </tr>
            </thead>
            <tbody>
                <!-- Loading skeleton -->
                <template v-if="loading">
                    <tr v-for="i in 5" :key="'sk-' + i" class="ff-table__skeleton-row">
                        <td v-for="col in columns" :key="col.key">
                            <span class="ff-table__skeleton" />
                        </td>
                    </tr>
                </template>

                <!-- Empty state -->
                <tr v-else-if="sortedRows.length === 0">
                    <td :colspan="columns.length" class="ff-table__empty">
                        {{ emptyMessage }}
                    </td>
                </tr>

                <!-- Data rows -->
                <tr
                    v-else
                    v-for="(row, idx) in sortedRows"
                    :key="idx"
                    class="ff-table__row"
                    @click="emit('row-click', row)"
                >
                    <td
                        v-for="col in columns"
                        :key="col.key"
                        :style="{ textAlign: col.align || (col.format === 'money' || col.format === 'date' ? 'right' : 'left') }"
                        :class="{ 'ff-table__money': col.format === 'money' }"
                    >
                        {{ row[col.key] }}
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
    columns:      { type: Array,   required: true },
    rows:         { type: Array,   required: true },
    loading:      { type: Boolean, default: false },
    emptyMessage: { type: String,  default: 'No data' },
});

const emit = defineEmits(['row-click', 'sort']);

const sortKey = ref(null);
const sortDir = ref('asc');

function handleSort(key) {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortKey.value = key;
        sortDir.value = 'asc';
    }
    emit('sort', { key: sortKey.value, dir: sortDir.value });
}

const sortedRows = computed(() => {
    if (!sortKey.value) return props.rows;
    const key = sortKey.value;
    const dir = sortDir.value === 'asc' ? 1 : -1;
    return [...props.rows].sort((a, b) => {
        if (a[key] < b[key]) return -dir;
        if (a[key] > b[key]) return dir;
        return 0;
    });
});
</script>

<style scoped>
.ff-table-container {
    overflow-x: auto;
}

.ff-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.ff-table thead th {
    padding: 8px 12px;
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ff-text-muted);
    border-bottom: 1px solid var(--ff-border);
    white-space: nowrap;
}

.ff-table thead th.sortable {
    cursor: pointer;
}
.ff-table thead th.sortable:hover { color: var(--ff-text); }

.ff-table__sort-icon {
    margin-left: 4px;
    font-size: 10px;
}

.ff-table__row td {
    padding: 10px 12px;
    border-bottom: 1px solid var(--ff-border-subtle);
    color: var(--ff-text);
}

.ff-table__row:hover td { background: var(--ff-surface-2); }
.ff-table__row { cursor: pointer; }

.ff-table__money {
    font-family: 'JetBrains Mono', monospace;
}

/* Skeleton */
.ff-table__skeleton-row td { padding: 10px 12px; }
.ff-table__skeleton {
    display: block;
    height: 14px;
    background: var(--ff-surface-2);
    border-radius: 4px;
    animation: ff-pulse 1.5s ease-in-out infinite;
}

@keyframes ff-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.ff-table__empty {
    text-align: center;
    padding: 32px 12px;
    color: var(--ff-text-muted);
}
</style>
