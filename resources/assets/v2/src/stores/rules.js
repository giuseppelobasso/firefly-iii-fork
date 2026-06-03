import { defineStore } from 'pinia';
import { rules as rulesApi, ruleGroups as ruleGroupsApi } from '../api/client.js';

export const useRulesStore = defineStore('rules', {
    state: () => ({
        list: [],
        groups: [],
        current: null,
        loading: false,
        error: null,
    }),
    actions: {
        async load(params = {}) {
            this.loading = true;
            try {
                const res = await rulesApi.list(params);
                this.list = res.data.data;
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },
        async loadGroups() {
            const res = await ruleGroupsApi.list();
            this.groups = res.data.data;
        },
        async show(id) {
            this.loading = true;
            try {
                const res = await rulesApi.show(id);
                this.current = res.data.data;
            } finally {
                this.loading = false;
            }
        },
        async store(data) {
            const res = await rulesApi.store(data);
            return res.data.data;
        },
        async update(id, data) {
            const res = await rulesApi.update(id, data);
            this.current = res.data.data;
            return res.data.data;
        },
        async destroy(id) {
            await rulesApi.destroy(id);
            this.list = this.list.filter((r) => r.id !== id);
        },
        async test(id) {
            const res = await rulesApi.test(id);
            return res.data.data;
        },
        async trigger(id) {
            await rulesApi.trigger(id);
        },
    },
});
