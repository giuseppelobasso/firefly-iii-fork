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
 * Generic BarChart.
 * Props:
 *   data     – array of { label, entries: {key: value}, currency_code }
 *              OR array of { label, amount, currency_code } for single-value bars
 *   labels   – optional label override for X axis
 *   horizontal – render horizontal bars (indexAxis: 'y')
 */
const props = defineProps({
    data: {type: Array, default: () => []},
    labels: {type: Array, default: () => []},
    horizontal: {type: Boolean, default: false},
    loading: {type: Boolean, default: false},
    height: {type: Number, default: 300},
});

const canvas = ref(null);
let chartInstance = null;

function buildConfig(data) {
    const currencies = [...new Set(data.map((s) => s.currency_code).filter(Boolean))];

    // Detect format: entries-based vs single-amount-based
    const isEntriesBased = data.some((s) => s.entries && typeof s.entries === 'object');

    let axisLabels = props.labels.length ? props.labels : [];
    const datasets = [];

    if (isEntriesBased) {
        if (!axisLabels.length && data[0]?.entries) {
            axisLabels = Object.keys(data[0].entries);
        }
        data.forEach((series) => {
            datasets.push({
                label: series.label,
                currency_code: series.currency_code,
                yAxisID: props.horizontal ? undefined : 'y' + series.currency_code,
                data: Object.values(series.entries ?? {}),
            });
        });
    } else {
        // Simple: one bar per item
        axisLabels = data.map((s) => s.label);
        const code = data[0]?.currency_code ?? 'EUR';
        datasets.push({
            label: 'Amount',
            currency_code: code,
            data: data.map((s) => Math.abs(parseFloat(s.amount ?? 0))),
        });
    }

    const scales = {};
    if (!props.horizontal) {
        currencies.forEach((code, idx) => {
            scales['y' + code] = {
                type: 'linear',
                position: idx % 2 === 0 ? 'left' : 'right',
                ticks: {callback: (v) => formatMoney(v, code)},
            };
        });
    }

    return {
        type: 'bar',
        data: {labels: axisLabels, datasets},
        options: {
            animation: false,
            maintainAspectRatio: false,
            indexAxis: props.horizontal ? 'y' : 'x',
            interaction: {mode: 'index', intersect: false},
            plugins: {
                legend: {display: datasets.length > 1},
                tooltip: {
                    callbacks: {
                        label: (item) => formatMoney(item.raw, item.dataset.currency_code),
                    },
                },
            },
            scales,
        },
    };
}

function draw() {
    if (!canvas.value || !props.data.length) return;
    const cfg = buildConfig(props.data);
    if (chartInstance) {
        chartInstance.data = cfg.data;
        chartInstance.options = cfg.options;
        chartInstance.update();
    } else {
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
