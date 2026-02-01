<script lang="ts">
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import { handlePhotoActionsOnLoad, markActionComplete, type PhotoAction } from '$lib/photoActionChecker';

	let { data } = $props();
	
	// State pentru photo actions pending
	let pendingPhotoActions = $state<PhotoAction[]>([]);
	let showPhotoActionModal = $state(false);
	let lastPhotoActionsCheck = $state(0); // timestamp pentru a evita verificări duplicate

	let currentTime = $state('21:37');
	let currentView = $state<'home' | 'messages-list' | 'messages-chat'>('home');
	let currentChatId = $state<number | null>(null);
	let messageInput = $state('');
	let messages = $state<Array<{id?: number, text: string, sent: boolean}>>([]);
	let showTyping = $state(false);
	let totalUnreadCount = $state(0);
	let contacts = $state<Array<{
		id: number;
		name: string;
		avatar: string;
		gradient: string;
		online: boolean;
		status: string;
		lastMessage?: string;
		unreadCount?: number;
	}>>([]);

	// Load total unread count from API
	async function loadUnreadCount() {
		try {
			const res = await fetch('/api/chat/contacts?unreadCount=true');
			if (res.ok) {
				const data = await res.json();
				totalUnreadCount = data.unreadCount || 0;
			}
		} catch (e) {
			console.error('Failed to load unread count:', e);
		}
	}

	// Load contacts from API
	async function loadContacts() {
		try {
			const res = await fetch('/api/chat/contacts');
			if (res.ok) {
				contacts = await res.json();
			}
		} catch (e) {
			console.error('Failed to load contacts:', e);
		}
	}

	// Load messages for a contact from API
	async function loadMessages(contactId: number) {
		try {
			const res = await fetch(`/api/chat/messages?contactId=${contactId}`);
			if (res.ok) {
				const data = await res.json();
				messages = data.map((m: any) => ({
					id: m.id,
					text: m.content,
					sent: m.sent
				}));
			}
		} catch (e) {
			console.error('Failed to load messages:', e);
		}
	}

	function updateTime() {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		currentTime = `${hours}:${minutes}`;
	}

	function openApp(appName: string) {
		if (appName === 'Mesaje') {
			loadContacts();
			currentView = 'messages-list';
		} else {
			console.log(`Opening ${appName}...`);
		}
	}

	async function openChat(contactId: number) {
		currentChatId = contactId;
		messages = [];
		currentView = 'messages-chat';
		await loadMessages(contactId);
	}

	function closeChat() {
		currentView = 'messages-list';
		currentChatId = null;
		loadContacts(); // Refresh contacts to update last message
		loadUnreadCount(); // Refresh unread count
	}

	function goHome() {
		currentView = 'home';
		currentChatId = null;
	}

	async function sendMessage() {
		if (!messageInput.trim() || !currentChatId) return;

		const content = messageInput.trim();
		messageInput = '';

		// Save to database
		try {
			const res = await fetch('/api/chat/messages', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ contactId: currentChatId, content, sent: true })
			});
			
			if (res.ok) {
				const newMsg = await res.json();
				messages = [...messages, { id: newMsg.id, text: content, sent: true }];
			}
		} catch (e) {
			console.error('Failed to send message:', e);
		}
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			sendMessage();
		}
	}

	async function logout() {
		await fetch('/api/auth/logout', { method: 'POST' });
		window.location.href = '/login';
	}

	// Get current contact
	function getCurrentContact() {
		return contacts.find(c => c.id === currentChatId);
	}

	// Funcție pentru a executa acțiuni bazate pe numărul acțiunii
	async function LoadAction(actionNumber: number): Promise<boolean> {
		console.log(`Executare acțiune ${actionNumber}...`);
		
		if (actionNumber === 1) {
			console.log("Acțiune 1: Execut logica pentru acțiunea 1");
			// Adaugă aici logica pentru acțiunea 1
			return true;
		}
		
		if (actionNumber === 2) {
			console.log("Acțiune 2: Execut logica pentru acțiunea 2");
			// Adaugă aici logica pentru acțiunea 2
			return true;
		}
		
		if (actionNumber === 3) {
			console.log("Acțiune 3: Execut logica pentru acțiunea 3");
			// Adaugă aici logica pentru acțiunea 3
			return true;
		}
		
		console.log(`Acțiune ${actionNumber} necunoscută`);
		return false;
	}

	// Funcție pentru verificarea photo actions - poate fi apelată de mai multe ori
	async function checkForNewPhotoActions() {
		const now = Date.now();
		// Evită verificări mai des de 1 secunda
		if (now - lastPhotoActionsCheck < 1000) {
			console.log('Skipping photo actions check - too soon');
			return
		}
		lastPhotoActionsCheck = now;
		
		console.log('Checking for new photo actions...');
		
		const result = await handlePhotoActionsOnLoad(async (pending) => {
			pendingPhotoActions = pending;
			if (pending.length > 0) {
				console.log('Acțiuni foto pending găsite:', pending);
				
				// Verifică acțiunile cu done == false și execută-le
				for (const action of pending) {
					if (action.done === false) {
						console.log(`Acțiune cu done=false: ID=${action.action_id}, action=${action.action}, user_id=${action.user_id}`);
						
						// Execută acțiunea
						const success = await LoadAction(action.action);
						
						// Dacă acțiunea a fost executată cu succes, marchează ca done=true
						if (success=="1.0") {
							const updated = await markActionComplete(action.action);
							if (updated) {
								console.log(`Acțiunea ${action.action} a fost marcată ca done=true în baza de date`);
							} else {
								console.error(`Eroare la actualizarea acțiunii ${action.action} în baza de date`);
							}
						}
					}
				}
				
				// showPhotoActionModal = true; // Activează dacă vrei modal
			}
		});
		
		console.log('Photo actions check result:', result);
	}

	// Verifică photo actions la navigare între pagini (ex: când revii de la /story)
	afterNavigate(() => {
		console.log('Navigation detected - checking photo actions');
		checkForNewPhotoActions();
	});

	// Verifică când currentView devine 'home' (ex: când ieși din mesaje)
	$effect(() => {
		if (currentView === 'home') {
			console.log('Returned to home view - checking photo actions');
			checkForNewPhotoActions();
		}
	});

	onMount(() => {
		updateTime();
		loadUnreadCount(); // Load initial unread count
		const interval = setInterval(updateTime, 1000);
		
		// Verifică photo actions la încărcarea inițială
		checkForNewPhotoActions();
		
		// Page Visibility API - verifică când utilizatorul revine pe tab
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && currentView === 'home') {
				console.log('Tab became visible - checking photo actions');
				checkForNewPhotoActions();
			}
		};
		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			clearInterval(interval);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	$effect(() => {
		if (currentView === 'messages-chat') {
			setTimeout(() => {
				const container = document.getElementById('messagesContainer');
				if (container) container.scrollTop = container.scrollHeight;
			}, 100);
		}
	});

	const apps: Array<{name: string; icon: string; color: string; badge?: number; href?: string}> = [
		{ name: 'Mesaje', icon: 'messages', color: 'from-green-400 to-green-600' },
		{ name: 'Poze', icon: 'photos', color: 'from-pink-400 via-yellow-400 to-blue-400', href: '/story' },
	];

	const dockApps: Array<{name: string; icon: string; color: string; badge?: number}> = [
		{ name: 'Safari', icon: 'safari', color: 'from-blue-400 to-blue-600' },
		{ name: 'Mail', icon: 'mail', color: 'from-blue-500 to-blue-700', badge: 12 },
		{ name: 'Maps', icon: 'maps', color: 'from-green-400 to-green-600' },
	];
