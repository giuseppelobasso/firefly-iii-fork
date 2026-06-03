<template>
    <Teleport to="body">
        <div v-if="open" class="ff-modal-overlay" @click.self="emit('close')">
            <div class="ff-modal-card" :class="`ff-modal--${size}`">
                <div class="ff-modal__header">
                    <span class="ff-modal__title">{{ title }}</span>
                    <button type="button" class="ff-modal__close" @click="emit('close')">
                        <i class="fa-solid fa-xmark" />
                    </button>
                </div>
                <div class="ff-modal__body">
                    <slot />
                </div>
                <div v-if="$slots.footer" class="ff-modal__footer">
                    <slot name="footer" />
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';

const props = defineProps({
    open:  { type: Boolean, required: true },
    title: { type: String,  required: true },
    size:  { type: String,  default: 'md' },
});

const emit = defineEmits(['close']);

function onKeydown(e) {
    if (e.key === 'Escape' && props.open) emit('close');
}

onMounted(() => document.addEventListener('keydown', onKeydown));
onUnmounted(() => document.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.ff-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1000;
}

.ff-modal-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90vw;
    background: var(--ff-surface-1);
    border: 1px solid var(--ff-border);
    border-radius: 12px;
    overflow: hidden;
}

.ff-modal--sm { max-width: 380px; }
.ff-modal--md { max-width: 560px; }
.ff-modal--lg { max-width: 760px; }

.ff-modal__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px 16px;
}

.ff-modal__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--ff-text);
}

.ff-modal__close {
    background: none;
    border: none;
    color: var(--ff-text-muted);
    cursor: pointer;
    padding: 4px;
    font-size: 16px;
    line-height: 1;
    transition: color 0.15s;
}
.ff-modal__close:hover { color: var(--ff-text); }

.ff-modal__body {
    padding: 0 24px 20px;
    color: var(--ff-text);
}

.ff-modal__footer {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 24px;
    border-top: 1px solid var(--ff-border);
}
</style>
