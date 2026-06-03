import { defineStore } from 'pinia';
import { tags as api } from '../api/client.js';

export const useTagsStore = defineStore('tags', {
    state: () => ({
        list: [],
        current: null,
        loading: false,
        error: null,
        page: 1,
        total: 0,
        perPage: 100,
    }),

    actions: {
        async load(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const res = await api.list({ page: this.page, limit: this.perPage, ...params });
                this.list = res.data.data ?? [];
                this.total = res.data.meta?.pagination?.total ?? this.list.length;
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
            const idx = this.list.findIndex((t) => t.id === String(id));
            if (idx !== -1) this.list[idx] = res.data.data;
            this.current = res.data.data;
            return res.data.data;
        },

        async destroy(id) {
            await api.destroy(id);
            this.list = this.list.filter((t) => t.id !== String(id));
            this.total = Math.max(0, this.total - 1);
        },
    },
});
