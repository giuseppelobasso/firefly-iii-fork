import {ref, computed} from 'vue';

export function usePagination(perPageDefault = 25) {
    const page = ref(1);
    const perPage = ref(perPageDefault);
    const total = ref(0);

    const totalPages = computed(() => Math.max(1, Math.ceil(total.value / perPage.value)));

    function next() {
        if (page.value < totalPages.value) page.value++;
    }

    function prev() {
        if (page.value > 1) page.value--;
    }

    function goTo(n) {
        page.value = Math.max(1, Math.min(n, totalPages.value));
    }

    function reset() {
        page.value = 1;
    }

    return {page, perPage, total, totalPages, next, prev, goTo, reset};
}
