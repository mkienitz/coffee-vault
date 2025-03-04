<script>
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/state';

	const { children } = $props();

	// Toaster
	const flash = getFlash(page);
	$effect(() => {
		if ($flash) {
			switch ($flash.type) {
				case 'success':
					toast.success($flash.message);
					break;
				case 'error':
					toast.error($flash.message);
					break;
			}
		}
	});
</script>

<!-- <Toaster richColors /> -->
<header>
	<nav class="flex items-end justify-between pt-4 pb-8">
		<a href="/" class="text-secondary-foreground text-5xl">CoffeeVault</a>
		<div class="space-x-4">
			<a href="/"><span class="text-xl">Coffees</span></a>
			<a href="/doses"><span class="text-xl">Doses</span></a>
		</div>
	</nav>
</header>
<main class="flex flex-col items-center">
	{@render children()}
</main>
