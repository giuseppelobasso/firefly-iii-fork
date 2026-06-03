<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-plus"></i> New Category</h1>
        </div>

        <FfCard title="New Category" style="max-width: 560px">
            <form class="form" @submit.prevent="submit">
                <FfInput v-model="form.name" label="Name" placeholder="Category name" :required="true" />
                <div class="form-field">
                    <label class="form-label">Notes</label>
                    <textarea v-model="form.notes" class="form-textarea" rows="3" placeholder="Optional notes…" />
                </div>
                <div class="form-actions">
                    <FfButton variant="ghost" type="button" @click="router.back()">Cancel</FfButton>
                    <FfButton variant="primary" type="submit" :loading="saving">Create</FfButton>
                </div>
            </form>
        </FfCard>
    </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoriesStore } from '../stores/categories.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfInput from '../components/ui/FfInput.vue';
import FfButton from '../components/ui/FfButton.vue';

const router = useRouter();
const store = useCategoriesStore();
const toast = useToast();
const saving = ref(false);

const form = reactive({ name: '', notes: '' });

async function submit() {
    if (!form.name.trim()) return;
    saving.value = true;
    try {
        await store.store({ name: form.name.trim(), notes: form.notes });
        toast.success('Category created.');
        router.push('/categories');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to create category.');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.form { display: flex; flex-direction: column; gap: 16px; padding: 4px 0; }
.form-field { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 13px; font-weight: 500; color: var(--ff-text-muted); }
.form-textarea { padding: 8px 12px; border: 1px solid var(--ff-border); border-radius: 8px; background: var(--ff-surface-1); color: var(--ff-text); font-size: 14px; resize: vertical; outline: none; font-family: inherit; }
.form-textarea:focus { border-color: var(--ff-primary-700); }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; }
</style>
