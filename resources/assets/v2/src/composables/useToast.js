import { reactive } from 'vue';

const toasts = reactive([]);

let nextId = 1;

export function useToast() {
    function add(message, type = 'info', duration = 4000) {
        const id = nextId++;
        toasts.push({ id, message, type, duration });
        if (duration > 0) {
            setTimeout(() => remove(id), duration);
        }
    }

    function remove(id) {
        const idx = toasts.findIndex(t => t.id === id);
        if (idx !== -1) toasts.splice(idx, 1);
    }

    return {
        toasts,
        success: (msg, duration) => add(msg, 'success', duration),
        error:   (msg, duration) => add(msg, 'error',   duration),
        warning: (msg, duration) => add(msg, 'warning', duration),
        info:    (msg, duration) => add(msg, 'info',    duration),
        remove,
    };
}
