<template>
    <div class="ac-wrapper" ref="wrapper">
        <input
            ref="inputEl"
            type="text"
            class="ac-input"
            :class="{open: open}"
            :placeholder="placeholder"
            :value="query"
            autocomplete="off"
            @input="onInput"
            @keydown.down.prevent="moveDown"
            @keydown.up.prevent="moveUp"
            @keydown.enter.prevent="selectActive"
            @keydown.escape="close"
            @focus="onFocus"
        />
        <ul v-if="open && options.length" class="ac-dropdown">
            <li
                v-for="(item, idx) in options"
                :key="item.id ?? item.name ?? idx"
                class="ac-option"
                :class="{highlighted: idx === activeIdx}"
                @mousedown.prevent="selectItem(item)"
                @mouseover="activeIdx = idx"
            >
                <span class="ac-name">{{ item.name }}</span>
                <span v-if="item.type" class="ac-badge">{{ item.type }}</span>
            </li>
        </ul>
        <div v-if="open && !options.length && !loading" class="ac-empty">No results</div>
        <div v-if="loading" class="ac-loading"><i class="fa-solid fa-spinner fa-spin"></i></div>
    </div>
</template>

<script setup>
import {ref, watch} from 'vue';
import {autocomplete} from '../../api/client.js';

const props = defineProps({
    modelValue: {type: Object, default: null},
    placeholder: {type: String, default: 'Type to search…'},
    endpoint: {
        type: String,
        default: 'accounts',
        validator: (v) => ['accounts', 'categories', 'tags', 'budgets', 'bills', 'piggyBanks'].includes(v),
    },
    params: {type: Object, default: () => ({})},
});

const emit = defineEmits(['update:modelValue', 'select']);

const query = ref(props.modelValue?.name ?? '');
const options = ref([]);
const open = ref(false);
const loading = ref(false);
const activeIdx = ref(0);
const wrapper = ref(null);

let debounceTimer = null;

watch(() => props.modelValue, (val) => {
    query.value = val?.name ?? '';
});

function onInput(e) {
    query.value = e.target.value;
    emit('update:modelValue', null);
    clearTimeout(debounceTimer);
    if (!query.value.trim()) {
        options.value = [];
        open.value = false;
        return;
    }
    debounceTimer = setTimeout(fetch, 280);
}

async function fetch() {
    loading.value = true;
    try {
        const fn = autocomplete[props.endpoint];
        if (!fn) return;
        const res = await fn(query.value, props.params);
        options.value = res.data ?? [];
        activeIdx.value = 0;
        open.value = true;
    } catch {
        options.value = [];
    } finally {
        loading.value = false;
    }
}

function selectItem(item) {
    query.value = item.name;
    emit('update:modelValue', item);
    emit('select', item);
    open.value = false;
}

function selectActive() {
    if (options.value[activeIdx.value]) {
        selectItem(options.value[activeIdx.value]);
    }
}

function moveDown() {
    activeIdx.value = Math.min(activeIdx.value + 1, options.value.length - 1);
}

function moveUp() {
    activeIdx.value = Math.max(activeIdx.value - 1, 0);
}

function close() {
    open.value = false;
}

function onFocus() {
    if (query.value && options.value.length) open.value = true;
}
</script>

<style scoped>
.ac-wrapper {
    position: relative;
    width: 100%;
}

.ac-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    background: var(--ff-card);
    color: var(--ff-text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s;
}

.ac-input:focus, .ac-input.open {
    border-color: var(--ff-sidebar-accent);
}

.ac-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--ff-card);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0,0,0,.15);
    max-height: 260px;
    overflow-y: auto;
    z-index: 1000;
    list-style: none;
    margin: 0;
    padding: 4px 0;
}

.ac-option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 14px;
    cursor: pointer;
    font-size: 13.5px;
}

.ac-option.highlighted {
    background: var(--ff-sidebar-accent);
    color: #fff;
}

.ac-badge {
    font-size: 11px;
    background: rgba(128,128,128,.2);
    border-radius: 4px;
    padding: 1px 6px;
}

.ac-option.highlighted .ac-badge {
    background: rgba(255,255,255,.25);
}

.ac-empty, .ac-loading {
    padding: 10px 14px;
    font-size: 13px;
    color: var(--ff-text-muted);
}

.ac-loading {
    position: absolute;
    right: 10px;
    top: 8px;
}
</style>
