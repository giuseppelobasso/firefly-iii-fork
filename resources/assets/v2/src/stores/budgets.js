import {defineStore} from 'pinia';
import {budgets as api} from '../api/client.js';

export const useBudgetsStore = defineStore('budgets', {
    state: () => ({
        list: [],
        loading: false,
        error: null,
        start: null,
        end: null,
    }),

    actions: {
        async load(start = null, end = null) {
            if (start !== null) this.start = start;
            if (end !== null) this.end = end;
            this.loading = true;
            this.error = null;
            try {
                const params = {limit: 100};
                if (this.start) params.start = this.start;
                if (this.end) params.end = this.end;
                const res = await api.list(params);
                const raw = res.data.data ?? [];
                // For each budget, attach limits for current period if available
                if (this.start && this.end) {
                    this.list = await Promise.all(raw.map(async (b) => {
                        try {
                            const limRes = await api.limits.list(b.id, {start: this.start, end: this.end});
                            b._limits = limRes.data.data ?? [];
                        } catch {
                            b._limits = [];
                        }
                        return b;
                    }));
                } else {
                    this.list = raw;
                }
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
            return res.data.data;
        },

        async destroy(id) {
            await api.destroy(id);
            this.list = this.list.filter((b) => b.id !== String(id));
        },
    },
});
