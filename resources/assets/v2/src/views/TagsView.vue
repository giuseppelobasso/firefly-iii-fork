<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-tag"></i> Tags</h1>
            <button class="ff-btn ff-btn-primary" @click="showCreate = true">
                <i class="fa-solid fa-plus"></i> New tag
            </button>
        </div>

        <NotificationBar :error="notif.error.value" :success="notif.success.value" @close="notif.clear()" />

        <div v-if="loading" class="view-loading"><i class="fa-solid fa-spinner fa-spin"></i> Loading…</div>
        <div v-else-if="error" class="view-error">{{ error }}</div>

        <div v-else class="tags-wrap">
            <span
                v-for="tag in tagList"
                :key="tag.id"
                class="tag-chip"
            >
                {{ tag.attributes?.tag }}
                <span class="tag-count">{{ tag.attributes?.transaction_count ?? '' }}</span>
                <button class="tag-remove" @click="confirmDelete(tag)" title="Delete tag">×</button>
            </span>
            <div v-if="!tagList.length" class="view-empty">No tags found.</div>
        </div>

        <!-- Create modal -->
        <div v-if="showCreate" class="modal-overlay" @click.self="showCreate = false">
            <div class="modal-card ff-card">
                <h3>New tag</h3>
                <input v-model="newTag" class="ff-input" placeholder="Tag name" @keydown.enter="createTag" />
                <div class="modal-actions">
                    <button class="ff-btn ff-btn-secondary" @click="showCreate = false">Cancel</button>
                    <button class="ff-btn ff-btn-primary" :disabled="!newTag.trim()" @click="createTag">Create</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import {ref, onMounted} from 'vue';
import {tags as api} from '../api/client.js';
import {useNotifications} from '../composables/useNotifications.js';
import NotificationBar from '../components/ui/NotificationBar.vue';

const tagList = ref([]);
const loading = ref(false);
const error = ref(null);
const showCreate = ref(false);
const newTag = ref('');
const notif = useNotifications();

async function confirmDelete(tag) {
    if (!confirm(`Delete tag "${tag.attributes?.tag}"?`)) return;
    await notif.wrap(async () => {
        await api.destroy(tag.id);
        tagList.value = tagList.value.filter((t) => t.id !== tag.id);
    });
    notif.showSuccess('Tag deleted.');
}

async function createTag() {
    if (!newTag.value.trim()) return;
    await notif.wrap(async () => {
        const res = await api.store({tag: newTag.value.trim()});
        tagList.value.push(res.data.data);
    });
    newTag.value = '';
    showCreate.value = false;
    notif.showSuccess('Tag created.');
}

onMounted(async () => {
    loading.value = true;
    try {
        const res = await api.list({limit: 200});
        tagList.value = res.data.data ?? [];
    } catch (e) {
        error.value = e.response?.data?.message ?? e.message;
    } finally {
        loading.value = false;
    }
});
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading, .view-error { padding: 32px; text-align: center; color: var(--ff-text-muted); }
.view-error { color: #ef4444; }
.view-empty { color: var(--ff-text-muted); font-size: 14px; }
.tags-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
.tag-chip { display: inline-flex; align-items: center; gap: 6px; background: var(--ff-card); border: 1px solid var(--ff-border); border-radius: 99px; padding: 5px 14px; font-size: 13.5px; }
.tag-count { background: var(--ff-border); border-radius: 99px; padding: 1px 7px; font-size: 11px; color: var(--ff-text-muted); }
.tag-remove { background: none; border: none; cursor: pointer; color: var(--ff-text-muted); font-size: 16px; line-height: 1; padding: 0; }
.tag-remove:hover { color: #ef4444; }
.ff-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 8px; font-size: 13.5px; font-weight: 500; cursor: pointer; border: none; text-decoration: none; transition: filter .15s; }
.ff-btn:hover { filter: brightness(1.1); }
.ff-btn-primary { background: var(--ff-sidebar-accent); color: #fff; }
.ff-btn-secondary { background: var(--ff-border); color: var(--ff-text); }
.ff-btn:disabled { opacity: .5; cursor: default; filter: none; }
.ff-card { background: var(--ff-card); border-radius: 12px; padding: 20px; border: 1px solid var(--ff-border); }
.ff-input { width: 100%; padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-bg); color: var(--ff-text); font-size: 14px; outline: none; margin-bottom: 12px; }
.ff-input:focus { border-color: var(--ff-sidebar-accent); }
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-card { width: min(400px, 90vw); padding: 24px; }
.modal-card h3 { margin-bottom: 16px; font-size: 16px; font-weight: 600; }
.modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
</style>

