<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-tags"></i> Categories</h1>
            <button class="ff-btn ff-btn-primary" @click="showCreate = true">
                <i class="fa-solid fa-plus"></i> New category
            </button>
        </div>

        <NotificationBar :error="notif.error.value" :success="notif.success.value" @close="notif.clear()" />

        <div class="ff-card">
            <div v-if="store.loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
            <div v-else-if="store.error" class="view-error">{{ store.error }}</div>
            <table v-else class="ff-table">
                <thead>
                    <tr><th>Name</th><th>Created</th><th></th></tr>
                </thead>
                <tbody>
                    <tr v-for="cat in store.list" :key="cat.id">
                        <td>{{ cat.attributes?.name }}</td>
                        <td class="text-muted">{{ formatDate(cat.attributes?.created_at) }}</td>
                        <td class="actions-cell">
                            <button class="icon-btn" @click="confirmDelete(cat)">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                    <tr v-if="!store.list.length">
                        <td colspan="3" class="empty-row">No categories found.</td>
                    </tr>
                </tbody>
            </table>
            <PaginationBar
                :page="store.page"
                :total-pages="store.totalPages"
                :total="store.total"
                @prev="store.load(store.page - 1)"
                @next="store.load(store.page + 1)"
                @goto="store.load"
            />
        </div>

        <!-- Create modal -->
        <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
            <div class="modal-card ff-card">
                <h3>New category</h3>
                <input v-model="newName" class="ff-input" placeholder="Category name" @keydown.enter="createCategory" />
                <div class="modal-actions">
                    <button class="ff-btn ff-btn-secondary" @click="showCreate = false">Cancel</button>
                    <button class="ff-btn ff-btn-primary" :disabled="!newName.trim()" @click="createCategory">Create</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {useCategoriesStore} from '../stores/categories.js';
import {useNotifications} from '../composables/useNotifications.js';
import PaginationBar from '../components/ui/PaginationBar.vue';
import NotificationBar from '../components/ui/NotificationBar.vue';

const store = useCategoriesStore();
const notif = useNotifications();
const showCreate = ref(false);
const newName = ref('');

function formatDate(d) {
    return d ? new Date(d).toLocaleDateString() : '—';
}

async function confirmDelete(cat) {
    if (!confirm(`Delete category "${cat.attributes?.name}"?`)) return;
    await notif.wrap(() => store.destroy(cat.id));
    notif.showSuccess('Category deleted.');
}

async function createCategory() {
    if (!newName.value.trim()) return;
    await notif.wrap(() => store.store({name: newName.value.trim()}));
    newName.value = '';
    showCreate.value = false;
    notif.showSuccess('Category created.');
}

onMounted(() => store.load());
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.ff-table { width: 100%; border-collapse: collapse; font-size: 14px; }
.ff-table th { text-align: left; padding: 10px 12px; font-weight: 600; border-bottom: 2px solid var(--ff-border); color: var(--ff-text-muted); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; }
.ff-table td { padding: 10px 12px; border-bottom: 1px solid var(--ff-border); }
.ff-table tr:last-child td { border-bottom: none; }
.text-muted { color: var(--ff-text-muted); }
.empty-row { text-align: center; color: var(--ff-text-muted); padding: 32px !important; }
.actions-cell { text-align: right; }
.icon-btn { background: none; border: none; cursor: pointer; color: var(--ff-text-muted); padding: 4px 6px; border-radius: 4px; }
.icon-btn:hover { color: #ef4444; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-primary { background: var(--ff-sidebar-accent); color: #fff; }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }
.ff-input { width: 100%; padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-bg); color: var(--ff-text); font-size: 14px; outline: none; margin-bottom: 12px; }
.ff-input:focus { border-color: var(--ff-sidebar-accent); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { width: min(400px, 90vw); padding: 24px; }
.modal-card h3 { margin-bottom: 16px; font-size: 16px; font-weight: 600; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
</style>

