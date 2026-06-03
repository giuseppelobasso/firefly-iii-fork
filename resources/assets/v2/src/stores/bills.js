import { defineStore } from 'pinia';
import { bills as api } from '../api/client.js';

export const useBillsStore = defineStore('bills', {
    state: () => ({
        list: [],
        current: null,
        loading: false,
        error: null,
        pagination: { current_page: 1, total: 0, per_page: 25 },
    }),

    actions: {
        async load(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const res = await api.list({ page: this.pagination.current_page, ...params });
                this.list = res.data.data ?? [];
                this.pagination.total = res.data.meta?.pagination?.total ?? this.list.length;
            } catch (e) {
                this.error = e.response?.data?.message ?? e.message;
            } finally {
                this.loading = false;
            }
        },

        async show(id) {
            this.loading = true;
            this.error = null;
            try {
                const res = await api.show(id);
                this.current = res.data.data;
                return this.current;
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
            const idx = this.list.findIndex((b) => b.id === String(id));
            if (idx !== -1) this.list[idx] = res.data.data;
            this.current = res.data.data;
            return res.data.data;
        },

        async destroy(id) {
            await api.destroy(id);
            this.list = this.list.filter((b) => b.id !== String(id));
            this.pagination.total = Math.max(0, this.pagination.total - 1);
        },
    },
});
