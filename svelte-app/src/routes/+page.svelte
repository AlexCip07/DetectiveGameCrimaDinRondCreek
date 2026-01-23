<script lang="ts">
	import { onMount } from 'svelte';

	// Conversation flow
	const conversationFlow = [
		{
			question: "Ethan, știu cine este criminalul.",
			choices: [
				{ text: "Cine ești?", response: "Nu contează asta acum... mă vor omorî." },
				{ text: "De ce sa am incredere in tine?", response: "Dar daca nu vei verifica si pista asta nu o sa l gasesti" }
			]
		},
		{
			question: "Nu pot sa ti zic direct, astfel vor stii ca am fost eu",
			choices: [
				{ text: "De ce ar trebui să am încredere în tine?", response: "Nu trebuie să ai. Dar dacă nu vii, vei regreta toată viața." },
				{ text: "OK, voi fi acolo.", response: "Bine. Vino singur. Și Ethan... nu spune nimănui." },
				{ text: "Sun poliția.", response: "Poliția? Ei sunt problema. Crezi că de ce nu s-a rezolvat cazul?" }
			]
		},
		{
			question: "Mai e ceva ce trebuie să știi... criminalul te cunoaște.",
			choices: [
				{ text: "Cum adică mă cunoaște?!", response: "Cineva din cercul tău. Cineva în care ai încredere." },
				{ text: "Spune-mi numele!", response: "Nu aici. Nu e sigur. La întâlnire îți arăt dovezile." }
			]
		},
		{
			question: "Am auzit ceva... trebuie să plec. Miezul nopții. Nu uita.",
			choices: [
				{ text: "Așteaptă! Mai am întrebări!", response: "Nu mai e timp. Vin după mine. Miezul nopții, Ethan." },
				{ text: "Ai grijă de tine.", response: "Tu ai grijă. Criminalul știe că ai început să cauți adevărul..." }
			]
		},
		{
			question: "[Conexiunea s-a întrerupt]",
			connectionLost: true,
			choices: []
		}
	];

	let currentQuestionIndex = 0;
	let messages: Array<{text: string, isSent: boolean, time: string}> = [];
	let currentChoices: Array<{text: string, response: string}> = [];
	let showChoices = false;
	let isTyping = false;
	let isOnline = true;
	let showIntro = true;
	let progress = 0;
	let introComplete = false;
	let chatVisible = false;

	function getCurrentTime() {
		const now = new Date();
		return now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
	}

	function delay(ms: number) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	function randomDelay(min = 1000, max = 2000) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	async function addMessage(text: string, isSent = true) {
		messages = [...messages, { text, isSent, time: getCurrentTime() }];
	}

	async function askQuestion() {
		if (currentQuestionIndex >= conversationFlow.length) {
			currentQuestionIndex = 0;
		}
		
		const current = conversationFlow[currentQuestionIndex];
		
		if (current.connectionLost) {
			isOnline = false;
			await addMessage(current.question, false);
			return;
		}
		
		isTyping = true;
		await delay(randomDelay(1000, 2000));
		isTyping = false;
		
		await addMessage(current.question, false);
		
		await delay(500);
		if (current.choices && current.choices.length > 0) {
			currentChoices = current.choices;
			showChoices = true;
		}
	}

	async function selectChoice(choice: {text: string, response: string, restart?: boolean, nextQuestion?: number}) {
		showChoices = false;
		currentChoices = [];
		
		await delay(randomDelay(800, 1500));
		await addMessage(choice.text, true);
		
		isTyping = true;
		await delay(randomDelay(1000, 2000));
		isTyping = false;
		await addMessage(choice.response, false);
		
		if (choice.restart) {
			currentQuestionIndex = 0;
			isOnline = true;
			await delay(1000);
			await askQuestion();
			return;
		}
		
		if (choice.nextQuestion !== undefined) {
			currentQuestionIndex = choice.nextQuestion;
		} else {
			currentQuestionIndex++;
		}
		
		if (currentQuestionIndex < conversationFlow.length) {
			await delay(randomDelay(800, 1500));
			await askQuestion();
		}
	}

	async function runIntroAnimation() {
		const progressInterval = setInterval(() => {
			progress += 2;
			if (progress >= 70) {
				clearInterval(progressInterval);
			}
		}, 50);

		await delay(2000);
		introComplete = true;
		progress = 100;
		
		await delay(1500);
		showIntro = false;
		chatVisible = true;
		
		await delay(500);
		await askQuestion();
	}

	onMount(() => {
		runIntroAnimation();
	});
</script>

<svelte:head>
	<title>Chat RO-RO</title>
</svelte:head>

