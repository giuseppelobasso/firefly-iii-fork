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

const props = defineProps({
    data: {type: Array, default: () => []},  // [{label, entries: {date: value}, currency_code}]
    loading: {type: Boolean, default: false},
    height: {type: Number, default: 300},
});

const canvas = ref(null);
let chartInstance = null;

function buildConfig(data) {
    // Collect unique currency codes for multi-Y-axis support
    const currencies = [...new Set(data.map((s) => s.currency_code).filter(Boolean))];
    const labels = data[0] ? Object.keys(data[0].entries ?? {}) : [];

    const datasets = data.map((series) => ({
        label: series.label,
        currency_code: series.currency_code,
        yAxisID: 'y' + series.currency_code,
        data: Object.values(series.entries ?? {}),
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        borderWidth: 2,
    }));

    // Build one Y-axis per currency
    const scales = {
        x: {
            type: 'time',
            time: {tooltipFormat: 'PP'},
            ticks: {maxTicksLimit: 8},
        },
    };
    currencies.forEach((code, idx) => {
        scales['y' + code] = {
            type: 'linear',
            position: idx % 2 === 0 ? 'left' : 'right',
            ticks: {
                callback: (v) => formatMoney(v, code),
            },
        };
    });

    return {
        type: 'line',
        data: {labels, datasets},
        options: {
            animation: false,
            maintainAspectRatio: false,
            interaction: {mode: 'index', intersect: false},
            plugins: {
                legend: {display: true, position: 'top'},
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
.chart-wrapper {
    position: relative;
    width: 100%;
}
.chart-loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--ff-text-muted);
    font-size: 22px;
}
canvas { width: 100% !important; height: 100% !important; }
</style>
