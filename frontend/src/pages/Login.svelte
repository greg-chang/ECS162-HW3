<script lang="ts">
  import { onMount } from 'svelte';
  import '../app.css';

  let email = '';
  let password = '';
  let errorMessage = '';

  async function handleLogin(event: Event) {
    event.preventDefault();
    try {
      // TODO: Implement actual login logic with Dex
      console.log('Login attempt with:', { email, password });
    } catch (error) {
      errorMessage = 'Login failed. Please try again.';
    }
  }
</script>

<main>
  <div class="login-container">
    <h1>Login</h1>
    <form on:submit={handleLogin}>
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          bind:value={email} 
          required 
          placeholder="Enter your email"
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          bind:value={password} 
          required 
          placeholder="Enter your password"
        />
      </div>

      {#if errorMessage}
        <div class="error">{errorMessage}</div>
      {/if}

      <button type="submit">Login</button>
    </form>
  </div>
</main>

<style>
  .login-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
  }

  input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 1rem;
  }

  button {
    width: 100%;
    padding: 0.75rem;
    background-color: #000;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    margin-top: 1rem;
  }

  button:hover {
    background-color: #333;
  }

  .error {
    color: #dc3545;
    margin: 1rem 0;
    text-align: center;
  }
</style> 