<script lang="ts">
	import { onMount } from 'svelte';

	// Game state
	let maze: number[][] = $state([]);
	let playerPos = $state({ x: 1, y: 1 });
	let exitPos = $state({ x: 0, y: 0 });
	let gameWon = $state(false);
	let gameStarted = $state(false);
	let timer = $state(0);
	let timerInterval: ReturnType<typeof setInterval> | null = null;
	let mazeSize = $state(15); // Odd number for proper maze generation
	let moves = $state(0);

	// Maze generation using recursive backtracking
	function generateMaze(size: number): number[][] {
		// 0 = wall, 1 = path
		const grid: number[][] = Array(size).fill(null).map(() => Array(size).fill(0));
		
		function carve(x: number, y: number) {
			const directions = [
				[0, -2], [0, 2], [-2, 0], [2, 0]
			].sort(() => Math.random() - 0.5);

			grid[y][x] = 1;

			for (const [dx, dy] of directions) {
				const nx = x + dx;
				const ny = y + dy;

				if (nx > 0 && nx < size - 1 && ny > 0 && ny < size - 1 && grid[ny][nx] === 0) {
					grid[y + dy / 2][x + dx / 2] = 1;
					carve(nx, ny);
				}
			}
		}

		carve(1, 1);
		return grid;
	}

	function startGame() {
		maze = generateMaze(mazeSize);
		playerPos = { x: 1, y: 1 };
		
		// Reset exit position and find new one (bottom-right corner area)
		let foundExit = false;
		for (let y = mazeSize - 2; y > 0 && !foundExit; y--) {
			for (let x = mazeSize - 2; x > 0 && !foundExit; x--) {
				if (maze[y][x] === 1) {
					exitPos = { x, y };
					foundExit = true;
				}
			}
		}
		
		gameWon = false;
		gameStarted = true;
		timer = 0;
		moves = 0;
		
		if (timerInterval) clearInterval(timerInterval);
		timerInterval = setInterval(() => {
			timer++;
		}, 1000);
	}

	function movePlayer(dx: number, dy: number) {
		if (!gameStarted || gameWon) return;
		
		const newX = playerPos.x + dx;
		const newY = playerPos.y + dy;

		if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && maze[newY][newX] === 1) {
			playerPos = { x: newX, y: newY };
			moves++;

			if (newX === exitPos.x && newY === exitPos.y) {
				gameWon = true;
				if (timerInterval) clearInterval(timerInterval);
			}
		}
	}

	function handleCellClick(x: number, y: number) {
		if (!gameStarted || gameWon) return;
		
		// Ignore clicks on walls
		if (maze[y][x] === 0) return;
		
		// Check if clicked cell is adjacent to player
		const dx = x - playerPos.x;
		const dy = y - playerPos.y;
		
		// Only allow moving to adjacent cells (not diagonal)
		if ((Math.abs(dx) === 1 && dy === 0) || (Math.abs(dy) === 1 && dx === 0)) {
			movePlayer(dx, dy);
		} else {
			// Clicked on a non-adjacent path - restart the game
			startGame();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowUp':
			case 'w':
			case 'W':
				e.preventDefault();
				movePlayer(0, -1);
				break;
			case 'ArrowDown':
			case 's':
			case 'S':
				e.preventDefault();
				movePlayer(0, 1);
				break;
			case 'ArrowLeft':
			case 'a':
			case 'A':
				e.preventDefault();
				movePlayer(-1, 0);
				break;
			case 'ArrowRight':
			case 'd':
			case 'D':
				e.preventDefault();
				movePlayer(1, 0);
				break;
			case 'r':
			case 'R':
				startGame();
				break;
		}
	}

	function formatTime(seconds: number): string {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
			if (timerInterval) clearInterval(timerInterval);
		};
	});
</script>

