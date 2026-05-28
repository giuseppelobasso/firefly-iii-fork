import {defineStore} from 'pinia';
import {categories as api} from '../api/client.js';

export const useCategoriesStore = defineStore('categories', {
    state: () => ({
        list: [],
        loading: false,
        error: null,
        page: 1,
        total: 0,
        perPage: 50,
    }),

    getters: {
        totalPages: (state) => Math.max(1, Math.ceil(state.total / state.perPage)),
    },

    actions: {
        async load(page = null) {
            if (page !== null) this.page = page;
            this.loading = true;
            this.error = null;
            try {
                const res = await api.list({page: this.page, limit: this.perPage});
                this.list = res.data.data ?? [];
                this.total = res.data.meta?.pagination?.total ?? this.list.length;
            } catch (e) {
                this.error = e.response?.data?.message ?? e.message;
            } finally {
                this.loading = false;
            }
        },

        async store(data) {
            const res = await api.store(data);
            await this.load();
            return res.data.data;
        },

        async update(id, data) {
            const res = await api.update(id, data);
            const idx = this.list.findIndex((c) => c.id === String(id));
            if (idx !== -1) this.list[idx] = res.data.data;
            return res.data.data;
        },

        async destroy(id) {
            await api.destroy(id);
            this.list = this.list.filter((c) => c.id !== String(id));
            this.total = Math.max(0, this.total - 1);
        },
    },
});
