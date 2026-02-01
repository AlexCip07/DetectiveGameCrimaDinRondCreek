<script lang="ts">
	import { onMount } from 'svelte';

	// Game state
	let gameStarted = $state(false);
	let gameWon = $state(false);
	let gameFailed = $state(false);
	let currentLevel = $state(1);
	let score = $state(0);
	let ipAddress = $state('');
	let hackedDigits = $state<string[]>([]);
	let currentDigitIndex = $state(0);
	
	// Circle animation
	let angle = $state(0);
	let rotationSpeed = $state(2); // degrees per frame
	let animationId: number | null = null;
	
	// Circle properties
	const circleRadius = 120;
	const digitCount = 10; // 0-9 arranged in circle
	
	// Timing window (in degrees) - how close you need to be
	let timingWindow = $state(15);
	
	// Get current target digit position (angle)
	let targetDigit = $derived(parseInt(ipAddress[currentDigitIndex]) || 0);
	let targetAngle = $derived((targetDigit / digitCount) * 360);
	
	// Generate random IP address
	function generateIP(): string {
		const octets = [];
		for (let i = 0; i < 4; i++) {
			octets.push(Math.floor(Math.random() * 256));
		}
		return octets.join('.');
	}
	
	function startGame() {
		ipAddress = generateIP();
		hackedDigits = [];
		currentDigitIndex = 0;
		angle = 0;
		gameWon = false;
		gameFailed = false;
		gameStarted = true;
		
		// Adjust difficulty based on level
		rotationSpeed = 1.5 + (currentLevel * 0.5);
		timingWindow = Math.max(8, 18 - currentLevel * 2);
		
		startAnimation();
	}
	
	function startAnimation() {
		if (animationId) cancelAnimationFrame(animationId);
		
		function animate() {
			angle = (angle + rotationSpeed) % 360;
			animationId = requestAnimationFrame(animate);
		}
		animationId = requestAnimationFrame(animate);
	}
	
	function stopAnimation() {
		if (animationId) {
			cancelAnimationFrame(animationId);
			animationId = null;
		}
	}
	
	function checkHit() {
		if (!gameStarted || gameWon || gameFailed) return;
		
		// Skip dots in IP address
		while (ipAddress[currentDigitIndex] === '.') {
			hackedDigits.push('.');
			currentDigitIndex++;
		}
		
		if (currentDigitIndex >= ipAddress.length) {
			// Won!
			gameWon = true;
			stopAnimation();
			score += currentLevel * 100;
			return;
		}
		
		// Check if angle is close to target
		const targetDeg = targetAngle;
		let diff = Math.abs(angle - targetDeg);
		if (diff > 180) diff = 360 - diff;
		
		if (diff <= timingWindow) {
			// Hit!
			hackedDigits.push(ipAddress[currentDigitIndex]);
			currentDigitIndex++;
			
			// Skip dots
			while (ipAddress[currentDigitIndex] === '.') {
				hackedDigits.push('.');
				currentDigitIndex++;
			}
			
			if (currentDigitIndex >= ipAddress.length) {
				// Won!
				gameWon = true;
				stopAnimation();
				score += currentLevel * 100;
			}
		} else {
			// Miss!
			gameFailed = true;
			stopAnimation();
		}
	}
	
	function nextLevel() {
		currentLevel++;
		startGame();
	}
	
	function restart() {
		currentLevel = 1;
		score = 0;
		startGame();
	}
	
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			if (!gameStarted) {
				startGame();
			} else if (gameWon) {
				nextLevel();
			} else if (gameFailed) {
				restart();
			} else {
				checkHit();
			}
		}
	}
	
	function handleClick() {
		if (!gameStarted) {
			startGame();
		} else if (gameWon) {
			nextLevel();
		} else if (gameFailed) {
			restart();
		} else {
			checkHit();
		}
	}
	
	// Calculate position on circle for each digit
	function getDigitPosition(digit: number) {
		const digitAngle = (digit / digitCount) * 360 - 90; // Start from top
		const rad = (digitAngle * Math.PI) / 180;
		return {
			x: Math.cos(rad) * circleRadius,
			y: Math.sin(rad) * circleRadius
		};
	}
	
	// Get cursor (square) position
	let cursorPosition = $derived(() => {
		const rad = ((angle - 90) * Math.PI) / 180;
		return {
			x: Math.cos(rad) * circleRadius,
			y: Math.sin(rad) * circleRadius
		};
	});
	
	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			stopAnimation();
		};
	});
