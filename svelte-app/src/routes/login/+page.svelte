<script lang="ts">
	let isLogin = true;
	let username = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let success = '';
	let loading = false;

	function toggleMode() {
		isLogin = !isLogin;
		error = '';
		success = '';
		password = '';
		confirmPassword = '';
	}

	async function handleSubmit() {
		error = '';
		success = '';

		if (!username.trim() || !password.trim()) {
			error = 'Completează toate câmpurile!';
			return;
		}

		if (!isLogin && password !== confirmPassword) {
			error = 'Parolele nu coincid!';
			return;
		}

		if (!isLogin && password.length < 4) {
			error = 'Parola trebuie să aibă minim 4 caractere!';
			return;
		}

		loading = true;

		try {
			const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: username.trim(), password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || 'A apărut o eroare!';
			} else {
				if (isLogin) {
					success = 'Autentificare reușită! Redirecționare...';
					setTimeout(() => {
						window.location.href = '/';
					}, 1500);
				} else {
					success = 'Cont creat cu succes!';
					setTimeout(() => {
						isLogin = true;
						success = '';
						password = '';
					}, 2000);
				}
			}
		} catch (err) {
			error = 'Eroare de conexiune!';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>{isLogin ? 'Autentificare' : 'Creare Cont'}</title>
</svelte:head>

<div class="min-h-screen flex justify-center items-center p-5 bg-bg-primary" style="background-image: radial-gradient(ellipse at 20% 20%, rgba(255, 107, 74, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(138, 107, 255, 0.06) 0%, transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #0d0d14 100%);">
	
	<div class="w-full max-w-md">
		<!-- Logo/Header -->
		<div class="text-center mb-8">
			<div class="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white text-3xl font-bold" style="background: linear-gradient(135deg, #ff6b4a 0%, #ff8a6b 100%); box-shadow: 0 10px 40px rgba(255,107,74,0.3);">
				RO
			</div>
			<h1 class="text-3xl font-semibold text-text-primary mb-2">
				{isLogin ? 'Bine ai revenit!' : 'Creează un cont'}
			</h1>
			<p class="text-text-secondary">
				{isLogin ? 'Autentifică-te pentru a continua' : 'Completează datele pentru înregistrare'}
			</p>
		</div>

		<!-- Form Card -->
		<div class="bg-bg-secondary rounded-3xl border border-border-custom p-8" style="box-shadow: 0 25px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);">
			
			<form on:submit|preventDefault={handleSubmit} class="space-y-5">
				
				<!-- Username -->
				<div>
					<label for="username" class="block text-sm font-medium text-text-secondary mb-2">
						Nume utilizator
					</label>
					<input
						type="text"
						id="username"
						bind:value={username}
						placeholder="Introdu username"
						class="w-full px-4 py-3.5 bg-bg-tertiary border border-border-custom rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors duration-200"
						autocomplete="username"
					/>
				</div>

				<!-- Password -->
				<div>
					<label for="password" class="block text-sm font-medium text-text-secondary mb-2">
						Parolă
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						placeholder="Introdu parola"
						class="w-full px-4 py-3.5 bg-bg-tertiary border border-border-custom rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors duration-200"
						autocomplete={isLogin ? 'current-password' : 'new-password'}
					/>
				</div>

				<!-- Confirm Password (only for register) -->
				{#if !isLogin}
					<div>
						<label for="confirmPassword" class="block text-sm font-medium text-text-secondary mb-2">
							Confirmă parola
						</label>
						<input
							type="password"
							id="confirmPassword"
							bind:value={confirmPassword}
							placeholder="Repetă parola"
							class="w-full px-4 py-3.5 bg-bg-tertiary border border-border-custom rounded-xl text-text-primary placeholder-text-secondary/50 focus:outline-none focus:border-accent transition-colors duration-200"
							autocomplete="new-password"
						/>
					</div>
				{/if}

				<!-- Error Message -->
				{#if error}
					<div class="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
						<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
						</svg>
						{error}
					</div>
				{/if}

				<!-- Success Message -->
				{#if success}
					<div class="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-center gap-2">
						<svg class="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
							<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
						</svg>
						{success}
					</div>
				{/if}

				<!-- Submit Button -->
				<button
					type="submit"
					disabled={loading}
					class="w-full py-4 rounded-xl text-white font-semibold text-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
					style="background: linear-gradient(135deg, #ff6b4a 0%, #ff8a6b 100%); box-shadow: 0 4px 20px rgba(255,107,74,0.3);"
				>
					{#if loading}
						<svg class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
							<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
							<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
						</svg>
						Se procesează...
					{:else}
						{isLogin ? 'Autentificare' : 'Creează cont'}
					{/if}
				</button>
			</form>

			<!-- Toggle Login/Register -->
			<div class="mt-6 text-center">
				<p class="text-text-secondary text-sm">
					{isLogin ? 'Nu ai un cont?' : 'Ai deja un cont?'}
					<button
						type="button"
						on:click={toggleMode}
						class="text-accent hover:text-accent-hover font-medium ml-1 transition-colors"
					>
						{isLogin ? 'Creează unul' : 'Autentifică-te'}
					</button>
				</p>
			</div>
		</div>

		<!-- Back to Home -->
		<div class="mt-6 text-center">
			<a href="/" class="text-text-secondary hover:text-text-primary text-sm transition-colors inline-flex items-center gap-2">
				<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
				</svg>
				Înapoi la pagina principală
			</a>
		</div>
	</div>
</div>
