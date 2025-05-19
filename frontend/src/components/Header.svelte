<script lang="ts">
  import { onMount } from 'svelte';
  import { getFormattedDate } from '../utils/dateUtils';
  import './Header.css';
  
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

  onMount(() => {
    updateDate();
    intervalId = window.setInterval(updateDate, 60000);
    // Fetch user info
    fetch('http://localhost:8000/api/me', {
      credentials: 'include'
    })
      .then(async (res) => {
        if (res.ok) {
          user = await res.json();
        } else {
          user = null;
        }
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
        <div class="date-display">
            <span id="current-date">
                <span class="day">{dayName}</span>, 
                <span class="date">{monthName} {dayOfMonth}, {year}</span>
            </span>
            <p>Sacramento and Davis Papers</p>
        </div>
        <div class="nyt-logo">
            <img src="/nyt-logo.png" alt="New York Times Logo">
        </div>
    </div>
    <hr>
    {#if loading}
    {:else if user}
      <div class="account-trigger">
        <span class="account-initial">{user.name ? user.name[0].toUpperCase() : (user.email ? user.email[0].toUpperCase() : '?')}</span>
        <span class="account-email">{user.email ?? ''}</span>
      </div>
      <button
        class="login-btn"
        on:click={() => window.location.href = 'http://localhost:8000/logout'}
      >LOG OUT</button>
    {:else}
      <button
        class="login-btn"
        on:click={() => window.location.href = 'http://localhost:8000/login'}
      >LOG IN</button>
    {/if}
</header> 