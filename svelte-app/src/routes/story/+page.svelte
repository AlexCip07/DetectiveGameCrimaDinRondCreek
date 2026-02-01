<script lang="ts">
	import { onMount } from 'svelte';

	const totalImages = 3;
	const imageExtension = '.png';
	const imagePath = '/images/';

	let currentIndex = 0;
	let imageLoaded = false;
	let imageError = false;
	let isTransitioning = false;
	let actionSent = false;

	$: currentImageSrc = `${imagePath}${currentIndex + 1}${imageExtension}`;
	$: currentNum = currentIndex + 1;

	// When reaching photo 3 (index 2), save photo action
	$: if (currentIndex === 2 && !actionSent) {
		savePhotoAction();
	}

	async function savePhotoAction() {
		if (actionSent) return;
		actionSent = true;
		
		try {
			await fetch('/api/photo-actions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					action: 1,
					done: false
				})
			});
		} catch (error) {
			console.error('Error saving photo action:', error);
		}
	}

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
	<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="font-inter min-h-screen flex justify-center items-center p-5" style="background: linear-gradient(to bottom right, #1f2937, #374151, #1f2937);">
	
	<!-- Phone Frame -->
	<div class="rounded-[55px] p-3 relative" style="background: linear-gradient(145deg, #1a1a1a 0%, #0d0d0d 100%); box-shadow: 0 50px 100px rgba(0, 0, 0, 0.5), 0 0 0 2px #2a2a2a, inset 0 0 0 1px rgba(255, 255, 255, 0.05);">
		
		<!-- Phone Screen -->
		<div class="w-[375px] h-[812px] rounded-[45px] overflow-hidden relative bg-black">
			
			<!-- Status Bar -->
			<div class="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-8 pt-4 text-white text-sm font-medium">
				<span class="text-[15px]">{new Date().toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
				
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
						<path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.9-2.3l1.4 1.4C9.4 18 10.6 18.5 12 18.5s2.6-.5 3.5-1.4l1.4-1.4c-1.3-1.3-3.1-2.1-4.9-2.1s-3.6.8-4.9 2.1zM12 10c-3 0-5.7 1.2-7.7 3.2l1.4 1.4c1.6-1.6 3.8-2.6 6.3-2.6s4.7 1 6.3 2.6l1.4-1.4C17.7 11.2 15 10 12 10z"/>
					</svg>
					<div class="flex items-center gap-0.5">
						<div class="w-6 h-3 border border-white rounded-sm flex items-center p-0.5">
							<div class="w-4 h-1.5 bg-green-500 rounded-sm"></div>
						</div>
						<div class="w-0.5 h-1.5 bg-white rounded-r-sm"></div>
					</div>
				</div>
			</div>

			<!-- Header with back button -->
			<div class="absolute top-12 left-0 right-0 z-40 px-4 pt-2 pb-3">
				<div class="flex items-center gap-3">
					<a href="/" class="text-blue-500 flex items-center gap-1">
						<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
						</svg>
					</a>
					<h1 class="text-white text-xl font-semibold flex-1">Poze</h1>
					<span class="text-gray-400 text-sm">{currentNum}/{totalImages}</span>
				</div>
			</div>

			<!-- Gallery Content -->
			<div class="absolute inset-0 pt-24 pb-20 px-4 flex flex-col">
				
				<!-- Image Display -->
				<div class="flex-1 flex items-center justify-center">
					<div 
						class="w-full h-full bg-gray-900 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300"
						class:opacity-0={isTransitioning}
						class:scale-95={isTransitioning}
					>
						{#if imageError}
							<div class="text-gray-500 text-center p-6">
								<svg class="w-16 h-16 mx-auto mb-4 opacity-30" fill="currentColor" viewBox="0 0 24 24">
									<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
								</svg>
								<p class="text-sm">Imaginea {currentNum} nu a fost găsită</p>
							</div>
						{:else}
							<img 
								src={currentImageSrc} 
								alt="Poza {currentNum}" 
								class="w-full h-full object-contain"
								class:hidden={!imageLoaded}
								on:load={handleImageLoad}
								on:error={handleImageError}
							/>
							{#if !imageLoaded}
								<div class="text-gray-500 text-center">
									<svg class="w-12 h-12 mx-auto animate-pulse opacity-30" fill="currentColor" viewBox="0 0 24 24">
										<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
									</svg>
								</div>
							{/if}
						{/if}
					</div>
				</div>

				<!-- Progress Dots -->
				<div class="flex justify-center gap-2 py-4">
					{#each Array(totalImages) as _, i}
						<button 
							class="w-2 h-2 rounded-full transition-all duration-300"
							class:bg-white={i === currentIndex}
							class:scale-125={i === currentIndex}
							class:bg-gray-600={i !== currentIndex}
							on:click={() => goToImage(i)}
						></button>
					{/each}
				</div>

				<!-- Navigation Buttons -->
				<div class="flex justify-center items-center gap-4">
					<button 
						class="w-14 h-14 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
						disabled={currentIndex === 0}
						on:click={prevImage}
					>
						<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
						</svg>
					</button>
					
					<button 
						class="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-95"
						class:bg-gradient-to-r={currentIndex < totalImages - 1}
						class:from-orange-500={currentIndex < totalImages - 1}
						class:to-pink-500={currentIndex < totalImages - 1}
						class:bg-green-500={currentIndex === totalImages - 1}
						on:click={nextImage}
					>
						{#if currentIndex === totalImages - 1}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
							</svg>
						{:else}
							<svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
							</svg>
						{/if}
					</button>
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
</style>
