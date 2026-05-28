<template>
    <div class="placeholder-view" style="min-height:60vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; text-align:center;">
        <i class="fa-solid fa-circle-exclamation" style="font-size:48px; opacity:0.3;"></i>
        <h2 style="margin:0; font-size:22px;">404 — Page not found</h2>
        <RouterLink to="/dashboard" style="color:var(--ff-sidebar-accent); text-decoration:none; font-size:14px;">
            Go to dashboard
        </RouterLink>
    </div>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>
