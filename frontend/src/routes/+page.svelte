<script lang="ts">
  import { page } from '$app/stores';
  import Login from '../pages/Login.svelte';
</script>

{#if $page.url.pathname === '/login'}
  <Login />
{:else}
  <slot />
{/if} 