<div class="min-h-screen flex justify-center items-center p-5 bg-bg-primary" style="background-image: radial-gradient(ellipse at 20% 20%, rgba(255, 107, 74, 0.08) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(138, 107, 255, 0.06) 0%, transparent 50%), linear-gradient(180deg, #0a0a0f 0%, #0d0d14 100%);">
	
	<!-- INTRO SCREEN -->
	{#if showIntro}
		<div class="fixed inset-0 bg-bg-primary flex flex-col justify-center items-center z-50 transition-all duration-700" class:opacity-0={!showIntro && introComplete} class:invisible={!showIntro && introComplete} style="background-image: radial-gradient(ellipse at 50% 50%, rgba(255, 107, 74, 0.1) 0%, transparent 60%);">
			
			<!-- Lock Icon with Spinner -->
			<div class="relative w-20 h-20 mb-10">
				{#if !introComplete}
					<div class="absolute -inset-4 border-[3px] border-transparent border-t-accent rounded-full animate-spin"></div>
				{/if}
				<svg viewBox="0 0 24 24" class="w-full h-full transition-all duration-500" class:fill-text-secondary={!introComplete} class:fill-success={introComplete} class:drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]={introComplete}>
					<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
				</svg>
			</div>
			
			<!-- Text -->
			<div class="font-mono text-lg tracking-wider uppercase flex items-center gap-2 transition-all duration-500" class:text-text-secondary={!introComplete} class:text-success={introComplete}>
				<span>{introComplete ? 'Connection Secure' : 'Trying to make the connection'}</span>
				{#if !introComplete}
					<div class="flex gap-1">
						<span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-pulse"></span>
						<span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-pulse" style="animation-delay: 0.2s"></span>
						<span class="w-1.5 h-1.5 bg-text-secondary rounded-full animate-pulse" style="animation-delay: 0.4s"></span>
					</div>
				{:else}
					<svg viewBox="0 0 24 24" class="w-6 h-6 fill-success">
						<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
					</svg>
				{/if}
			</div>
			
			<!-- Progress Bar -->
			<div class="w-52 h-[3px] bg-bg-tertiary rounded-full mt-8 overflow-hidden">
				<div class="h-full rounded-full transition-all duration-300" style="width: {progress}%; background: linear-gradient(90deg, #ff6b4a, #4ade80);"></div>
			</div>
		</div>
	{/if}

	<!-- CHAT CONTAINER -->
	<div class="w-full max-w-[520px] h-[85vh] max-h-[750px] bg-bg-secondary rounded-3xl border border-border-custom flex flex-col overflow-hidden transition-all duration-600" class:opacity-0={!chatVisible} class:translate-y-8={!chatVisible} class:scale-[0.98]={!chatVisible} style="box-shadow: 0 25px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);">
		
		<!-- Header -->
		<div class="px-6 py-5 bg-bg-tertiary border-b border-border-custom flex items-center gap-3.5">
			<div class="w-11 h-11 rounded-xl flex items-center justify-center font-semibold text-lg text-white" style="background: linear-gradient(135deg, #ff6b4a 0%, #ff8a6b 100%); box-shadow: 0 4px 15px rgba(255,107,74,0.3);">
				RO
			</div>
			<div>
				<h1 class="text-[17px] font-semibold tracking-tight text-text-primary">Chat RO-RO</h1>
				<div class="text-[13px] text-text-secondary flex items-center gap-1.5">
					<span class="w-2 h-2 rounded-full transition-all duration-500" class:bg-success={isOnline} class:bg-red-500={!isOnline} class:animate-pulse={isOnline}></span>
					<span>{isOnline ? 'Online acum' : 'Offline'}</span>
				</div>
			</div>
		</div>

		<!-- Messages Area -->
		<div class="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
			
			<!-- Date Divider -->
			<div class="flex items-center gap-3 text-text-secondary text-xs my-2.5">
				<span class="flex-1 h-px bg-border-custom"></span>
				<span>Astăzi</span>
				<span class="flex-1 h-px bg-border-custom"></span>
			</div>

			{#each messages as message}
				<div class="flex flex-col max-w-[80%] animate-[messageIn_0.4s_ease-out]" class:self-end={message.isSent} class:self-start={!message.isSent}>
					{#if message.isSent}
						<div class="px-[18px] py-3.5 text-white rounded-[20px] rounded-br-md text-[15px] leading-relaxed" style="background: linear-gradient(135deg, #ff6b4a 0%, #ff8a6b 100%); box-shadow: 0 4px 20px rgba(255,107,74,0.3);">
							{message.text}
						</div>
						<span class="text-[11px] text-text-secondary mt-1.5 font-mono text-right">{message.time}</span>
					{:else}
						<div class="px-[18px] py-3.5 bg-message-other rounded-[20px] rounded-bl-md border border-border-custom text-[15px] leading-relaxed text-text-primary">
							{message.text}
						</div>
						<span class="text-[11px] text-text-secondary mt-1.5 font-mono">{message.time}</span>
					{/if}
				</div>
			{/each}

			{#if isTyping}
				<div class="flex flex-col max-w-[80%] self-start">
					<div class="flex gap-1.5 px-[18px] py-3.5 bg-message-other rounded-[20px] rounded-bl-md border border-border-custom w-fit">
						<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0s"></span>
						<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
						<span class="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style="animation-delay: 0.4s"></span>
					</div>
				</div>
			{/if}
		</div>

		<!-- Choices Area -->
		{#if showChoices}
			<div class="px-6 py-4 bg-bg-tertiary border-t border-border-custom">
				<div class="flex flex-col gap-2">
					{#each currentChoices as choice, index}
						<button 
							class="w-full px-4 py-3 bg-bg-secondary border border-border-custom rounded-xl text-left text-[15px] text-text-primary hover:border-accent hover:bg-bg-tertiary transition-all duration-200 hover:-translate-y-0.5"
							style="animation: fadeIn 0.3s ease-out forwards; animation-delay: {index * 0.1}s"
							on:click={() => selectChoice(choice)}
						>
							{choice.text}
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	@keyframes messageIn {
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}
	@keyframes fadeIn {
		from { opacity: 0; transform: translateY(5px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
