<script lang="ts">
  let email = '';
  let password = '';
  let errorMessage = '';

  async function handleLogin(event: Event) {
    event.preventDefault();
    // Your login logic here
  }
</script>

<main>
  <form on:submit={handleLogin}>
    <!-- form fields here -->
  </form>
</main>
