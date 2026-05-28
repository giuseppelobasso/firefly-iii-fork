import {defineStore} from 'pinia';
import axios from 'axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: false,
    }),

    getters: {
        isAuthenticated: (state) => state.user !== null,
    },

    actions: {
        async fetchUser() {
            this.loading = true;
            try {
                const res = await axios.get('/api/v1/about/user');
                this.user = res.data.data;
            } catch {
                this.user = null;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.user = null;
            window.location.href = '/logout';
        },
    },
});
