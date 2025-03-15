<script lang="ts">
	import { getFlash } from 'sveltekit-flash-message';
	import { toast, Toaster } from 'svelte-french-toast';
	import { page } from '$app/state';
	import { Menu } from 'lucide-svelte';

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

<Toaster />

{#snippet NavElem(pathname: string)}
	{@const path = `/${pathname.toLowerCase()}`}
	<li><a href={path} class={path === page.url.pathname ? 'underline font-bold' : ''}>{pathname}</a></li>
{/snippet}

{#snippet NavMenu()}
	{@render NavElem('Coffees')}
	{@render NavElem('Doses')}
	{@render NavElem('Brews')}
	{@render NavElem('Mystery')}
{/snippet}

<header>
	<div class="navbar mb-6 shadow-sm">
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<Menu />
				</div>
				<ul class="menu dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
					{@render NavMenu()}
				</ul>
			</div>
			<a href="/" class="btn btn-ghost text-xl no-underline">CoffeeVault</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				{@render NavMenu()}
			</ul>
		</div>
		<div class="navbar-end">
			<a href="/login" class="btn">Login</a>
		</div>
	</div>
</header>
<main class="flex flex-col items-center">
	{@render children()}
</main>
