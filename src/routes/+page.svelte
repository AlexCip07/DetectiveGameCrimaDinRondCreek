<script lang="ts">
  import type { Color } from '$lib';

  interface PageData {
    colors: Color[];
    totalColors: number;
    recentColors: Color[];
  }

  export let data: PageData;

  let colors = data.colors;
  let totalColors = data.totalColors;
  let recentColors = data.recentColors;
</script>

<svelte:head>
  <title>Colors Database - ENG/SP</title>
</svelte:head>

<main class="container">
  <div class="hero">
    <h1>🌈 Colors Database</h1>
    <p class="subtitle">Manage your English-Spanish color translations</p>
  </div>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-number">{totalColors}</div>
      <div class="stat-label">Total Colors</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">2</div>
      <div class="stat-label">Languages</div>
    </div>
    <div class="stat-card">
      <div class="stat-number">ENG ↔ SP</div>
      <div class="stat-label">Translation</div>
    </div>
  </div>

  <div class="actions-grid">
    <a href="/colors" class="action-card primary">
      <div class="action-icon">🎨</div>
      <div class="action-title">Manage Colors</div>
      <div class="action-description">Add, edit, and delete color translations</div>
    </a>

    <div class="action-card">
      <div class="action-icon">📊</div>
      <div class="action-title">Database Info</div>
      <div class="action-description">SQLite database with 20 pre-loaded colors</div>
    </div>
  </div>

  {#if recentColors.length > 0}
    <div class="recent-section">
      <h2>Recently Added Colors</h2>
      <div class="recent-grid">
        {#each recentColors as color (color.id)}
          <div class="color-item">
            <div class="color-english">{color.ENG}</div>
            <div class="color-spanish">{color.SP}</div>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  <div class="features-section">
    <h2>Features</h2>
    <div class="features-grid">
      <div class="feature-item">
        <span class="feature-icon">✅</span>
        <span class="feature-text">Auto-seeding with sample data</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🔄</span>
        <span class="feature-text">Real-time updates</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">🛡️</span>
        <span class="feature-text">Form validation</span>
      </div>
      <div class="feature-item">
        <span class="feature-icon">📱</span>
        <span class="feature-text">Responsive design</span>
      </div>
    </div>
  </div>
</main>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  .hero {
    text-align: center;
    margin-bottom: 3rem;
    padding: 2rem 0;
  }

  .hero h1 {
    font-size: 3rem;
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #6c757d;
    margin: 0;
    font-weight: 400;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 35px rgba(102, 126, 234, 0.4);
  }

  .stat-number {
    font-size: 2.5rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .stat-label {
    font-size: 1rem;
    opacity: 0.9;
    font-weight: 500;
  }

  .actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .action-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .action-card:hover {
    border-color: #667eea;
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
  }

  .action-card.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-color: #667eea;
  }

  .action-card.primary:hover {
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  .action-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .action-title {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }

  .action-description {
    color: #6c757d;
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .action-card.primary .action-title {
    color: white;
  }

  .action-card.primary .action-description {
    color: rgba(255, 255, 255, 0.8);
  }

  .recent-section {
    margin-bottom: 3rem;
  }

  .recent-section h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
  }

  .recent-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }

  .color-item {
    background: white;
    padding: 1rem;
    border-radius: 10px;
    border: 1px solid #e9ecef;
    text-align: center;
    transition: all 0.2s ease;
  }

  .color-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  }

  .color-english {
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.25rem;
  }

  .color-spanish {
    color: #6c757d;
    font-size: 0.9rem;
  }

  .features-section {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 15px;
    margin-top: 3rem;
  }

  .features-section h2 {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.8rem;
    text-align: center;
  }

  .features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
  }

  .feature-icon {
    font-size: 1.2rem;
  }

  .feature-text {
    color: #495057;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    .container {
      padding: 1rem;
    }

    .hero h1 {
      font-size: 2rem;
    }

    .subtitle {
      font-size: 1rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .actions-grid {
      grid-template-columns: 1fr;
    }

    .recent-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }

    .features-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