</script>

<svelte:head>
	<title>Phone - {data.user?.username || 'Home'}</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-inter min-h-screen flex justify-center items-center p-5 gap-8" style="background: linear-gradient(to bottom right, #1f2937, #374151, #1f2937);">
	
	<!-- Left Panel - User Info -->
	<div class="flex flex-col gap-4 self-start mt-20">
		<!-- User Badge -->
		<div class="px-5 py-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl text-white flex flex-col items-center gap-3 min-w-[140px]">
			<div class="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-xl font-bold shadow-lg">
				{data.user?.username?.charAt(0).toUpperCase() || 'U'}
			</div>
			<div class="text-center">
				<p class="font-semibold">{data.user?.username || 'User'}</p>
				<p class="text-xs text-white/60">Online</p>
			</div>
		</div>
a
		<!-- Logout Button -->
		<button 
			onclick={logout}
			class="px-5 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
			</svg>
			Deconectare
		</button>
	</div>

	<!-- Phone Frame -->
	<div class="rounded-[55px] p-3 relative" style="background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5), 0 0 0 2px #2a2a2a, inset 0 0 0 1px rgba(255, 255, 255, 0.05);">
		
		<!-- Phone Screen -->
		<div class="w-[375px] h-[812px] rounded-[45px] overflow-hidden relative" style="background: linear-gradient(180deg, #1c1c1e 0%, #000000 100%);">
			
			<!-- Wallpaper (only for home) -->
			{#if currentView === 'home'}
				<div class="absolute inset-0" style="background: radial-gradient(ellipse at 30% 20%, rgba(88, 86, 214, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 70% 60%, rgba(255, 55, 95, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 40% 80%, rgba(50, 215, 75, 0.2) 0%, transparent 40%), linear-gradient(180deg, #1c1c1e 0%, #000000 100%);"></div>
			{/if}
			
			<!-- Status Bar -->
			<div class="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 pt-4 text-white text-sm font-medium {currentView !== 'home' ? 'bg-gradient-to-b from-black/80 to-transparent pb-6' : ''}">
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

			<!-- HOME VIEW -->
			{#if currentView === 'home'}
				<!-- Apps Grid -->
				<div class="relative z-10 px-6 pt-16">
					<div class="grid grid-cols-4 gap-5">
						{#each apps as app}
							{#if app.href}
								<a href={app.href} class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95">
									<div class="w-[60px] h-[60px] bg-gradient-to-b {app.color} rounded-[14px] flex items-center justify-center shadow-lg relative">
										{#if app.icon === 'photos'}
											<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
												<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
											</svg>
										{/if}
										{#if app.name === 'Mesaje' && totalUnreadCount > 0}
											<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{totalUnreadCount}</div>
										{:else if app.badge}
											<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{app.badge}</div>
										{/if}
									</div>
									<span class="text-white text-xs">{app.name}</span>
								</a>
							{:else}
								<button class="flex flex-col items-center gap-1.5 transition-transform hover:scale-110 active:scale-95" onclick={() => openApp(app.name)}>
									<div class="w-[60px] h-[60px] bg-gradient-to-b {app.color} rounded-[14px] flex items-center justify-center shadow-lg relative">
										{#if app.icon === 'messages'}
											<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
												<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
											</svg>
										{:else if app.icon === 'phone'}
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
										{#if app.name === 'Mesaje' && totalUnreadCount > 0}
											<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{totalUnreadCount}</div>
										{:else if app.badge}
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
							<button class="relative transition-transform hover:scale-110 active:scale-95" onclick={() => openApp(app.name)}>
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
								{#if app.name === 'Mesaje' && totalUnreadCount > 0}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{totalUnreadCount}</div>
								{:else if app.badge}
									<div class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-semibold animate-pulse">{app.badge}</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- MESSAGES LIST VIEW -->
			{#if currentView === 'messages-list'}
				<div class="absolute inset-0 bg-black">
					<!-- Header -->
					<div class="pt-14 px-4 pb-2">
						<div class="flex items-center justify-between mb-4">
							<button onclick={goHome} class="text-blue-500 text-sm font-medium flex items-center gap-1">
								<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
								</svg>
							</button>
							<h1 class="text-white text-2xl font-bold">Mesaje</h1>
							<button class="text-blue-500">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
								</svg>
							</button>
						</div>
						
						<!-- Search Bar -->
						<div class="relative">
							<svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
							<input type="text" placeholder="Caută" class="w-full bg-gray-800/80 text-white placeholder-gray-500 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
						</div>
					</div>

					<!-- Conversations List -->
					<div class="overflow-y-auto scrollbar-hide" style="height: calc(100% - 180px);">
						{#each contacts as contact}
							<button 
								class="flex items-center gap-3 px-4 py-3 cursor-pointer w-full text-left transition-all hover:bg-white/5 active:bg-white/10 active:scale-[0.98]"
								onclick={() => openChat(contact.id)}
							>
								<div class="relative">
									<div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg" style="background: {contact.gradient};">
										{contact.avatar}
									</div>
									{#if contact.online}
										<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="flex items-center justify-between">
										<h3 class="text-white font-semibold">{contact.name}</h3>
									</div>
									<p class="text-gray-400 text-sm truncate">{contact.lastMessage || 'Niciun mesaj'}</p>
								</div>
								{#if contact.unreadCount && contact.unreadCount > 0}
									<div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
										<span class="text-white text-xs font-bold">{contact.unreadCount}</span>
									</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/if}

			<!-- MESSAGES CHAT VIEW -->
			{#if currentView === 'messages-chat' && currentChatId}
				{@const contact = getCurrentContact()}
				{#if contact}
				<div class="absolute inset-0 bg-black">
					<!-- Chat Header -->
					<div class="absolute top-0 left-0 right-0 z-40 bg-black/90 backdrop-blur-xl border-b border-gray-800/50">
						<div class="pt-14 px-4 pb-3">
							<div class="flex items-center gap-3">
								<button onclick={closeChat} class="text-blue-500 flex items-center gap-1">
									<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
									</svg>
								</button>
								<div class="flex items-center gap-3 flex-1">
									<div class="relative">
										<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style="background: {contact.gradient};">
											{contact.avatar}
										</div>
										{#if contact.online}
											<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
										{/if}
									</div>
									<div>
										<h2 class="text-white font-semibold">{contact.name}</h2>
										<p class="{contact.online ? 'text-green-500' : 'text-gray-500'} text-xs">{contact.status}</p>
									</div>
								</div>
								<button class="text-blue-500 p-2">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
									</svg>
								</button>
								<button class="text-blue-500 p-2">
									<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
										<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
									</svg>
								</button>
							</div>
						</div>
					</div>

					<!-- Messages Container -->
					<div id="messagesContainer" class="absolute inset-0 overflow-y-auto scrollbar-hide pt-28 pb-20 px-4">
						<div class="flex flex-col gap-2">
							<!-- Date Separator -->
							<div class="flex justify-center my-4">
								<span class="text-gray-500 text-xs bg-gray-800/50 px-3 py-1 rounded-full">Astăzi</span>
							</div>

							{#each messages as message}
								<div class="flex {message.sent ? 'justify-end' : 'justify-start'}">
									<div class="{message.sent ? 'message-bubble-sent' : 'message-bubble-received'} px-4 py-2 max-w-[75%]">
										<p class="text-white text-sm">{message.text}</p>
										{#if message.sent}
											<div class="flex items-center justify-end gap-1 mt-1">
												<svg class="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
													<path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
												</svg>
											</div>
										{/if}
									</div>
								</div>
							{/each}

							<!-- Typing Indicator -->
							{#if showTyping}
								<div class="flex justify-start">
									<div class="message-bubble-received px-4 py-3">
										<div class="typing-indicator flex gap-1">
											<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
											<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
											<span class="w-2 h-2 bg-gray-400 rounded-full"></span>
										</div>
									</div>
								</div>
							{/if}
						</div>
					</div>

					<!-- Message Input -->
					<div class="absolute bottom-0 left-0 right-0 bg-[rgba(28,28,30,0.95)] backdrop-blur-xl border-t border-gray-800/50 px-4 py-3 pb-8">
						<div class="flex items-center gap-2">
							<button class="text-blue-500 p-2">
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
								</svg>
							</button>
							<button class="text-blue-500 p-2">
								<svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2S13.77 8.8 12 8.8 8.8 10.23 8.8 12s1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
								</svg>
							</button>
							<div class="flex-1 relative">
								<input 
									type="text" 
									bind:value={messageInput}
									placeholder="Mesaj" 
									class="w-full bg-gray-800 text-white placeholder-gray-500 rounded-full py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
									onkeypress={handleKeyPress}
								>
							</div>
							<button onclick={sendMessage} class="bg-blue-500 hover:bg-blue-600 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors">
								<svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
								</svg>
							</button>
						</div>
					</div>
				</div>
				{/if}
			{/if}

			<!-- Home Indicator -->
			<div class="absolute bottom-2 left-1/2 -translate-x-1/2 z-50">
				<div class="w-36 h-1 rounded-full bg-white/30"></div>
			</div>

		</div>
	</div>

	<!-- Photo Action Modal (când sunt acțiuni pending) -->
	{#if showPhotoActionModal && pendingPhotoActions.length > 0}
		<div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100]">
			<div class="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
				<div class="text-center">
					<div class="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
						</svg>
					</div>
					<h3 class="text-white text-xl font-bold mb-2">Acțiuni în așteptare</h3>
					<p class="text-gray-400 text-sm mb-4">
						Ai {pendingPhotoActions.length} acțiune{pendingPhotoActions.length > 1 ? 'i' : ''} foto care trebuie completat{pendingPhotoActions.length > 1 ? 'e' : 'ă'}.
					</p>
					
					<!-- Lista acțiunilor pending -->
					<div class="bg-gray-800 rounded-xl p-3 mb-4 max-h-32 overflow-y-auto">
						{#each pendingPhotoActions as action}
							<div class="flex items-center justify-between py-2 border-b border-gray-700 last:border-0">
								<span class="text-gray-300 text-sm">{action.action}</span>
								<span class="text-orange-400 text-xs">În așteptare</span>
							</div>
						{/each}
					</div>
					
					<div class="flex gap-3">
						<button 
							onclick={() => showPhotoActionModal = false}
							class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-medium transition-colors"
						>
							Mai târziu
						</button>
						<a 
							href="/story"
							class="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-medium transition-colors text-center"
						>
							Mergi la Poze
						</a>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.font-inter {
		font-family: 'Inter', sans-serif;
	}
	
	.message-bubble-sent {
		background: linear-gradient(135deg, #007AFF 0%, #0055D4 100%);
		border-radius: 20px 20px 4px 20px;
	}
	
	.message-bubble-received {
		background: #2C2C2E;
		border-radius: 20px 20px 20px 4px;
	}
	
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}
	
	.scrollbar-hide {
		-ms-overflow-style: none;
		scrollbar-width: none;
	}
	
	.typing-indicator span {
		animation: bounce 1.4s infinite ease-in-out;
	}
	
	.typing-indicator span:nth-child(1) { animation-delay: 0s; }
	.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
	.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
	
	@keyframes bounce {
		0%, 60%, 100% { transform: translateY(0); }
		30% { transform: translateY(-4px); }
	}
</style>
