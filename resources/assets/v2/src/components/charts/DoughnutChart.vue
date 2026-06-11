<template>
    <div class="chart-wrapper" :style="{height: height + 'px'}">
        <div v-if="loading" class="chart-loading">
            <i class="fa-solid fa-spinner fa-spin"></i>
        </div>
        <canvas v-show="!loading" ref="canvas"></canvas>
    </div>
</template>

<script setup>
import {ref, watch, onMounted, onUnmounted} from 'vue';
import {Chart} from './chart-registry.js';
import formatMoney from '../../util/format-money.js';

/**
 * DoughnutChart
 * Props:
 *   data         – array of { label, amount, currency_code }
 *   currencyCode – fallback currency code
 */
const props = defineProps({
    data: {type: Array, default: () => []},
    currencyCode: {type: String, default: 'EUR'},
    loading: {type: Boolean, default: false},
    height: {type: Number, default: 240},
});

const PALETTE = [
    '#4f8ef7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#64748b',
];

const canvas = ref(null);
let chartInstance = null;

function buildConfig(data) {
    const labels = data.map((d) => d.label);
    const values = data.map((d) => Math.abs(parseFloat(d.amount ?? 0)));
    const code = data[0]?.currency_code ?? props.currencyCode;

    return {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data: values,
                currency_code: code,
                backgroundColor: PALETTE,
                borderWidth: 1,
            }],
        },
        options: {
            animation: false,
            maintainAspectRatio: false,
            plugins: {
                legend: {position: 'right', labels: {boxWidth: 12, font: {size: 12}}},
                tooltip: {
                    callbacks: {
                        label: (item) => `${item.label}: ${formatMoney(item.raw, code)}`,
                    },
                },
            },
        },
    };
}

function draw() {
    if (!canvas.value || !props.data.length) return;
    const cfg = buildConfig(props.data);
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    if (props.data.length) {
        chartInstance = new Chart(canvas.value, cfg);
    }
}

onMounted(draw);
watch(() => props.data, draw, {deep: true});
onUnmounted(() => chartInstance?.destroy());
</script>

<style scoped>
.chart-wrapper { position: relative; width: 100%; }
.chart-loading { display: flex; align-items: center; justify-content: center; height: 100%; color: var(--ff-text-muted); font-size: 22px; }
canvas { width: 100% !important; height: 100% !important; }
</style>
