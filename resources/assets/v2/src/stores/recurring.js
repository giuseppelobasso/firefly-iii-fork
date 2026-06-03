import { defineStore } from 'pinia';
import { recurring as api } from '../api/client.js';

export const useRecurringStore = defineStore('recurring', {
    state: () => ({
        list: [],
        current: null,
        loading: false,
        error: null,
    }),
    actions: {
        async load(params = {}) {
            this.loading = true;
            this.error = null;
            try {
                const res = await api.list(params);
                this.list = res.data.data ?? [];
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
            } catch (e) {
                this.error = e.response?.data?.message ?? e.message;
            } finally {
                this.loading = false;
            }
        },
        async store(data) {
            const res = await api.store(data);
            return res.data.data;
        },
        async update(id, data) {
            const res = await api.update(id, data);
            this.current = res.data.data;
            return res.data.data;
        },
        async destroy(id) {
            await api.destroy(id);
            this.list = this.list.filter((r) => r.id !== id);
        },
    },
});