<svelte:head>
	<title>Maze Game</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-4 gap-6">
	<h1 class="text-4xl font-bold text-white mb-2">Maze Game</h1>
	
	<!-- Game Stats -->
	<div class="flex gap-8 text-white text-lg">
		<div class="bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
			<span class="text-purple-300">Time:</span> {formatTime(timer)}
		</div>
		<div class="bg-white/10 px-4 py-2 rounded-lg backdrop-blur">
			<span class="text-purple-300">Moves:</span> {moves}
		</div>
	</div>

	<!-- Difficulty Selection -->
	{#if !gameStarted}
		<div class="flex flex-col items-center gap-4">
			<p class="text-white/70">Select difficulty:</p>
			<div class="flex gap-3">
				<button 
					onclick={() => { mazeSize = 11; startGame(); }}
					class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-green-500/30"
				>
					Easy (11x11)
				</button>
				<button 
					onclick={() => { mazeSize = 15; startGame(); }}
					class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-yellow-500/30"
				>
					Medium (15x15)
				</button>
				<button 
					onclick={() => { mazeSize = 21; startGame(); }}
					class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-red-500/30"
				>
					Hard (21x21)
				</button>
			</div>
		</div>
	{/if}

	<!-- Maze Grid -->
	{#if gameStarted}
		<div 
			class="bg-slate-800/50 p-2 rounded-xl backdrop-blur border border-white/10 shadow-2xl"
			style="display: grid; grid-template-columns: repeat({mazeSize}, 1fr); gap: 1px;"
		>
			{#each maze as row, y}
				{#each row as cell, x}
					<div 
						class="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-sm transition-all duration-150 {cell === 0 ? 'bg-slate-700' : 'bg-slate-600/50 cursor-pointer hover:bg-slate-500/50'} {x === exitPos.x && y === exitPos.y ? 'bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse' : ''}"
						onclick={() => handleCellClick(x, y)}
					>
						{#if x === playerPos.x && y === playerPos.y}
							<div class="w-full h-full bg-purple-500 rounded-full shadow-lg shadow-purple-500/50 flex items-center justify-center">
								<div class="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
							</div>
						{/if}
						{#if x === exitPos.x && y === exitPos.y && !(x === playerPos.x && y === playerPos.y)}
							<div class="w-full h-full flex items-center justify-center text-sm sm:text-base md:text-lg">
								🚪
							</div>
						{/if}
					</div>
				{/each}
			{/each}
		</div>

		<!-- Controls Info -->
		<div class="text-white/60 text-sm text-center">
			<p>Use <kbd class="px-2 py-1 bg-white/10 rounded">Arrow Keys</kbd> or <kbd class="px-2 py-1 bg-white/10 rounded">WASD</kbd> to move</p>
			<p class="mt-1">Press <kbd class="px-2 py-1 bg-white/10 rounded">R</kbd> to restart</p>
		</div>

		<!-- Mobile Controls -->
		<div class="grid grid-cols-3 gap-2 sm:hidden">
			<div></div>
			<button onclick={() => movePlayer(0, -1)} class="w-14 h-14 bg-white/10 rounded-lg text-white text-2xl active:bg-white/20">↑</button>
			<div></div>
			<button onclick={() => movePlayer(-1, 0)} class="w-14 h-14 bg-white/10 rounded-lg text-white text-2xl active:bg-white/20">←</button>
			<button onclick={() => movePlayer(0, 1)} class="w-14 h-14 bg-white/10 rounded-lg text-white text-2xl active:bg-white/20">↓</button>
			<button onclick={() => movePlayer(1, 0)} class="w-14 h-14 bg-white/10 rounded-lg text-white text-2xl active:bg-white/20">→</button>
		</div>

		<!-- New Game Button -->
		<button 
			onclick={startGame}
			class="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-purple-500/30"
		>
			New Maze
		</button>
	{/if}

	<!-- Win Modal -->
	{#if gameWon}
		<div class="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
			<div class="bg-slate-800 p-8 rounded-2xl text-center border border-white/10 shadow-2xl max-w-sm mx-4">
				<div class="text-6xl mb-4">🎉</div>
				<h2 class="text-3xl font-bold text-white mb-4">You Won!</h2>
				<div class="text-white/70 mb-6 space-y-2">
					<p>Time: <span class="text-emerald-400 font-semibold">{formatTime(timer)}</span></p>
					<p>Moves: <span class="text-emerald-400 font-semibold">{moves}</span></p>
				</div>
				<button 
					onclick={startGame}
					class="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all shadow-lg"
				>
					Play Again
				</button>
			</div>
		</div>
	{/if}

	<!-- Back Link -->
	<a href="/" class="text-white/50 hover:text-white transition-colors mt-4">
		← Back to Home
	</a>
</div>
