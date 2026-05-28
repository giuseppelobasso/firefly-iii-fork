<template>
    <div class="chart-wrapper" :style="{height: height + 'px'}">
        <div v-if="loading" class="chart-loading">
            <i class="fa-solid fa-spinner fa-spin"></i> Building flow…
        </div>
        <div v-else-if="!hasData" class="chart-empty">
            No flow data available for the selected period.
        </div>
        <canvas v-show="!loading && hasData" ref="canvas"></canvas>
    </div>
</template>

<script setup>
import {ref, computed, watch, onMounted, onUnmounted} from 'vue';
import {Chart} from './chart-registry.js';

/**
 * SankeyChart
 * Receives pre-processed sankey data: { flows: [{from, to, flow}], labels: {key: displayLabel} }
 * Data processing (transaction parsing) happens in the parent (SankeyChartContainer / ReportsView).
 */
const props = defineProps({
    flows: {type: Array, default: () => []},   // [{from, to, flow}]
    labels: {type: Object, default: () => ({})}, // key → display label
    loading: {type: Boolean, default: false},
    height: {type: Number, default: 400},
});

const canvas = ref(null);
let chartInstance = null;

const hasData = computed(() => props.flows.length > 0);

const COLOR_MAP = {
    revenue: 'forestgreen',
    in: '#22c55e',
    budget: 'orchid',
    out: 'mediumpurple',
    money: '#4f8ef7',
};

function getColor(key) {
    const k = (key ?? '').toLowerCase();
    if (k.includes('revenue')) return 'forestgreen';
    if (k.includes('(in')) return '#22c55e';
    if (k.includes('budget')) return 'orchid';
    if (k.includes('(out')) return 'mediumpurple';
    if (k.includes('all money') || k.includes('tutto')) return '#4f8ef7';
    return '#ef4444';
}

function buildConfig() {
    return {
        type: 'sankey',
        data: {
            datasets: [{
                label: 'Money flow',
                data: props.flows,
                labels: props.labels,
                colorFrom: (c) => getColor(c.dataset.data[c.dataIndex]?.from ?? ''),
                colorTo: (c) => getColor(c.dataset.data[c.dataIndex]?.to ?? ''),
                colorMode: 'gradient',
                size: 'min',
            }],
        },
        options: {
            animation: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {display: false},
                tooltip: {
                    callbacks: {
                        label: (item) => {
                            const d = item.dataset.data[item.dataIndex];
                            return d ? `${d.from} → ${d.to}: ${d.flow.toFixed(2)}` : '';
                        },
                    },
                },
            },
        },
    };
}

function draw() {
    if (!canvas.value || !hasData.value) return;
    const cfg = buildConfig();
    if (chartInstance) {
        chartInstance.data = cfg.data;
        chartInstance.update();
    } else {
        chartInstance = new Chart(canvas.value, cfg);
    }
}

onMounted(draw);
watch(() => props.flows, draw, {deep: true});
onUnmounted(() => chartInstance?.destroy());
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; }
.chart-loading, .chart-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ff-text-muted);
    font-size: 14px;
    gap: 8px;
}
canvas { width: 100% !important; height: 100% !important; }
</style>
