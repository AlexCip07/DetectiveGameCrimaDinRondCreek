<script lang="ts">
	import { onMount } from 'svelte';

	let currentTime = $state('21:37');

	function updateTime() {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		currentTime = `${hours}:${minutes}`;
	}

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	const apps = [
		{ name: 'Mesaje', icon: 'messages', color: 'from-green-400 to-green-600', badge: 3, href: '/phone/messages' },
		{ name: 'Telefon', icon: 'phone', color: 'from-green-500 to-green-700' },
		{ name: 'Cameră', icon: 'camera', color: 'from-gray-600 to-gray-800' },
		{ name: 'Poze', icon: 'photos', color: 'from-pink-400 via-yellow-400 to-blue-400', href: '/story' },
		{ name: 'Setări', icon: 'settings', color: 'from-gray-400 to-gray-600' },
		{ name: 'Muzică', icon: 'music', color: 'from-pink-500 to-red-600' },
		{ name: 'Notițe', icon: 'notes', color: 'from-yellow-400 to-yellow-600' },
		{ name: 'Calculator', icon: 'calculator', color: 'from-gray-700 to-black' },
	];

	const dockApps = [
		{ name: 'Safari', icon: 'safari', color: 'from-blue-400 to-blue-600' },
		{ name: 'Mail', icon: 'mail', color: 'from-blue-500 to-blue-700', badge: 12 },
		{ name: 'Maps', icon: 'maps', color: 'from-green-400 to-green-600' },
	];
</script>

<svelte:head>
	<title>Phone</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-inter min-h-screen flex justify-center items-center p-5" style="background: linear-gradient(to bottom right, #1f2937, #374151, #1f2937);">
	
	<!-- Phone Frame -->
	<div class="rounded-[55px] p-3 relative" style="background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5), 0 0 0 2px #2a2a2a, inset 0 0 0 1px rgba(255, 255, 255, 0.05);">
		
		<!-- Phone Screen -->
		<div class="w-[375px] h-[812px] rounded-[45px] overflow-hidden relative" style="background: linear-gradient(180deg, #1c1c1e 0%, #000000 100%);">
			
			<!-- Wallpaper -->
			<div class="absolute inset-0" style="background: radial-gradient(ellipse at 30% 20%, rgba(88, 86, 214, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255, 55, 95, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(50, 215, 75, 0.2) 0%, transparent 40%), linear-gradient(180deg, #1c1c1e 0%, #000000 100%);"></div>
			
			<!-- Status Bar -->
			<div class="relative z-10 flex justify-between items-center px-8 pt-4 text-white text-sm font-medium">
				<span class="text-[15px]">{currentTime}</span>
				
				<!-- Notch -->
				<div class="absolute left-1/2 -translate-x-1/2 top-0 w-[120px] h-[35px] rounded-b-3xl flex items-center justify-center gap-2 bg-black" style="box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);">
					<div class="w-2 h-2 rounded-full bg-gray-800 ring-1 ring-gray-700"></div>
					<div class="w-16 h-4 rounded-full bg-gray-900"></div>
				</div>
				
				<div class="flex items-center gap-1.5">
					<!-- Signal -->
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M2 17h2v4H2v-4zm4-5h2v9H6v-9zm4-4h2v13h-2V8zm4-4h2v17h-2V4zm4-2h2v19h-2V2z"/>
					</svg>
					<!-- WiFi -->
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 18 10.6 18.5 12 18.5s2.6-.5 3.5-1.4l1.4-1.4c-1.3-1.3-3.1-2.1-4.9-2.1s-3.6.8-4.9 2.1zM12 10c-3 0-5.7 1.2-7.7 3.2l1.4 1.4c1.6-1.6 3.8-2.6 6.3-2.6s4.7 1 6.3 2.6l1.4-1.4C17.7 11.2 15 10 12 10zm0-4c-4.1 0-7.9 1.6-10.8 4.3l1.4 1.4C5.2 9.2 8.4 8 12 8s6.8 1.2 9.4 3.7l1.4-1.4C19.9 7.6 16.1 6 12 6z"/>
					</svg>
					<!-- Battery -->
					<div class="flex items-center gap-0.5">
						<div class="w-6 h-3 border border-white rounded-sm flex items-center p-0.5">
							<div class="w-4 h-1.5 bg-green-500 rounded-sm"></div>
						</div>
						<div class="w-0.5 h-1.5 bg-white rounded-r-sm"></div>
					</div>
				</div>
			</div>

			<!-- Apps Grid -->
			<div class="relative z-10 px-6 pt-16">
				<div class="grid grid-cols-4 gap-5">
					{#each apps as app}
						{#if app.href}
							<a href={app.href} class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95">
								<div class="w-[60px] h-[60px] bg-gradient-to-b {app.color} rounded-[14px] flex items-center justify-center shadow-lg relative">
									{#if app.icon === 'messages'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
										</svg>
									{:else if app.icon === 'photos'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
										</svg>
									{/if}
									{#if app.badge}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{app.badge}</div>
									{/if}
								</div>
								<span class="text-white text-xs">{app.name}</span>
							</a>
						{:else}
							<button class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95">
								<div class="w-[60px] h-[60px] bg-gradient-to-b {app.color} rounded-[14px] flex items-center justify-center shadow-lg relative">
									{#if app.icon === 'phone'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
										</svg>
									{:else if app.icon === 'camera'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
										</svg>
									{:else if app.icon === 'settings'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
										</svg>
									{:else if app.icon === 'music'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
										</svg>
									{:else if app.icon === 'notes'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/>
										</svg>
									{:else if app.icon === 'calculator'}
										<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
											<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm4 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2zm-8 8H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2z"/>
										</svg>
									{/if}
									{#if app.badge}
										<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{app.badge}</div>
									{/if}
								</div>
								<span class="text-white text-xs">{app.name}</span>
							</button>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Dock -->
			<div class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
				<div class="flex items-center gap-4 px-5 py-3 bg-white/10 backdrop-blur-xl rounded-[28px] border border-white/10">
					{#each dockApps as app}
						<button class="relative transition-transform hover:scale-110 active:scale-95">
							<div class="w-[54px] h-[54px] bg-gradient-to-b {app.color} rounded-[12px] flex items-center justify-center shadow-lg">
								{#if app.icon === 'safari'}
									<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
									</svg>
								{:else if app.icon === 'mail'}
									<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
									</svg>
								{:else if app.icon === 'maps'}
									<svg class="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
										<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
									</svg>
								{/if}
							</div>
							{#if app.badge}
								<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{app.badge}</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Home Indicator -->
			<div class="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
				<div class="w-36 h-1 rounded-full bg-white/30"></div>
			</div>

		</div>
	</div>
</div>

<style>
	.font-inter {
		font-family: 'Inter', sans-serif;
	}
</style>
