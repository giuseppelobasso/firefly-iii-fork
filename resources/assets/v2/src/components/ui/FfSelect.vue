<template>
    <div class="ff-select-wrap" :class="{ disabled }" ref="wrapRef">
        <label v-if="label" class="ff-select__label">{{ label }}</label>

        <!-- Non-searchable: native select -->
        <div v-if="!searchable" class="ff-select__native-wrap">
            <select
                class="ff-select__native"
                :class="{ 'has-error': error }"
                :disabled="disabled"
                :value="modelValue"
                @change="emit('update:modelValue', $event.target.value)"
            >
                <option value="" disabled :selected="modelValue === null || modelValue === ''">
                    {{ placeholder }}
                </option>
                <option
                    v-for="opt in options"
                    :key="opt.value"
                    :value="opt.value"
                >{{ opt.label }}</option>
            </select>
            <i class="ff-select__chevron fa-solid fa-chevron-down" />
        </div>

        <!-- Searchable: custom dropdown -->
        <div v-else class="ff-select__custom">
            <button
                type="button"
                class="ff-select__trigger"
                :class="{ 'has-error': error }"
                :disabled="disabled"
                @click="toggleDropdown"
            >
                <span :class="{ placeholder: selectedLabel === placeholder }">{{ selectedLabel }}</span>
                <i class="fa-solid fa-chevron-down ff-select__chevron-inline" :class="{ open: isOpen }" />
            </button>

            <div v-if="isOpen" class="ff-select__dropdown">
                <div class="ff-select__search-wrap">
                    <input
                        ref="searchRef"
                        v-model="query"
                        class="ff-select__search"
                        placeholder="Search..."
                    />
                </div>
                <ul class="ff-select__list">
                    <li
                        v-for="opt in filteredOptions"
                        :key="opt.value"
                        class="ff-select__option"
                        :class="{ selected: opt.value === modelValue }"
                        @click="selectOption(opt)"
                    >{{ opt.label }}</li>
                    <li v-if="filteredOptions.length === 0" class="ff-select__option ff-select__option--empty">
                        No results
                    </li>
                </ul>
            </div>
        </div>

        <p v-if="error" class="ff-select__error">{{ error }}</p>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';

const props = defineProps({
    modelValue:  { default: null },
    options:     { type: Array,   default: () => [] },
    label:       { type: String,  default: undefined },
    placeholder: { type: String,  default: 'Select...' },
    error:       { type: String,  default: undefined },
    disabled:    { type: Boolean, default: false },
    searchable:  { type: Boolean, default: false },
});

const emit = defineEmits(['update:modelValue']);

const wrapRef   = ref(null);
const searchRef = ref(null);
const isOpen    = ref(false);
const query     = ref('');

const selectedLabel = computed(() => {
    const found = props.options.find(o => o.value === props.modelValue);
    return found ? found.label : props.placeholder;
});

const filteredOptions = computed(() =>
    props.options.filter(o => o.label.toLowerCase().includes(query.value.toLowerCase()))
);

function toggleDropdown() {
    if (props.disabled) return;
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        query.value = '';
        nextTick(() => searchRef.value?.focus());
    }
}

function selectOption(opt) {
    emit('update:modelValue', opt.value);
    isOpen.value = false;
}

function onClickOutside(e) {
    if (wrapRef.value && !wrapRef.value.contains(e.target)) {
        isOpen.value = false;
    }
}

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style scoped>
.ff-select-wrap {
    display: flex;
    flex-direction: column;
    gap: 4px;
    position: relative;
}

.ff-select-wrap.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.ff-select__label {
    font-size: 12px;
    font-weight: 500;
    color: var(--ff-text-muted);
}

/* Native select */
.ff-select__native-wrap {
    position: relative;
}

.ff-select__native {
    width: 100%;
    box-sizing: border-box;
    padding: 8px 32px 8px 12px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    color: var(--ff-text);
    font-size: 13px;
    outline: none;
    appearance: none;
    cursor: pointer;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.ff-select__native.has-error { border-color: var(--ff-negative); }
.ff-select__native:focus {
    border-color: var(--ff-primary-500);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.ff-select__chevron {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--ff-text-subtle);
    font-size: 12px;
    pointer-events: none;
}

/* Searchable */
.ff-select__custom { position: relative; }

.ff-select__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    color: var(--ff-text);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s, box-shadow 0.15s;
}

.ff-select__trigger.has-error { border-color: var(--ff-negative); }
.ff-select__trigger:focus {
    border-color: var(--ff-primary-500);
    box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
    outline: none;
}

.ff-select__trigger span.placeholder { color: var(--ff-text-subtle); }

.ff-select__chevron-inline {
    font-size: 11px;
    color: var(--ff-text-subtle);
    transition: transform 0.15s;
}
.ff-select__chevron-inline.open { transform: rotate(180deg); }

.ff-select__dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    border-radius: 8px;
    z-index: 100;
    overflow: hidden;
}

.ff-select__search-wrap { padding: 8px; }

.ff-select__search {
    width: 100%;
    box-sizing: border-box;
    padding: 6px 10px;
    background: var(--ff-surface-1);
    border: 1px solid var(--ff-border);
    border-radius: 6px;
    color: var(--ff-text);
    font-size: 12px;
    outline: none;
}

.ff-select__list {
    list-style: none;
    margin: 0;
    padding: 4px 0;
    max-height: 220px;
    overflow-y: auto;
}

.ff-select__option {
    padding: 8px 12px;
    font-size: 13px;
    color: var(--ff-text);
    cursor: pointer;
    transition: background 0.1s;
}

.ff-select__option:hover { background: var(--ff-surface-3); }
.ff-select__option.selected {
    background: rgba(124, 58, 237, 0.15);
    color: #a78bfa;
}

.ff-select__option--empty {
    color: var(--ff-text-subtle);
    cursor: default;
    font-style: italic;
}

.ff-select__error {
    margin: 0;
    font-size: 11px;
    color: var(--ff-negative);
}
</style>
