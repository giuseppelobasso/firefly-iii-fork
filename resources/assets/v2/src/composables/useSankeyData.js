/**
 * useSankeyData.js
 * Composable that fetches all transactions for a date range (paginated)
 * and builds Sankey flow data compatible with SankeyChart.vue.
 *
 * Ported from pages/dashboard/sankey.js (Alpine.js version).
 */
import {ref} from 'vue';
import {transactions as txApi} from '../api/client.js';

const LABELS = {
    allMoney: 'All money',
    category: 'Category',
    budget: 'Budget',
    unknownCategory: 'No category',
    unknownBudget: 'No budget',
    unknownAccount: 'Unknown account',
    expenseAccount: 'Expense',
    revenueAccount: 'Revenue',
    in: 'in',
    out: 'out',
};

function nodeName(type, name, direction, code) {
    if (type === 'category') {
        const cat = name ?? LABELS.unknownCategory;
        return `${cat} (${direction}, ${code})`;
    }
    if (type === 'account') {
        const acc = name ?? LABELS.unknownAccount;
        const prefix = direction === 'in' ? LABELS.revenueAccount : LABELS.expenseAccount;
        return `${prefix} "${acc}" (${direction}, ${code})`;
    }
    if (type === 'budget') {
        return `${name ?? LABELS.unknownBudget} (${code})`;
    }
    return name ?? '?';
}

function nodeLabel(type, name, code) {
    if (type === 'category') return name ?? LABELS.unknownCategory;
    if (type === 'account') return name ?? LABELS.unknownAccount;
    if (type === 'budget') return name ?? LABELS.unknownBudget;
    return name ?? '?';
}

function processWithdrawal(tx, code, amount, amounts, labels) {
    const budget = nodeName('budget', tx.budget_name, 'out', code);
    labels[budget] = nodeLabel('budget', tx.budget_name, code);
    const moneyNode = LABELS.allMoney;

    // flow 1: All money → Budget
    const k1 = `${moneyNode}-${budget}`;
    if (!amounts[k1]) amounts[k1] = {from: moneyNode, to: budget, flow: 0};
    amounts[k1].flow += amount;

    // flow 2: Budget → Category
    const category = nodeName('category', tx.category_name, 'out', code);
    labels[category] = nodeLabel('category', tx.category_name, code);
    const k2 = `${budget}-${category}`;
    if (!amounts[k2]) amounts[k2] = {from: budget, to: category, flow: 0};
    amounts[k2].flow += amount;

    // flow 3: Category → Expense account
    const expense = nodeName('account', tx.destination_name, 'out', code);
    labels[expense] = nodeLabel('account', tx.destination_name, code);
    const k3 = `${category}-${expense}`;
    if (!amounts[k3]) amounts[k3] = {from: category, to: expense, flow: 0};
    amounts[k3].flow += amount;
}

function processDeposit(tx, code, amount, amounts, labels) {
    const revenueAcc = nodeName('account', tx.source_name, 'in', code);
    labels[revenueAcc] = nodeLabel('account', tx.source_name, code);

    const category = nodeName('category', tx.category_name, 'in', code);
    labels[category] = nodeLabel('category', tx.category_name, code);

    const moneyNode = LABELS.allMoney;

    // flow 1: Revenue account → Category
    const k1 = `${revenueAcc}-${category}`;
    if (!amounts[k1]) amounts[k1] = {from: revenueAcc, to: category, flow: 0};
    amounts[k1].flow += amount;

    // flow 2: Category → All money
    const k2 = `${category}-${moneyNode}`;
    if (!amounts[k2]) amounts[k2] = {from: category, to: moneyNode, flow: 0};
    amounts[k2].flow += amount;
}

function parseTxGroups(groups) {
    const amounts = {};
    const labels = {};

    for (const group of groups) {
        for (const tx of (group.attributes?.transactions ?? [])) {
            const code = tx.currency_code;
            const amount = Math.abs(parseFloat(tx.amount ?? 0));
            if (!amount) continue;

            if (tx.type === 'withdrawal') processWithdrawal(tx, code, amount, amounts, labels);
            else if (tx.type === 'deposit') processDeposit(tx, code, amount, amounts, labels);
        }
    }

    // Remove flows where from === to (can cause sankey render errors)
    const flows = Object.values(amounts).filter((f) => f.from !== f.to && f.flow > 0);
    return {flows, labels};
}

export function useSankeyData() {
    const flows = ref([]);
    const labels = ref({});
    const loading = ref(false);
    const error = ref(null);

    async function load(start, end) {
        loading.value = true;
        error.value = null;
        flows.value = [];
        labels.value = {};

        try {
            let page = 1;
            const allGroups = [];

            while (true) {
                const res = await txApi.list({
                    type: 'withdrawal,deposit',
                    start,
                    end,
                    page,
                    limit: 100,
                });
                const data = res.data.data ?? [];
                allGroups.push(...data);

                const totalPages = res.data.meta?.pagination?.total_pages ?? 1;
                if (page >= totalPages) break;
                page++;
            }

            const result = parseTxGroups(allGroups);
            flows.value = result.flows;
            labels.value = result.labels;
        } catch (e) {
            error.value = e.response?.data?.message ?? e.message;
        } finally {
            loading.value = false;
        }
    }

    return {flows, labels, loading, error, load};
}
