import {ref} from 'vue';

export function useNotifications() {
    const error = ref({show: false, text: '', url: ''});
    const success = ref({show: false, text: '', url: ''});
    const wait = ref({show: false, text: ''});

    function showError(text, url = '') {
        error.value = {show: true, text, url};
        success.value.show = false;
        wait.value.show = false;
    }

    function showSuccess(text, url = '') {
        success.value = {show: true, text, url};
        error.value.show = false;
        wait.value.show = false;
    }

    function showWait(text = 'Loading…') {
        wait.value = {show: true, text};
        error.value.show = false;
        success.value.show = false;
    }

    function clear() {
        error.value.show = false;
        success.value.show = false;
        wait.value.show = false;
    }

    async function wrap(fn) {
        showWait();
        try {
            const result = await fn();
            clear();
            return result;
        } catch (e) {
            const msg = e.response?.data?.message ?? e.message ?? 'An error occurred';
            showError(msg);
            throw e;
        }
    }

    return {error, success, wait, showError, showSuccess, showWait, clear, wrap};
}
