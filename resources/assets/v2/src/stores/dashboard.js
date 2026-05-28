import {defineStore} from 'pinia';
import axios from 'axios';

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        summary: {},
        accounts: [],
        transactions: [],
        budgets: [],
        categories: [],
        piggies: [],
        loading: {
            summary: false,
            accounts: false,
            transactions: false,
            budgets: false,
            categories: false,
            piggies: false,
        },
        errors: {},
    }),

    actions: {
        async loadAll(start, end) {
            const fmt = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d);
            const s = fmt(start);
            const e = fmt(end);
            await Promise.all([
                this.loadSummary(s, e),
                this.loadAccounts(),
                this.loadTransactions(s, e),
                this.loadBudgets(s, e),
                this.loadCategories(s, e),
                this.loadPiggies(),
            ]);
        },

        async loadSummary(start, end) {
            this.loading.summary = true;
            try {
                const res = await axios.get('/api/v1/summary/basic', {params: {start, end}});
                this.summary = res.data;
            } catch (e) {
                this.errors.summary = e.message;
            } finally {
                this.loading.summary = false;
            }
        },

        async loadAccounts() {
            this.loading.accounts = true;
            try {
                const res = await axios.get('/api/v1/accounts', {params: {type: 'asset', limit: 50}});
                this.accounts = res.data.data ?? [];
            } catch (e) {
                this.errors.accounts = e.message;
            } finally {
                this.loading.accounts = false;
            }
        },

        async loadTransactions(start, end) {
            this.loading.transactions = true;
            try {
                const res = await axios.get('/api/v1/transactions', {params: {start, end, limit: 10, page: 1}});
                this.transactions = res.data.data ?? [];
            } catch (e) {
                this.errors.transactions = e.message;
            } finally {
                this.loading.transactions = false;
            }
        },

        async loadBudgets(start, end) {
            this.loading.budgets = true;
            try {
                const res = await axios.get('/api/v1/budgets', {params: {start, end, limit: 20}});
                this.budgets = res.data.data ?? [];
            } catch (e) {
                this.errors.budgets = e.message;
            } finally {
                this.loading.budgets = false;
            }
        },

        async loadCategories(start, end) {
            this.loading.categories = true;
            try {
                const res = await axios.get('/api/v1/categories', {params: {start, end, limit: 20}});
                this.categories = res.data.data ?? [];
            } catch (e) {
                this.errors.categories = e.message;
            } finally {
                this.loading.categories = false;
            }
        },

        async loadPiggies() {
            this.loading.piggies = true;
            try {
                const res = await axios.get('/api/v1/piggy-banks', {params: {limit: 20}});
                this.piggies = res.data.data ?? [];
            } catch (e) {
                this.errors.piggies = e.message;
            } finally {
                this.loading.piggies = false;
            }
        },
    },
});
