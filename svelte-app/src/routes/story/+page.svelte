<script lang="ts">
	import { onMount } from 'svelte';

	const totalImages = 3;
	const imageExtension = '.png';
	const imagePath = '/images/';

	let currentIndex = 0;
	let imageLoaded = false;
	let imageError = false;
	let isTransitioning = false;

	$: currentImageSrc = `${imagePath}${currentIndex + 1}${imageExtension}`;
	$: currentNum = currentIndex + 1;

	function loadImage(index: number) {
		isTransitioning = true;
		imageLoaded = false;
		imageError = false;
		
		setTimeout(() => {
			currentIndex = index;
			isTransitioning = false;
		}, 300);
	}

	function nextImage() {
		if (currentIndex < totalImages - 1) {
			loadImage(currentIndex + 1);
		}
	}

	function prevImage() {
		if (currentIndex > 0) {
			loadImage(currentIndex - 1);
		}
	}

	function goToImage(index: number) {
		if (index >= 0 && index < totalImages) {
			loadImage(index);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowRight' || e.key === ' ') {
			e.preventDefault();
			nextImage();
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			prevImage();
		}
	}

	function handleImageLoad() {
		imageLoaded = true;
	}

	function handleImageError() {
		imageError = true;
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<svelte:head>
	<title>Galerie Poze</title>
</svelte:head>

<div class="min-h-screen flex flex-col justify-center items-center p-5 bg-bg-primary bg-gradient-to-b from-bg-primary to-[#0d0d14]">
	
	<!-- Gallery Container -->
	<div class="w-full max-w-6xl bg-bg-secondary rounded-3xl border border-border-custom p-8 animate-[slideIn_0.6s_ease-out]" style="box-shadow: 0 25px 80px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05);">
		
		<!-- Header -->
		<div class="text-center mb-8">
			<h1 class="text-3xl font-semibold tracking-tight mb-2 text-text-primary">Galerie</h1>
			<p class="text-text-secondary text-lg">Poza <span class="text-accent">{currentNum}</span> din <span>{totalImages}</span></p>
		</div>

		<!-- Image Display Area -->
		<div class="relative flex justify-center items-center mb-8">
			<div 
				class="w-full max-w-5xl min-h-[500px] bg-bg-tertiary rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500"
				class:opacity-0={isTransitioning}
				class:scale-95={isTransitioning}
				style="box-shadow: 0 10px 40px rgba(0,0,0,0.4);"
			>
				{#if imageError}
					<div class="text-text-secondary text-center p-8">
						<svg class="w-20 h-20 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
							<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
						</svg>
						<p class="text-lg">Imaginea {currentNum} nu a fost găsită</p>
						<p class="text-sm mt-2 opacity-60">Pune o imagine numită "{currentNum}" în folderul images/</p>
					</div>
				{:else}
					<img 
						src={currentImageSrc} 
						alt="Poza {currentNum}" 
						class="max-w-full max-h-[80vh] object-contain"
						class:hidden={!imageLoaded}
						on:load={handleImageLoad}
						on:error={handleImageError}
					/>
					{#if !imageLoaded}
						<div class="text-text-secondary text-center p-8">
							<svg class="w-20 h-20 mx-auto mb-4 opacity-30 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
								<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
							</svg>
							<p class="text-lg">Se încarcă imaginea...</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>

		<!-- Progress Dots -->
		<div class="flex justify-center gap-3 mb-8">
			{#each Array(totalImages) as _, i}
				<button 
					class="w-3 h-3 rounded-full border transition-all duration-300 hover:scale-110"
					class:bg-gradient-to-r={i === currentIndex}
					class:from-accent={i === currentIndex}
					class:to-accent-hover={i === currentIndex}
					class:scale-125={i === currentIndex}
					class:border-transparent={i === currentIndex}
					class:bg-bg-tertiary={i !== currentIndex}
					class:border-border-custom={i !== currentIndex}
					style={i === currentIndex ? "box-shadow: 0 0 15px rgba(255,107,74,0.5);" : ""}
					on:click={() => goToImage(i)}
					title="Poza {i + 1}"
				></button>
			{/each}
		</div>

		<!-- Navigation Buttons -->
		<div class="flex justify-center items-center gap-6">
			<button 
				class="px-8 py-4 bg-bg-tertiary border border-border-custom rounded-xl text-text-primary font-medium text-lg hover:border-accent hover:bg-bg-secondary hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-3 transition-all duration-300"
				disabled={currentIndex === 0}
				on:click={prevImage}
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
				</svg>
				Înapoi
			</button>
			
			<button 
				class="px-8 py-4 bg-gradient-to-r from-accent to-accent-hover rounded-xl text-white font-semibold text-lg flex items-center gap-3 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50"
				class:animate-pulse={currentIndex < totalImages - 1}
				disabled={currentIndex === totalImages - 1}
				on:click={nextImage}
			>
				{#if currentIndex === totalImages - 1}
					Finalizat
					<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
					</svg>
				{:else}
					Următoarea
					<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
					</svg>
				{/if}
			</button>
		</div>
	</div>

	<!-- Keyboard hint -->
	<p class="mt-6 text-text-secondary text-sm opacity-60">
		Folosește tastele ← → pentru navigare
	</p>
</div>

<style>
	@keyframes slideIn {
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}
</style>
