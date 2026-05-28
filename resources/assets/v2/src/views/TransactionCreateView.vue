<template>
    <div class="view">
        <div class="view-header">
            <h1 class="view-title">
                <i class="fa-solid fa-plus"></i>
                New {{ typeLabel }} transaction
            </h1>
        </div>
        <TransactionForm :initial-type="route.params.type ?? 'withdrawal'" />
    </div>
</template>

<script setup>
import {computed} from 'vue';
import {useRoute} from 'vue-router';
import TransactionForm from '../components/transaction/TransactionForm.vue';

const route = useRoute();

const TYPE_LABELS = {withdrawal: 'expense', deposit: 'income', transfer: 'transfer'};
const typeLabel = computed(() => TYPE_LABELS[route.params.type] ?? '');
</script>

<style scoped>
.view-header { margin-bottom: 24px; }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
</style>

