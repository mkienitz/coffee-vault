<script>
	import '@picocss/pico/css/pico.css';
	//import { Toaster } from '$lib/components/ui/sonner';
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

<!-- <Toaster richColors /> -->
<header>
	<nav>
		<ul>
			<li><a href="/"><h1>CoffeeVault</h1></a></li>
		</ul>
		<ul>
			<li><big><a href="#" class="contrast">Coffees</a></big></li>
			<li><big><a href="#" class="contrast">Doses</a></big></li>
		</ul>
	</nav>
</header>
<main>{@render children()}</main>
