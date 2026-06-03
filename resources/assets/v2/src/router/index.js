import {createRouter, createWebHistory} from 'vue-router';
import {useAuthStore} from '../stores/auth.js';

const routes = [
    {
        path: '/',
        redirect: '/dashboard',
    },
    {
        path: '/dashboard',
        name: 'dashboard',
        component: () => import('../views/DashboardView.vue'),
        meta: {title: 'Dashboard'},
    },
    {
        path: '/accounts/:type',
        name: 'accounts',
        component: () => import('../views/AccountsView.vue'),
        meta: {title: 'Accounts'},
    },
    {
        path: '/transactions/:type',
        name: 'transactions',
        component: () => import('../views/TransactionsView.vue'),
        meta: {title: 'Transactions'},
    },
    {
        path: '/transactions/:type/create',
        name: 'transactions.create',
        component: () => import('../views/TransactionCreateView.vue'),
        meta: {title: 'Create transaction'},
    },
    {
        path: '/transactions/:type/edit/:id',
        name: 'transactions.edit',
        component: () => import('../views/TransactionEditView.vue'),
        meta: {title: 'Edit transaction'},
    },
    {
        path: '/transactions/show/:id',
        name: 'transactions.show',
        component: () => import('../views/TransactionShowView.vue'),
        meta: {title: 'Transaction'},
    },
    {
        path: '/budgets',
        name: 'budgets',
        component: () => import('../views/BudgetsView.vue'),
        meta: {title: 'Budgets'},
    },
    {
        path: '/categories',
        name: 'categories',
        component: () => import('../views/CategoriesView.vue'),
        meta: {title: 'Categories'},
    },
    {
        path: '/categories/create',
        name: 'categories.create',
        component: () => import('../views/CategoryCreateView.vue'),
        meta: {title: 'New Category'},
    },
    {
        path: '/categories/:id',
        name: 'categories.show',
        component: () => import('../views/CategoryShowView.vue'),
        meta: {title: 'Category'},
    },
    {
        path: '/categories/:id/edit',
        name: 'categories.edit',
        component: () => import('../views/CategoryEditView.vue'),
        meta: {title: 'Edit Category'},
    },
    {
        path: '/tags',
        name: 'tags',
        component: () => import('../views/TagsView.vue'),
        meta: {title: 'Tags'},
    },
    {
        path: '/tags/create',
        name: 'tags.create',
        component: () => import('../views/TagCreateView.vue'),
        meta: {title: 'New Tag'},
    },
    {
        path: '/tags/:id',
        name: 'tags.show',
        component: () => import('../views/TagShowView.vue'),
        meta: {title: 'Tag'},
    },
    {
        path: '/tags/:id/edit',
        name: 'tags.edit',
        component: () => import('../views/TagEditView.vue'),
        meta: {title: 'Edit Tag'},
    },
    {
        path: '/reports',
        name: 'reports',
        component: () => import('../views/ReportsView.vue'),
        meta: {title: 'Reports'},
    },
    {
        path: '/piggy-banks',
        name: 'piggy-banks',
        component: () => import('../views/PiggyBanksView.vue'),
        meta: {title: 'Piggy banks'},
    },
    {
        path: '/subscriptions',
        name: 'subscriptions',
        component: () => import('../views/SubscriptionsView.vue'),
        meta: {title: 'Subscriptions'},
    },
    {
        path: '/subscriptions/create',
        name: 'subscriptions.create',
        component: () => import('../views/SubscriptionCreateView.vue'),
        meta: {title: 'New Subscription'},
    },
    {
        path: '/subscriptions/:id',
        name: 'subscriptions.show',
        component: () => import('../views/SubscriptionShowView.vue'),
        meta: {title: 'Subscription'},
    },
    {
        path: '/subscriptions/:id/edit',
        name: 'subscriptions.edit',
        component: () => import('../views/SubscriptionEditView.vue'),
        meta: {title: 'Edit Subscription'},
    },
    {
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: {title: 'Profile'},
    },
    { path: '/rules', name: 'rules', component: () => import('../views/RulesView.vue'), meta: { title: 'Rules' } },
    { path: '/rules/create', name: 'rules.create', component: () => import('../views/RuleCreateView.vue'), meta: { title: 'New Rule' } },
    { path: '/rules/:id', name: 'rules.show', component: () => import('../views/RuleShowView.vue'), meta: { title: 'Rule' } },
    { path: '/rules/:id/edit', name: 'rules.edit', component: () => import('../views/RuleEditView.vue'), meta: { title: 'Edit Rule' } },
    { path: '/recurring', name: 'recurring', component: () => import('../views/RecurringView.vue'), meta: { title: 'Recurring Transactions' } },
    { path: '/recurring/create', name: 'recurring.create', component: () => import('../views/RecurringCreateView.vue'), meta: { title: 'New Recurring Transaction' } },
    { path: '/recurring/:id', name: 'recurring.show', component: () => import('../views/RecurringShowView.vue'), meta: { title: 'Recurring Transaction' } },
    { path: '/recurring/:id/edit', name: 'recurring.edit', component: () => import('../views/RecurringEditView.vue'), meta: { title: 'Edit Recurring Transaction' } },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: () => import('../views/NotFoundView.vue'),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior: () => ({top: 0}),
});

router.beforeEach(async (to) => {
    const auth = useAuthStore();
    if (!auth.user) {
        await auth.fetchUser();
    }
    if (!auth.isAuthenticated) {
        window.location.href = '/login';
        return false;
    }
    document.title = to.meta.title ? `${to.meta.title} — Firefly III` : 'Firefly III';
});

export default router;
