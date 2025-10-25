<script lang="ts">
  import { enhance } from '$app/forms';
  import { goto } from '$app/navigation';
  import type { PageData, ActionData } from './$types';

  export let data: PageData;
  export let form: ActionData;

  let colors: any[] = data.colors;
  let newEngColor = '';
  let newSpColor = '';
  let editingColor: any | null = null;
  let editEng = '';
  let editSp = '';
  let message = '';

  // Handle form responses
  $: if (form?.success) {
    message = form.action === 'add' ? '✅ Color added successfully!' :
              form.action === 'update' ? '✅ Color updated successfully!' :
              form.action === 'delete' ? '✅ Color deleted successfully!' : '';
    if (form.success) {
      setTimeout(() => message = '', 3000);
      // Refresh data from server instead of full reload
      loadColors();
    }
  } else if (form?.error) {
    message = `❌ ${form.error}`;
    setTimeout(() => message = '', 3000);
  }

  async function loadColors() {
    try {
      await goto('/colors', { replaceState: true });
      message = '✅ Data refreshed successfully!';
      setTimeout(() => message = '', 2000);
    } catch (error) {
      console.error('Error refreshing colors:', error);
      message = '❌ Error refreshing data';
      setTimeout(() => message = '', 3000);
    }
  }

  function startEdit(color: any) {
    editingColor = color;
    editEng = color.ENG;
    editSp = color.SP;
  }

  function cancelEdit() {
    editingColor = null;
    editEng = '';
    editSp = '';
  }
</script>

<svelte:head>
  <title>Colors Database - ENG/SP</title>
</svelte:head>

<div class="container">
  <h1>🌈 Colors Database</h1>
  <p>SQLite table with English and Spanish color names</p>

  {#if message}
    <div class="message">{message}</div>
  {/if}

  <!-- Add new color form -->
  <div class="form-section">
    <h2>Add New Color</h2>
    <form method="POST" action="?/add" use:enhance>
      <div class="form-row">
        <input
          type="text"
          name="ENG"
          placeholder="English color name"
          bind:value={newEngColor}
          class="color-input"
          required
        />
        <input
          type="text"
          name="SP"
          placeholder="Spanish color name"
          bind:value={newSpColor}
          class="color-input"
          required
        />
        <button type="submit" class="btn-primary">Add Color</button>
      </div>
    </form>
  </div>

  <!-- Colors table -->
  <div class="table-section">
    <h2>Colors ({colors.length})</h2>
    {#if colors.length === 0}
      <p class="empty">No colors found. Add some colors above!</p>
    {:else}
      <table class="colors-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>English</th>
            <th>Spanish</th>
            <th>Created</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each colors as color (color.id)}
            <tr>
              <td>{color.id}</td>
              <td>
                {#if editingColor && editingColor.id === color.id}
                  <input type="text" name="ENG" bind:value={editEng} class="edit-input" required />
                {:else}
                  {color.ENG}
                {/if}
              </td>
              <td>
                {#if editingColor && editingColor.id === color.id}
                  <input type="text" name="SP" bind:value={editSp} class="edit-input" required />
                {:else}
                  {color.SP}
                {/if}
              </td>
              <td>{color.created_at ? new Date(color.created_at).toLocaleDateString() : 'N/A'}</td>
              <td>{color.updated_at ? new Date(color.updated_at).toLocaleDateString() : 'N/A'}</td>
              <td class="actions">
                {#if editingColor && editingColor.id === color.id}
                  <form method="POST" action="?/update" use:enhance class="inline-form">
                    <input type="hidden" name="id" value={color.id} />
                    <input type="text" name="ENG" bind:value={editEng} class="edit-input" required />
                    <input type="text" name="SP" bind:value={editSp} class="edit-input" required />
                    <button type="submit" class="btn-success">Save</button>
                    <button type="button" on:click={cancelEdit} class="btn-secondary">Cancel</button>
                  </form>
                {:else}
                  <button on:click={() => startEdit(color)} class="btn-primary">Edit</button>
                  <form method="POST" action="?/delete" use:enhance class="inline-form">
                    <input type="hidden" name="ENG" value={color.ENG} />
                    <button type="submit" class="btn-danger">Delete</button>
                  </form>
                {/if}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    {/if}
  </div>

  <!-- Database info -->
  <div class="info-section">
    <h3>Database Information</h3>
    <ul>
      <li><strong>Database:</strong> SQLite (database.sqlite)</li>
      <li><strong>Table:</strong> Colors</li>
      <li><strong>Columns:</strong> id (auto), ENG, SP, created_at, updated_at</li>
      <li><strong>Features:</strong> Auto-seeding with 20 sample colors on first run</li>
    </ul>
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  h1 {
    color: #333;
    text-align: center;
    margin-bottom: 10px;
  }

  h2 {
    color: #555;
    margin-top: 30px;
    margin-bottom: 15px;
  }

  h3 {
    color: #555;
    margin-bottom: 10px;
  }

  .message {
    padding: 10px 15px;
    margin: 15px 0;
    border-radius: 5px;
    font-weight: bold;
  }

  .form-section {
    background: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
  }

  .form-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .color-input {
    flex: 1;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
  }

  .edit-input {
    padding: 8px;
    border: 1px solid #007bff;
    border-radius: 4px;
    font-size: 14px;
    width: 100%;
  }

  .btn-primary, .btn-success, .btn-secondary, .btn-danger {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    transition: background-color 0.2s;
  }

  .btn-primary {
    background: #007bff;
    color: white;
  }

  .btn-primary:hover {
    background: #0056b3;
  }

  .btn-success {
    background: #28a745;
    color: white;
  }

  .btn-success:hover {
    background: #1e7e34;
  }

  .btn-secondary {
    background: #6c757d;
    color: white;
  }

  .btn-secondary:hover {
    background: #545b62;
  }

  .btn-danger {
    background: #dc3545;
    color: white;
  }

  .btn-danger:hover {
    background: #bd2130;
  }

  .table-section {
    margin-bottom: 30px;
  }

  .colors-table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    border-radius: 8px;
    overflow: hidden;
  }

  .colors-table th {
    background: #343a40;
    color: white;
    padding: 12px 8px;
    text-align: left;
    font-weight: bold;
  }

  .colors-table td {
    padding: 12px 8px;
    border-bottom: 1px solid #eee;
  }

  .colors-table tr:hover {
    background: #f8f9fa;
  }

  .actions {
    white-space: nowrap;
  }

  .actions button {
    margin-right: 5px;
    padding: 6px 10px;
    font-size: 12px;
  }

  .inline-form {
    display: inline-flex;
    gap: 5px;
    align-items: center;
  }

  .inline-form .edit-input {
    width: 80px;
    font-size: 12px;
  }

  .inline-form button {
    padding: 4px 8px;
    font-size: 11px;
  }

  .empty {
    text-align: center;
    padding: 40px;
    color: #666;
    font-style: italic;
  }

  .info-section {
    background: #e9ecef;
    padding: 20px;
    border-radius: 8px;
    margin-top: 30px;
  }

  .info-section ul {
    margin: 0;
    padding-left: 20px;
  }

  .info-section li {
    margin: 5px 0;
    color: #495057;
  }
</style>
