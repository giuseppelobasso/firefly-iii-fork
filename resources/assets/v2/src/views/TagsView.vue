<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-tag"></i> Tags</h1>
            <FfButton icon="fa-solid fa-plus" @click="router.push('/tags/create')">New tag</FfButton>
        </div>

        <div v-if="store.loading" class="view-loading">
            <FfEmptyState icon="fa-solid fa-spinner fa-spin" title="Loading…" />
        </div>
        <FfEmptyState
            v-else-if="!store.list.length"
            icon="fa-solid fa-tag"
            title="No tags"
            message="Create tags to organize your transactions."
        />
        <div v-else class="tags-cloud">
            <span
                v-for="tag in store.list"
                :key="tag.id"
                class="tag-pill"
                @click="router.push(`/tags/${tag.id}`)"
            >
                {{ tag.attributes?.tag }}
            </span>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTagsStore } from '../stores/tags.js';
import FfButton from '../components/ui/FfButton.vue';
import FfEmptyState from '../components/ui/FfEmptyState.vue';

const router = useRouter();
const store = useTagsStore();

onMounted(() => store.load());
</script>

<style scoped>
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.view-loading { display: flex; justify-content: center; padding: 48px; }
.tags-cloud { display: flex; flex-wrap: wrap; gap: 10px; }
.tag-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 9999px;
    background: var(--ff-surface-2);
    border: 1px solid var(--ff-border);
    font-size: 13px;
    cursor: pointer;
    color: var(--ff-text);
    transition: background .15s, border-color .15s;
}
.tag-pill:hover {
    background: var(--ff-surface-1);
    border-color: var(--ff-primary-700);
}
</style>

