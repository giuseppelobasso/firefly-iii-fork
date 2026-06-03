<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-tags"></i> Categories</h1>
            <FfButton icon="fa-solid fa-plus" @click="router.push('/categories/create')">
                New category
            </FfButton>
        </div>

        <FfCard :no-padding="true">
            <div v-if="store.loading" class="table-loading">
                <i class="fa-solid fa-spinner fa-spin"></i> Loading…
            </div>
            <FfEmptyState
                v-else-if="!store.list.length"
                icon="fa-solid fa-tags"
                title="No categories"
                message="Categorize your transactions for better insights."
            />
            <table v-else class="tbl">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style="text-align: right">Spending this month</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="cat in store.list"
                        :key="cat.id"
                        class="tbl-row"
                        @click="router.push(`/categories/${cat.id}`)"
                    >
                        <td class="tbl-name">{{ cat.attributes?.name }}</td>
                        <td class="tbl-mono tbl-right tbl-negative">{{ insightFor(cat.attributes?.name) }}</td>
                    </tr>
                </tbody>
            </table>
        </FfCard>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore } from '../stores/categories.js';
import FfCard from '../components/ui/FfCard.vue';
import FfButton from '../components/ui/FfButton.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';

const router = useRouter();
const store = useCategoriesStore();

function startOfMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
}

function today() {
    return new Date().toISOString().slice(0, 10);
}

function insightFor(name) {
    if (!store.insight.length) return '—';
    const entry = store.insight.find((i) => i.name === name);
    if (!entry) return '—';
    const diff = entry.difference_float ?? entry.difference ?? null;
    if (diff == null) return '—';
    return `${entry.currency_symbol ?? '€'}${Math.abs(Number(diff)).toFixed(2)}`;
}

onMounted(() => {
    store.load();
    store.loadInsight(startOfMonth(), today());
});
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.table-loading { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.tbl { width: 100%; border-collapse: collapse; font-size: 13px; }
.tbl th { padding: 10px 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: .06em; color: var(--ff-text-muted); border-bottom: 1px solid var(--ff-border); text-align: left; }
.tbl td { padding: 12px 16px; border-bottom: 1px solid var(--ff-border); vertical-align: middle; }
.tbl-row { cursor: pointer; transition: background .1s; }
.tbl-row:hover { background: var(--ff-surface-2); }
.tbl-row:last-child td { border-bottom: none; }
.tbl-name { font-weight: 500; }
.tbl-mono { font-family: 'JetBrains Mono', monospace; }
.tbl-right { text-align: right; }
.tbl-negative { color: var(--ff-negative); }
</style>

