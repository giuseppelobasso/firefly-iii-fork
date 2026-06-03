<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title"><i class="fa-solid fa-plus"></i> New Tag</h1>
        </div>

        <FfCard title="New Tag" style="max-width: 480px">
            <form class="form" @submit.prevent="submit">
                <FfInput v-model="form.tag" label="Tag name" placeholder="e.g. vacation, home, work" :required="true" />
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
import { useTagsStore } from '../stores/tags.js';
import { useToast } from '../composables/useToast.js';
import FfCard from '../components/ui/FfCard.vue';
import FfInput from '../components/ui/FfInput.vue';
import FfButton from '../components/ui/FfButton.vue';

const router = useRouter();
const store = useTagsStore();
const toast = useToast();
const saving = ref(false);

const form = reactive({ tag: '' });

async function submit() {
    if (!form.tag.trim()) return;
    saving.value = true;
    try {
        await store.store({ tag: form.tag.trim() });
        toast.success('Tag created.');
        router.push('/tags');
    } catch (e) {
        toast.error(e.response?.data?.message ?? 'Failed to create tag.');
    } finally {
        saving.value = false;
    }
}
</script>

<style scoped>
.view-header { display: flex; align-items: center; margin-bottom: 20px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
.form { display: flex; flex-direction: column; gap: 16px; padding: 4px 0; }
.form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 4px; }
</style>
