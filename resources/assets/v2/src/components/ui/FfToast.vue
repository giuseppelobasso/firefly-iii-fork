<template>
    <Teleport to="body">
        <div class="ff-toast-container">
            <TransitionGroup name="ff-toast">
                <div
                    v-for="toast in toasts"
                    :key="toast.id"
                    class="ff-toast"
                    :class="`ff-toast--${toast.type}`"
                >
                    <i :class="['ff-toast__icon', toastIcon(toast.type)]" />
                    <span class="ff-toast__message">{{ toast.message }}</span>
                    <button type="button" class="ff-toast__close" @click="remove(toast.id)">
                        <i class="fa-solid fa-xmark" />
                    </button>
                </div>
            </TransitionGroup>
        </div>
    </Teleport>
</template>

<script setup>
import { useToast } from '../../composables/useToast.js';

const { toasts, remove } = useToast();

function toastIcon(type) {
    const map = {
        success: 'fa-solid fa-circle-check',
        error:   'fa-solid fa-circle-xmark',
        warning: 'fa-solid fa-triangle-exclamation',
        info:    'fa-solid fa-circle-info',
    };
    return map[type] || map.info;
}
</script>

<style scoped>
.ff-toast-container {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-width: 360px;
    pointer-events: none;
}

.ff-toast {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 10px;
    font-size: 13px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    pointer-events: all;
    border-left-width: 3px;
    border-left-style: solid;
}

.ff-toast--success {
    background: rgba(16, 185, 129, 0.12);
    border-left-color: var(--ff-positive);
}
.ff-toast--success .ff-toast__icon { color: var(--ff-positive); }

.ff-toast--error {
    background: rgba(239, 68, 68, 0.12);
    border-left-color: var(--ff-negative);
}
.ff-toast--error .ff-toast__icon { color: var(--ff-negative); }

.ff-toast--warning {
    background: rgba(245, 158, 11, 0.12);
    border-left-color: var(--ff-warning);
}
.ff-toast--warning .ff-toast__icon { color: var(--ff-warning); }

.ff-toast--info {
    background: rgba(99, 102, 241, 0.12);
    border-left-color: #818cf8;
}
.ff-toast--info .ff-toast__icon { color: #818cf8; }

.ff-toast__icon { font-size: 15px; flex-shrink: 0; }

.ff-toast__message {
    flex: 1;
    color: var(--ff-text);
    line-height: 1.4;
}

.ff-toast__close {
    background: none;
    border: none;
    color: var(--ff-text-muted);
    cursor: pointer;
    padding: 2px 4px;
    font-size: 13px;
    line-height: 1;
    flex-shrink: 0;
    transition: color 0.15s;
}
.ff-toast__close:hover { color: var(--ff-text); }

/* Transitions */
.ff-toast-enter-active { animation: ff-toast-in 0.25s ease; }
.ff-toast-leave-active { animation: ff-toast-in 0.2s ease reverse; }

@keyframes ff-toast-in {
    from {
        opacity: 0;
        transform: translateX(40px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}
</style>
