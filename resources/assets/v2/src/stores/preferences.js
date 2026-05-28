import {defineStore} from 'pinia';
import axios from 'axios';
import store from 'store';
import observePlugin from 'store/plugins/observe';
import {getViewRange} from '../support/get-viewrange.js';

store.addPlugin(observePlugin);

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        viewRange: 'month',
        locale: 'en',
        language: 'en',
        darkMode: false,
        start: null,
        end: null,
        cacheValid: false,
        loaded: false,
    }),

    persist: {
        pick: ['viewRange', 'locale', 'language', 'darkMode'],
    },

    actions: {
        async load() {
            if (this.loaded) return;
            try {
                const [lastActivityRes, prefsRes] = await Promise.all([
                    axios.get('/api/v1/preferences/lastActivity'),
                    axios.get('/api/v1/preferences', {params: {names: 'viewRange,darkMode,locale,language'}}),
                ]);

                const serverActivity = lastActivityRes.data?.data?.attributes?.data;
                const localActivity = store.get('lastActivity');
                this.cacheValid = localActivity === serverActivity;
                store.set('lastActivity', serverActivity);
                store.set('cacheValid', this.cacheValid);

                const prefs = prefsRes.data?.data ?? [];
                prefs.forEach((pref) => {
                    const name = pref?.attributes?.name;
                    const value = pref?.attributes?.data;
                    if (name === 'viewRange') this.viewRange = value;
                    if (name === 'darkMode') this.darkMode = value;
                    if (name === 'locale') this.locale = value;
                    if (name === 'language') this.language = value;
                });
            } catch {
                // keep defaults on error
            }

            if (!this.start || !this.end) {
                const range = getViewRange(this.viewRange, new Date());
                this.start = range.start;
                this.end = range.end;
            }
            this.loaded = true;
        },

        setDateRange(start, end) {
            this.start = start;
            this.end = end;
        },

        shiftRange(direction) {
            const range = getViewRange(this.viewRange, new Date(this.start), direction);
            this.start = range.start;
            this.end = range.end;
        },
    },
});
