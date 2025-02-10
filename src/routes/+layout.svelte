<script>
	import '../app.pcss';
	import { Toaster } from '$lib/components/ui/sonner';
	import { getFlash } from 'sveltekit-flash-message';
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';

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

<Toaster richColors />
<header>
	<nav class="flex items-end justify-between pb-8 pt-4">
		<a href="/" class="text-5xl text-secondary-foreground">CoffeeVault</a>
		<div class="space-x-4">
			<a href="/"><span class="text-xl">Coffees</span></a>
			<a href="/doses"><span class="text-xl">Doses</span></a>
		</div>
	</nav>
</header>
<main>
	{@render children()}
</main>
