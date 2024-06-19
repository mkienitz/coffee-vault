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
<div class="container flex flex-col items-center space-y-10 pb-10 pt-10">
	<a href="/"><h1 class="text-5xl">CoffeeVault</h1></a>
	{@render children()}
</div>
