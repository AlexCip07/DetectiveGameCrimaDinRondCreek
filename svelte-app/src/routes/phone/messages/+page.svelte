<script lang="ts">
	import { onMount } from 'svelte';

	let currentTime = $state('21:37');
	let currentView = $state<'conversations' | 'chat'>('conversations');
	let currentChat = $state<string | null>(null);
	let messageInput = $state('');
	let messages = $state<Array<{text: string, sent: boolean, time: string}>>([]);
	let showTyping = $state(false);

	interface Chat {
		name: string;
		avatar: string;
		gradient: string;
		online: boolean;
		status: string;
		lastMessage: string;
		time: string;
		unread?: number;
	}

	const chats: Record<string, Chat> = {
		maria: {
			name: 'Maria',
			avatar: 'M',
			gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
			online: true,
			status: 'online',
			lastMessage: 'Bine, ne vedem diseară la 8!',
			time: 'acum 2m',
			unread: 2
		},
		alex: {
			name: 'Alex',
			avatar: 'A',
			gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
			online: false,
			status: 'ultima dată azi la 10:42',
			lastMessage: 'Ai primit fișierele?',
			time: '10:42'
		},
		grup: {
			name: 'Prieteni',
			avatar: '👥',
			gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
			online: true,
			status: '3 online',
			lastMessage: 'Dan: Cine vine la film?',
			time: 'ieri',
			unread: 5
		},
		mama: {
			name: 'Mama',
			avatar: 'M',
			gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
			online: false,
			status: 'ultima dată ieri la 21:30',
			lastMessage: 'Te-am sunat. Sună-mă când poți.',
			time: 'ieri'
		},
		andrei: {
			name: 'Andrei',
			avatar: 'A',
			gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
			online: false,
			status: 'ultima dată luni',
			lastMessage: 'Da, vin și eu la petrecere!',
			time: 'luni'
		},
		ioana: {
			name: 'Ioana',
			avatar: 'I',
			gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
			online: false,
			status: 'ultima dată pe 22 ian',
			lastMessage: 'Mulțumesc pentru ajutor! 🙏',
			time: '22 ian'
		}
	};

	const initialMessages = [
		{ text: 'Salut! Ce faci? 😊', sent: false, time: '18:30' },
		{ text: 'Bine, tu? Tocmai am terminat lucrul.', sent: true, time: '18:32' },
		{ text: 'Super! Vrei să ieșim în seara asta?', sent: false, time: '18:35' },
		{ text: 'Da, sună bine! Unde vrei să mergem?', sent: true, time: '18:36' },
		{ text: 'Am auzit de un restaurant nou în centru. Merge?', sent: false, time: '18:40' },
		{ text: 'Perfect! La ce oră?', sent: true, time: '18:41' },
		{ text: 'Bine, ne vedem diseară la 8!', sent: false, time: '18:42' },
	];

	function updateTime() {
		const now = new Date();
		const hours = now.getHours().toString().padStart(2, '0');
		const minutes = now.getMinutes().toString().padStart(2, '0');
		currentTime = `${hours}:${minutes}`;
	}

	function openChat(chatId: string) {
		currentChat = chatId;
		messages = [...initialMessages];
		currentView = 'chat';
	}

	function closeChat() {
		currentView = 'conversations';
		currentChat = null;
	}

	function getCurrentTimeStr() {
		const now = new Date();
		return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
	}

	function sendMessage() {
		if (!messageInput.trim()) return;

		messages = [...messages, { text: messageInput, sent: true, time: getCurrentTimeStr() }];
		messageInput = '';

		// Simulate response
		setTimeout(() => {
			showTyping = true;
			setTimeout(() => {
				showTyping = false;
				const responses = ['Ok! 👍', 'Super, mulțumesc!', 'Am înțeles.', 'Perfect! 😊', 'Bine, ne auzim!', 'La fel! 🎉'];
				const response = responses[Math.floor(Math.random() * responses.length)];
				messages = [...messages, { text: response, sent: false, time: getCurrentTimeStr() }];
			}, 1500 + Math.random() * 1000);
		}, 500);
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			sendMessage();
		}
	}

	onMount(() => {
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	});

	$effect(() => {
		if (currentView === 'chat') {
			setTimeout(() => {
				const container = document.getElementById('messagesContainer');
				if (container) container.scrollTop = container.scrollHeight;
			}, 100);
		}
	});
</script>

