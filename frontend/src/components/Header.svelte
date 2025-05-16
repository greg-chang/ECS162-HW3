<script lang="ts">
  import { onMount } from 'svelte';
  import { getFormattedDate } from '../utils/dateUtils';
  import './Header.css';
  
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
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  });

  function handleLogin() {
    window.location.href = '/login';
  }
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
    <button class="login-btn" on:click={handleLogin}>LOG IN</button>
</header> 