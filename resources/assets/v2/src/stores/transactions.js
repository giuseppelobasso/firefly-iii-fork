import {defineStore} from 'pinia';
import {transactions as api} from '../api/client.js';

export const useTransactionsStore = defineStore('transactions', {
    state: () => ({
        list: [],
        current: null,
        loading: false,
        error: null,
        page: 1,
        total: 0,
        perPage: 25,
        type: 'withdrawal',
        start: null,
        end: null,
    }),

    getters: {
        totalPages: (state) => Math.max(1, Math.ceil(state.total / state.perPage)),
    },

    actions: {
        async load(params = {}) {
            if (params.type !== undefined) this.type = params.type;
            if (params.page !== undefined) this.page = params.page;
            if (params.start !== undefined) this.start = params.start;
            if (params.end !== undefined) this.end = params.end;
            this.loading = true;
            this.error = null;
            try {
                const query = {
                    type: this.type,
                    page: this.page,
                    limit: this.perPage,
                };
                if (this.start) query.start = this.start;
                if (this.end) query.end = this.end;
                const res = await api.list(query);
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
                throw e;
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
