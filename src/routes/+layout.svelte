<script lang="ts">
	import '../app.css';
	// import { getFlash } from 'sveltekit-flash-message';
	// import { toast, Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import Check from 'lucide-svelte/icons/check';
	import ChevronDown from 'lucide-svelte/icons/chevron-down';
	import Menu from 'lucide-svelte/icons/menu';
	import Palette from 'lucide-svelte/icons/palette';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	const { children, data } = $props();

	// Theme selector
	let prefersDark = $state(false);
	onMount(() => {
		const media = window.matchMedia('(prefers-color-scheme: dark)');
		prefersDark = media.matches;
		const listener = (e: MediaQueryListEvent) => {
			prefersDark = e.matches;
		};
		media.addEventListener('change', listener);
		// Remove listener upon unmount (should never happen)
		return () => {
			media.removeEventListener('change', listener);
		};
	});
	$effect(() => {
		if (!selectedTheme) {
			selectedTheme = prefersDark ? 'dark' : 'light';
		}
	});

	let selectedTheme = $derived(data.selectedTheme);
	$effect(() => {
		if (browser && selectedTheme) {
			document.cookie = `theme=${selectedTheme}; path=/; max-age=31536000; SameSite=Lax`;
		}
	});

	// Toaster
	// TODO Use custom toaster
	// const flash = getFlash(page);
	// $effect(() => {
	// 	if ($flash) {
	// 		switch ($flash.type) {
	// 			case 'success':
	// 				toast.success($flash.message);
	// 				break;
	// 			case 'error':
	// 				toast.error($flash.message);
	// 				break;
	// 		}
	// 	}
	// });
</script>

<!-- TODO Use custom toaster -->
<!-- <Toaster /> -->

{#snippet NavElem(name: string, path: string)}
	{@const isActive = path === page.url.pathname}
	<a
		href={path}
		aria-current={isActive ? 'page' : undefined}
		class="inline-flex h-10 items-center border-b-2 px-1 text-sm font-medium transition-colors {isActive
			? 'border-primary text-base-content'
			: 'text-base-content/65 hover:text-base-content border-transparent'}">{name}</a
	>
{/snippet}

{#snippet NavMenu()}
	{@render NavElem('Coffees', resolve('/'))}
	{@render NavElem('Table', resolve('/coffees'))}
	{@render NavElem('Doses', resolve('/doses'))}
	{@render NavElem('Brews', resolve('/brews'))}
{/snippet}

<header>
	<nav
		class="bg-base-100/95 border-base-300 fixed top-0 right-0 left-0 z-50 border-b px-4 backdrop-blur sm:px-6 lg:px-8"
	>
		<div class="relative flex h-16 w-full items-center justify-between gap-4">
			<div class="flex min-w-0 items-center gap-3">
				<div class="dropdown">
					<div tabindex="0" role="button" class="btn btn-ghost btn-sm lg:hidden">
						<Menu />
					</div>
					<div
						class="dropdown-content bg-base-100 border-base-300 rounded-box z-1 mt-3 flex w-48 flex-col gap-1 border p-3 shadow-lg"
					>
						{@render NavMenu()}
					</div>
				</div>
				<a
					href={resolve('/')}
					class="text-base-content truncate font-mono text-xl font-semibold tracking-tight no-underline sm:text-2xl"
					>CoffeeVault</a
				>
			</div>

			<div class="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
				{@render NavMenu()}
			</div>

			<div class="dropdown dropdown-end">
				<div tabindex="0" role="button" class="btn btn-ghost btn-sm">
					<Palette />
					<ChevronDown />
				</div>
				<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
				<ul
					tabindex="-1"
					class="menu dropdown-content bg-base-300 rounded-box z-1 w-52 p-2 shadow-2xl"
				>
					{#each ['light', 'dark', 'coffee'] as theme}
						<li>
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name="theme-dropdown"
									class="theme-controller hidden"
									value={theme}
									bind:group={selectedTheme}
								/>
								<span class="flex-1 capitalize">{theme}</span>
								<span class="flex h-4 w-4 items-center justify-center">
									{#if selectedTheme === theme}
										<Check class="h-4 w-4" />
									{/if}
								</span>
							</label>
						</li>
					{/each}
				</ul>
			</div>
			<!-- <a href="/login" class="btn btn-sm sm:btn-md">Login</a> -->
		</div>
	</nav>
</header>
<main class="flex min-h-screen w-full flex-col items-center px-4 pt-20 pb-8 sm:px-6 lg:px-8">
	{@render children()}
</main>
