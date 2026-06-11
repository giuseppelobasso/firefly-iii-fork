/**
 * Unified API client for Firefly III v1 API.
 * All requests use axios with Laravel session cookies + CSRF.
 */
import axios from 'axios';

const http = axios.create({
    baseURL: '/api/v1',
    withCredentials: true,
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/vnd.api+json',
    },
});

// Inject CSRF token on every mutating request
http.interceptors.request.use((config) => {
    const meta = document.querySelector('meta[name="csrf-token"]');
    if (meta) {
        config.headers['X-CSRF-TOKEN'] = meta.getAttribute('content');
    }
    return config;
});

// Redirect to login on 401
http.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401) {
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// ─── Summary ────────────────────────────────────────────────────────────────
export const summary = {
    basic: (start, end) => http.get('/summary/basic', {params: {start, end}}),
};

// ─── Accounts ───────────────────────────────────────────────────────────────
export const accounts = {
    list: (params = {}) => http.get('/accounts', {params}),
    show: (id) => http.get(`/accounts/${id}`),
    store: (data) => http.post('/accounts', data),
    update: (id, data) => http.put(`/accounts/${id}`, data),
    destroy: (id) => http.delete(`/accounts/${id}`),
    transactions: (id, params = {}) => http.get(`/accounts/${id}/transactions`, {params}),
    piggyBanks: (id) => http.get(`/accounts/${id}/piggy-banks`),
    attachments: (id) => http.get(`/accounts/${id}/attachments`),
};

// ─── Transactions ────────────────────────────────────────────────────────────
export const transactions = {
    list: (params = {}) => http.get('/transactions', {params}),
    show: (id) => http.get(`/transactions/${id}`),
    store: (data) => http.post('/transactions', data),
    update: (id, data) => http.put(`/transactions/${id}`, data),
    destroy: (id) => http.delete(`/transactions/${id}`),
    attachments: (id) => http.get(`/transactions/${id}/attachments`),
    piggyBankEvents: (id) => http.get(`/transactions/${id}/piggy-bank-events`),
    search: (params = {}) => http.get('/search/transactions', {params}),
    bulkUpdate: (data) => http.post('/data/bulk/transactions', data),
};

// ─── Budgets ─────────────────────────────────────────────────────────────────
export const budgets = {
    list: (params = {}) => http.get('/budgets', {params}),
    show: (id) => http.get(`/budgets/${id}`),
    store: (data) => http.post('/budgets', data),
    update: (id, data) => http.put(`/budgets/${id}`, data),
    destroy: (id) => http.delete(`/budgets/${id}`),
    transactions: (id, params = {}) => http.get(`/budgets/${id}/transactions`, {params}),
    withoutBudget: (params = {}) => http.get('/budgets/transactions-without-budget', {params}),
    // Budget limits
    limits: {
        list: (budgetId, params = {}) => http.get(`/budgets/${budgetId}/limits`, {params}),
        store: (budgetId, data) => http.post(`/budgets/${budgetId}/limits`, data),
        show: (budgetId, id) => http.get(`/budgets/${budgetId}/limits/${id}`),
        update: (budgetId, id, data) => http.put(`/budgets/${budgetId}/limits/${id}`, data),
        destroy: (budgetId, id) => http.delete(`/budgets/${budgetId}/limits/${id}`),
    },
    available: (params = {}) => http.get('/available-budgets', {params}),
};

// ─── Categories ──────────────────────────────────────────────────────────────
export const categories = {
    list: (params = {}) => http.get('/categories', {params}),
    show: (id) => http.get(`/categories/${id}`),
    store: (data) => http.post('/categories', data),
    update: (id, data) => http.put(`/categories/${id}`, data),
    destroy: (id) => http.delete(`/categories/${id}`),
    transactions: (id, params = {}) => http.get(`/categories/${id}/transactions`, {params}),
};

// ─── Tags ────────────────────────────────────────────────────────────────────
export const tags = {
    list: (params = {}) => http.get('/tags', {params}),
    show: (id) => http.get(`/tags/${id}`),
    store: (data) => http.post('/tags', data),
    update: (id, data) => http.put(`/tags/${id}`, data),
    destroy: (id) => http.delete(`/tags/${id}`),
    transactions: (id, params = {}) => http.get(`/tags/${id}/transactions`, {params}),
};

// ─── Piggy Banks ──────────────────────────────────────────────────────────────
export const piggyBanks = {
    list: (params = {}) => http.get('/piggy-banks', {params}),
    show: (id) => http.get(`/piggy-banks/${id}`),
    store: (data) => http.post('/piggy-banks', data),
    update: (id, data) => http.put(`/piggy-banks/${id}`, data),
    destroy: (id) => http.delete(`/piggy-banks/${id}`),
    events: (id) => http.get(`/piggy-banks/${id}/events`),
    accounts: (id) => http.get(`/piggy-banks/${id}/accounts`),
};

// ─── Bills / Subscriptions ────────────────────────────────────────────────────
export const bills = {
    list: (params = {}) => http.get('/bills', {params}),
    show: (id) => http.get(`/bills/${id}`),
    store: (data) => http.post('/bills', data),
    update: (id, data) => http.put(`/bills/${id}`, data),
    destroy: (id) => http.delete(`/bills/${id}`),
    transactions: (id, params = {}) => http.get(`/bills/${id}/transactions`, {params}),
};

// ─── Currencies ───────────────────────────────────────────────────────────────
export const currencies = {
    list: (params = {}) => http.get('/currencies', {params}),
    show: (code) => http.get(`/currencies/${code}`),
    primary: () => http.get('/currencies/primary'),
    update: (code, data) => http.put(`/currencies/${code}`, data),
    enable: (code) => http.post(`/currencies/${code}/enable`),
    disable: (code) => http.post(`/currencies/${code}/disable`),
    makePrimary: (code) => http.post(`/currencies/${code}/primary`),
    accounts: (code, params = {}) => http.get(`/currencies/${code}/accounts`, {params}),
    transactions: (code, params = {}) => http.get(`/currencies/${code}/transactions`, {params}),
};

// ─── Preferences ──────────────────────────────────────────────────────────────
export const preferences = {
    list: (params = {}) => http.get('/preferences', {params}),
    show: (name) => http.get(`/preferences/${name}`),
    store: (data) => http.post('/preferences', data),
    update: (name, data) => http.put(`/preferences/${name}`, data),
};

// ─── About / User ─────────────────────────────────────────────────────────────
export const about = {
    app: () => http.get('/about'),
    user: () => http.get('/about/user'),
};

// ─── Search ───────────────────────────────────────────────────────────────────
export const search = {
    transactions: (params = {}) => http.get('/search/transactions', {params}),
    accounts: (params = {}) => http.get('/search/accounts', {params}),
};

// ─── Autocomplete ─────────────────────────────────────────────────────────────
export const autocomplete = {
    accounts: (query, params = {}) => http.get('/autocomplete/accounts', {params: {query, ...params}}),
    budgets: (query) => http.get('/autocomplete/budgets', {params: {query}}),
    categories: (query) => http.get('/autocomplete/categories', {params: {query}}),
    tags: (query) => http.get('/autocomplete/tags', {params: {query}}),
    bills: (query) => http.get('/autocomplete/bills', {params: {query}}),
    piggyBanks: (query) => http.get('/autocomplete/piggy-banks', {params: {query}}),
    piggyBanksWithBalance: (query) => http.get('/autocomplete/piggy-banks-with-balance', {params: {query}}),
};

// ─── Charts ───────────────────────────────────────────────────────────────────
export const charts = {
    accountOverview: (params = {}) => http.get('/chart/account/overview', {params}),
    accountDashboard: (params = {}) => http.get('/chart/account/overview', {params}),
    budgetOverview: (params = {}) => http.get('/chart/budget/overview', {params}),
    categoryOverview: (params = {}) => http.get('/chart/category/overview', {params}),
    balance: (params = {}) => http.get('/chart/balance/balance', {params}),
};

// ─── Insight ──────────────────────────────────────────────────────────────────
export const insight = {
    expense: {
        total: (params = {}) => http.get('/insight/expense/total', {params}),
        byBudget: (params = {}) => http.get('/insight/expense/budget', {params}),
        noBudget: (params = {}) => http.get('/insight/expense/no-budget', {params}),
        byCategory: (params = {}) => http.get('/insight/expense/category', {params}),
        noCategory: (params = {}) => http.get('/insight/expense/no-category', {params}),
        byTag: (params = {}) => http.get('/insight/expense/tag', {params}),
        noTag: (params = {}) => http.get('/insight/expense/no-tag', {params}),
        byBill: (params = {}) => http.get('/insight/expense/bill', {params}),
        noBill: (params = {}) => http.get('/insight/expense/no-bill', {params}),
        byAsset: (params = {}) => http.get('/insight/expense/asset', {params}),
        byExpenseAccount: (params = {}) => http.get('/insight/expense/expense', {params}),
    },
    income: {
        total: (params = {}) => http.get('/insight/income/total', {params}),
        byCategory: (params = {}) => http.get('/insight/income/category', {params}),
        noCategory: (params = {}) => http.get('/insight/income/no-category', {params}),
        byTag: (params = {}) => http.get('/insight/income/tag', {params}),
        noTag: (params = {}) => http.get('/insight/income/no-tag', {params}),
        byAsset: (params = {}) => http.get('/insight/income/asset', {params}),
        byRevenue: (params = {}) => http.get('/insight/income/revenue', {params}),
    },
    transfer: {
        total: (params = {}) => http.get('/insight/transfer/total', {params}),
        byCategory: (params = {}) => http.get('/insight/transfer/category', {params}),
        noCategory: (params = {}) => http.get('/insight/transfer/no-category', {params}),
        byTag: (params = {}) => http.get('/insight/transfer/tag', {params}),
        noTag: (params = {}) => http.get('/insight/transfer/no-tag', {params}),
        byAsset: (params = {}) => http.get('/insight/transfer/asset', {params}),
    },
};

// ─── Rules ───────────────────────────────────────────────────────────────────
export const rules = {
    list: (params = {}) => http.get('/rules', { params }),
    show: (id) => http.get(`/rules/${id}`),
    store: (data) => http.post('/rules', data),
    update: (id, data) => http.put(`/rules/${id}`, data),
    destroy: (id) => http.delete(`/rules/${id}`),
    test: (id, params = {}) => http.get(`/rules/${id}/test`, { params }),
    trigger: (id) => http.post(`/rules/${id}/trigger`),
};

// ─── Rule Groups ──────────────────────────────────────────────────────────────
export const ruleGroups = {
    list: (params = {}) => http.get('/rule-groups', { params }),
    show: (id) => http.get(`/rule-groups/${id}`),
    store: (data) => http.post('/rule-groups', data),
    update: (id, data) => http.put(`/rule-groups/${id}`, data),
    destroy: (id) => http.delete(`/rule-groups/${id}`),
    rules: (id, params = {}) => http.get(`/rule-groups/${id}/rules`, { params }),
    trigger: (id) => http.post(`/rule-groups/${id}/trigger`),
};

// ─── Recurring Transactions ───────────────────────────────────────────────────
export const recurring = {
    list: (params = {}) => http.get('/recurrences', { params }),
    show: (id) => http.get(`/recurrences/${id}`),
    store: (data) => http.post('/recurrences', data),
    update: (id, data) => http.put(`/recurrences/${id}`, data),
    destroy: (id) => http.delete(`/recurrences/${id}`),
    transactions: (id, params = {}) => http.get(`/recurrences/${id}/transactions`, { params }),
};

export default {
    summary, accounts, transactions, budgets, categories, tags,
    piggyBanks, bills, currencies, preferences, about, search,
    autocomplete, charts, insight, rules, ruleGroups, recurring,
};
