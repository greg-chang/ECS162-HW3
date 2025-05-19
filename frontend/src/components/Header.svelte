<script lang="ts">
  import { onMount } from 'svelte';
  import { getFormattedDate } from '../utils/dateUtils';
  import '../app.css';
  
  let user: { email?: string; name?: string } | null = null;
  let loading = true;

  // Date formatting
  let currentDate: string = '';
  let dayName: string = '';
  let monthName: string = '';
  let dayOfMonth: string = '';
  let year: string = '';

  function updateDate() {
    const formattedDate = getFormattedDate();
    currentDate = formattedDate.currentDate;
    dayName = formattedDate.dayName;
    monthName = formattedDate.monthName;
    dayOfMonth = formattedDate.dayOfMonth;
    year = formattedDate.year;
  }

  let intervalId: number;

  let showAccountModal = false;

  onMount(() => {
    updateDate();
    intervalId = window.setInterval(updateDate, 60000);
    // Fetch user info
    fetch('http://localhost:8000/api/me', {
      credentials: 'include'
    })
      .then(async (res) => {
        user = res.ok ? await res.json() : null;
      })
      .catch(() => {
        user = null;
      })
      .finally(() => {
        loading = false;
      });
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });
</script>

<header>
  <div class="header-container">
    <div class="date-and-logo">
      <div class="date-display">
        <span class="day">{dayName}</span>, 
        <span class="date">{monthName} {dayOfMonth}, {year}</span>
        <p>Sacramento and Davis Papers</p>
      </div>
      <div class="nyt-logo">
        <img src="/nyt-logo.png" alt="New York Times Logo" />
      </div>
    </div>
    
    {#if loading}
    {:else if user}
      <div class="account-trigger" on:click={() => showAccountModal = true} tabindex="0">
        <span class="account-label">Account</span>
        <img src="/caret_down.png" alt="caret" class="caret-img" />
      </div>
    {:else}
      <button class="login-btn" on:click={() => window.location.href = 'http://localhost:8000/login'}>
        LOG IN
      </button>
    {/if}
  </div>

  <hr />

  {#if showAccountModal}
    <div class="account-modal-backdrop" on:click={() => showAccountModal = false}></div>
    <div class="account-modal">
      <div class="account-modal-header">
        <div class="account-modal-email">{user?.email}</div>
        <button class="close-btn" on:click={() => showAccountModal = false}>×</button>
      </div>
      <hr />
      <div class="account-modal-content">
        <div class="account-modal-greeting">Good afternoon.</div>
        <div class="logout-container">
          <button class="logout-btn" on:click={() => window.location.href = 'http://localhost:8000/logout'}>
            Log out
          </button>
        </div>
      </div>
    </div>
  {/if}
</header> 