</script>

<svelte:head>
	<title>IP Hacker</title>
</svelte:head>

<div 
	class="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-6 select-none cursor-pointer"
	onclick={handleClick}
	role="button"
	tabindex="0"
	onkeydown={handleKeydown}
>
	<!-- Matrix-like background effect -->
	<div class="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
		{#each Array(20) as _, i}
			<div 
				class="absolute text-green-500 text-xs font-mono animate-fall"
				style="left: {i * 5}%; animation-delay: {Math.random() * 5}s; animation-duration: {5 + Math.random() * 5}s;"
			>
				{#each Array(30) as _, j}
					<div style="animation-delay: {j * 0.1}s;">{Math.random() > 0.5 ? '1' : '0'}</div>
				{/each}
			</div>
		{/each}
	</div>

	<!-- Header -->
	<div class="text-center z-10">
		<h1 class="text-4xl font-mono font-bold text-green-500 mb-2 tracking-wider">
			[ IP HACKER ]
		</h1>
		<div class="text-green-400/70 font-mono text-sm">
			LEVEL {currentLevel} | SCORE: {score}
		</div>
	</div>

	<!-- Target IP Display -->
	<div class="bg-green-900/20 border border-green-500/50 rounded-lg px-6 py-3 font-mono z-10">
		<div class="text-green-400/70 text-xs mb-1">TARGET IP ADDRESS:</div>
		<div class="text-2xl tracking-widest">
			{#each ipAddress.split('') as char, i}
				<span class="{i < hackedDigits.length ? 'text-green-400' : i === currentDigitIndex ? 'text-yellow-400 animate-pulse' : 'text-green-500/30'}">
					{i < hackedDigits.length ? hackedDigits[i] : char}
				</span>
			{/each}
			{#if !ipAddress}
				<span class="text-green-500/30">XXX.XXX.XXX.XXX</span>
			{/if}
		</div>
	</div>

	<!-- Main Circle Game Area -->
	<div class="relative z-10" style="width: 300px; height: 300px;">
		<!-- Outer glow -->
		<div class="absolute inset-0 rounded-full bg-green-500/10 blur-xl"></div>
		
		<!-- Circle border -->
		<svg class="absolute inset-0 w-full h-full" viewBox="-150 -150 300 300">
			<!-- Background circle -->
			<circle 
				cx="0" cy="0" r="{circleRadius}" 
				fill="none" 
				stroke="rgba(34, 197, 94, 0.2)" 
				stroke-width="2"
			/>
			
			<!-- Target zone highlight -->
			{#if gameStarted && !gameWon && !gameFailed}
				<path
					d="M {Math.cos((targetAngle - 90 - timingWindow) * Math.PI / 180) * circleRadius} {Math.sin((targetAngle - 90 - timingWindow) * Math.PI / 180) * circleRadius} A {circleRadius} {circleRadius} 0 0 1 {Math.cos((targetAngle - 90 + timingWindow) * Math.PI / 180) * circleRadius} {Math.sin((targetAngle - 90 + timingWindow) * Math.PI / 180) * circleRadius}"
					fill="none"
					stroke="rgba(250, 204, 21, 0.5)"
					stroke-width="8"
					stroke-linecap="round"
				/>
			{/if}
			
			<!-- Digits around the circle -->
			{#each Array(10) as _, digit}
				{@const pos = getDigitPosition(digit)}
				{@const isTarget = gameStarted && !gameWon && !gameFailed && digit === targetDigit}
				<g transform="translate({pos.x}, {pos.y})">
					<text 
						class="font-mono font-bold {isTarget ? 'fill-yellow-400' : 'fill-green-500'}"
						text-anchor="middle" 
						dominant-baseline="middle"
						font-size="{isTarget ? '24' : '18'}"
					>
						{digit}
					</text>
				</g>
			{/each}
			
			<!-- Rotating cursor (square) -->
			{#if gameStarted && !gameWon && !gameFailed}
				{@const cursorPos = cursorPosition()}
				<g transform="translate({cursorPos.x}, {cursorPos.y}) rotate({angle})">
					<rect 
						x="-12" y="-12" 
						width="24" height="24" 
						fill="none" 
						stroke="#22c55e" 
						stroke-width="3"
						class="drop-shadow-lg"
					/>
					<rect 
						x="-8" y="-8" 
						width="16" height="16" 
						fill="rgba(34, 197, 94, 0.3)"
					/>
				</g>
			{/if}
		</svg>
		
		<!-- Center display -->
		<div class="absolute inset-0 flex items-center justify-center">
			<div class="text-center">
				{#if !gameStarted}
					<div class="text-green-500 font-mono text-lg animate-pulse">
						CLICK TO START
					</div>
				{:else if gameWon}
					<div class="text-green-400 font-mono">
						<div class="text-2xl mb-1">ACCESS</div>
						<div class="text-3xl font-bold">GRANTED</div>
					</div>
				{:else if gameFailed}
					<div class="text-red-500 font-mono">
						<div class="text-2xl mb-1">ACCESS</div>
						<div class="text-3xl font-bold">DENIED</div>
					</div>
				{:else}
					<div class="text-green-500/50 font-mono text-sm">
						HACKING...
					</div>
					<div class="text-yellow-400 font-mono text-3xl font-bold">
						{targetDigit}
					</div>
				{/if}
			</div>
		</div>
	</div>

	<!-- Instructions -->
	<div class="text-center z-10 font-mono">
		{#if !gameStarted}
			<p class="text-green-500/70 text-sm">
				Press <kbd class="px-2 py-1 bg-green-900/50 rounded border border-green-500/30">ENTER</kbd> 
				<kbd class="px-2 py-1 bg-green-900/50 rounded border border-green-500/30">SPACE</kbd> 
				or <kbd class="px-2 py-1 bg-green-900/50 rounded border border-green-500/30">TAP</kbd> 
				when the square aligns with the target digit
			</p>
		{:else if gameWon}
			<button 
				onclick={nextLevel}
				class="px-6 py-3 bg-green-600 hover:bg-green-500 text-black font-bold rounded transition-all"
			>
				NEXT LEVEL →
			</button>
		{:else if gameFailed}
			<button 
				onclick={restart}
				class="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded transition-all"
			>
				TRY AGAIN
			</button>
		{:else}
			<p class="text-green-500/50 text-xs">
				Hit the highlighted digit: <span class="text-yellow-400 text-lg">{targetDigit}</span>
			</p>
		{/if}
	</div>

	<!-- Progress bar -->
	{#if gameStarted && !gameWon && !gameFailed}
		<div class="w-64 h-2 bg-green-900/30 rounded-full overflow-hidden z-10">
			<div 
				class="h-full bg-green-500 transition-all duration-300"
				style="width: {(currentDigitIndex / ipAddress.replace(/\./g, '').length) * 100}%"
			></div>
		</div>
	{/if}

	<!-- Back Link -->
	<a 
		href="/games/maze" 
		class="text-green-500/50 hover:text-green-500 transition-colors mt-4 font-mono text-sm z-10"
		onclick={(e) => e.stopPropagation()}
	>
		← BACK TO GAMES
	</a>
</div>

<style>
	@keyframes fall {
		0% {
			transform: translateY(-100%);
			opacity: 1;
		}
		100% {
			transform: translateY(100vh);
			opacity: 0;
		}
	}
	
	.animate-fall {
		animation: fall linear infinite;
	}
</style>
