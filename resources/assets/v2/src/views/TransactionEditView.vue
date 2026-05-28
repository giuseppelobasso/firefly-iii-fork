<template>
    <div class="view">
        <div class="view-header">
            <RouterLink :to="`/transactions/show/${route.params.id}`" class="back-link">
                <i class="fa-solid fa-arrow-left"></i> Back
            </RouterLink>
            <h1 class="view-title"><i class="fa-solid fa-pen"></i> Edit transaction</h1>
        </div>
        <TransactionForm :edit-id="route.params.id" />
    </div>
</template>

<script setup>
import {useRoute, RouterLink} from 'vue-router';
import TransactionForm from '../components/transaction/TransactionForm.vue';

const route = useRoute();
</script>

<style scoped>
.view-header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
.back-link { color: var(--ff-text-muted); text-decoration: none; font-size: 14px; display: inline-flex; align-items: center; gap: 6px; }
.back-link:hover { color: var(--ff-text); }
.view-title { font-size: 22px; font-weight: 600; display: flex; align-items: center; gap: 10px; }
</style>