<svelte:head>
	<title>Mesaje</title>
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-inter min-h-screen flex justify-center items-center p-5" style="background: linear-gradient(to bottom right, #1f2937, #374151, #1f2937);">
	
	<!-- Phone Frame -->
	<div class="rounded-[55px] p-3 relative" style="background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5), 0 0 0 2px #2a2a2a, inset 0 0 0 1px rgba(255, 255, 255, 0.05);">
		
		<!-- Phone Screen -->
		<div class="w-[375px] h-[812px] rounded-[45px] overflow-hidden relative bg-black">
			
			<!-- Status Bar -->
			<div class="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 pt-4 text-white text-sm font-medium bg-gradient-to-b from-black/80 to-transparent pb-6">
				<span class="text-[15px]">{currentTime}</span>
				
				<!-- Notch -->
				<div class="absolute left-1/2 -translate-x-1/2 top-0 w-[120px] h-[35px] rounded-b-3xl flex items-center justify-center gap-2 bg-black" style="box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1);">
					<div class="w-2 h-2 rounded-full bg-gray-800 ring-1 ring-gray-700"></div>
					<div class="w-16 h-4 rounded-full bg-gray-900"></div>
				</div>
				
				<div class="flex items-center gap-1.5">
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M2 17h2v4H2v-4zm4-5h2v9H6v-9zm4-4h2v13h-2V8zm4-4h2v17h-2V4zm4-2h2v19h-2V2z"/>
					</svg>
					<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 18 10.6 18.5 12 18.5s2.6-.5 3.5-1.4l1.4-1.4c-1.3-1.3-3.1-2.1-4.9-2.1s-3.6.8-4.9 2.1zM12 10c-3 0-5.7 1.2-7.7 3.2l1.4 1.4c1.6-1.6 3.8-2.6 6.3-2.6s4.7 1 6.3 2.6l1.4-1.4C17.7 11.2 15 10 12 10zm0-4c-4.1 0-7.9 1.6-10.8 4.3l1.4 1.4C5.2 9.2 8.4 8 12 8s6.8 1.2 9.4 3.7l1.4-1.4C19.9 7.6 16.1 6 12 6z"/>
					</svg>
					<div class="flex items-center gap-0.5">
						<div class="w-6 h-3 border border-white rounded-sm flex items-center p-0.5">
							<div class="w-4 h-1.5 bg-green-500 rounded-sm"></div>
						</div>
						<div class="w-0.5 h-1.5 bg-white rounded-r-sm"></div>
					</div>
				</div>
			</div>

			<!-- Conversations List View -->
			<div 
				class="absolute inset-0 bg-black transition-all duration-300"
				style="transform: translateX({currentView === 'conversations' ? '0' : '-100%'}); opacity: {currentView === 'conversations' ? '1' : '0'};"
			>
				<!-- Header -->
				<div class="pt-14 px-4 pb-2">
					<div class="flex items-center justify-between mb-4">
						<a href="/phone" class="text-blue-500 text-sm font-medium flex items-center gap-1">
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
							</svg>
						</a>
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
					{#each Object.entries(chats) as [id, chat]}
						<button 
							class="conversation-item flex items-center gap-3 px-4 py-3 cursor-pointer w-full text-left transition-all hover:bg-white/5 active:bg-white/10 active:scale-[0.98]"
							onclick={() => openChat(id)}
						>
							<div class="relative">
								<div class="w-14 h-14 rounded-full flex items-center justify-center text-white font-semibold text-lg" style="background: {chat.gradient};">
									{chat.avatar}
								</div>
								{#if chat.online}
									<div class="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-black"></div>
								{/if}
							</div>
							<div class="flex-1 min-w-0">
								<div class="flex items-center justify-between">
									<h3 class="text-white font-semibold">{chat.name}</h3>
									<span class="text-gray-500 text-xs">{chat.time}</span>
								</div>
								<p class="text-gray-400 text-sm truncate">{chat.lastMessage}</p>
							</div>
							{#if chat.unread}
								<div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
									<span class="text-white text-xs font-bold">{chat.unread}</span>
								</div>
							{/if}
						</button>
					{/each}
				</div>
			</div>

			<!-- Chat View -->
			<div 
				class="absolute inset-0 bg-black transition-all duration-300"
				style="transform: translateX({currentView === 'chat' ? '0' : '100%'}); opacity: {currentView === 'chat' ? '1' : '0'};"
			>
				<!-- Chat Header -->
				{#if currentChat && chats[currentChat]}
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
										<div class="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style="background: {chats[currentChat].gradient};">
											{chats[currentChat].avatar}
										</div>
										{#if chats[currentChat].online}
											<div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
										{/if}
									</div>
									<div>
										<h2 class="text-white font-semibold">{chats[currentChat].name}</h2>
										<p class="{chats[currentChat].online ? 'text-green-500' : 'text-gray-500'} text-xs">{chats[currentChat].status}</p>
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
				{/if}

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
									<div class="flex items-center {message.sent ? 'justify-end' : ''} gap-1 mt-1">
										<span class="{message.sent ? 'text-blue-200' : 'text-gray-500'} text-[10px]">{message.time}</span>
										{#if message.sent}
											<svg class="w-3 h-3 text-blue-200" fill="currentColor" viewBox="0 0 24 24">
												<path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>
											</svg>
										{/if}
									</div>
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

			<!-- Home Indicator -->
			<div class="absolute bottom-2 left-1/2 -translate-x-1/2 z-50">
				<div class="w-36 h-1 rounded-full bg-white/30"></div>
			</div>

		</div>
	</div>
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
