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
        path: '/tags',
        name: 'tags',
        component: () => import('../views/TagsView.vue'),
        meta: {title: 'Tags'},
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
        path: '/profile',
        name: 'profile',
        component: () => import('../views/ProfileView.vue'),
        meta: {title: 'Profile'},
    },
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
