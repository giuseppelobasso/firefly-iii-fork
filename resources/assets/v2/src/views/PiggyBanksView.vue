<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-piggy-bank"></i> Piggy Banks</h1>
        </div>

        <div v-if="loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
        <div v-else-if="error" class="view-error">{{ error }}</div>

        <div v-else class="piggies-grid">
            <div v-for="pig in piggies" :key="pig.id" class="pig-card ff-card">
                <div class="pig-header">
                    <span class="pig-name">{{ pig.attributes?.name }}</span>
                    <span class="pig-pct">{{ pigPct(pig) }}%</span>
                </div>
                <div class="pig-progress-bar">
                    <div class="pig-progress-fill" :style="{width: pigPct(pig) + '%'}"></div>
                </div>
                <div class="pig-amounts">
                    <span class="pig-saved">
                        {{ formatMoney(pig.attributes?.current_amount, pig.attributes?.currency_code) }}
                    </span>
                    <span class="pig-target">
                        of {{ formatMoney(pig.attributes?.target_amount, pig.attributes?.currency_code) }}
                    </span>
                </div>
                <div v-if="pig.attributes?.target_date" class="pig-date text-muted">
                    Target: {{ new Date(pig.attributes.target_date).toLocaleDateString() }}
                </div>
            </div>
            <div v-if="!piggies.length" class="view-empty">No piggy banks found.</div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {piggyBanks as api} from '../api/client.js';
import formatMoney from '../util/format-money.js';

const piggies = ref([]);
const loading = ref(false);
const error = ref(null);

function pigPct(pig) {
    const cur = parseFloat(pig.attributes?.current_amount ?? 0);
    const tgt = parseFloat(pig.attributes?.target_amount ?? 0);
    if (!tgt) return 0;
    return Math.min(100, Math.round((cur / tgt) * 100));
}

onMounted(async () => {
    loading.value = true;
    try {
        const res = await api.list({limit: 50});
        piggies.value = res.data.data ?? [];
    } catch (e) {
        error.value = e.response?.data?.message ?? e.message;
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.view-empty { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.piggies-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.pig-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.pig-name { font-weight: 600; font-size: 15px; }
.pig-pct { font-size: 13px; color: var(--ff-sidebar-accent); font-weight: 600; }
.pig-progress-bar { height: 8px; background: var(--ff-border); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
.pig-progress-fill { height: 100%; background: var(--ff-sidebar-accent); border-radius: 4px; transition: width .4s ease; }
.pig-amounts { display: flex; align-items: baseline; gap: 6px; }
.pig-saved { font-size: 18px; font-weight: 700; }
.pig-target { font-size: 12px; color: var(--ff-text-muted); }
.pig-date { font-size: 12px; margin-top: 6px; }
.text-muted { color: var(--ff-text-muted); }
</style>

