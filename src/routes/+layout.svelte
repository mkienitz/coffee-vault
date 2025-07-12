<script lang="ts">
	import '../app.css';
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
	<li>
		<a href={path} class="text-lg {path === page.url.pathname ? 'font-bold underline' : ''}"
			>{pathname}</a
		>
	</li>
{/snippet}

{#snippet NavMenu()}
	{@render NavElem('Coffees')}
	{@render NavElem('Doses')}
	{@render NavElem('Brews')}
	{@render NavElem('Mystery')}
{/snippet}

<header>
	<nav
		class="navbar bg-base-100 fixed top-0 right-0 left-0 z-50 h-16 px-4 shadow-sm sm:px-6 lg:px-8"
	>
		<div class="navbar-start">
			<div class="dropdown">
				<div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
					<Menu />
				</div>
				<ul
					class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
				>
					{@render NavMenu()}
				</ul>
			</div>
			<a href="/" class="btn btn-ghost font-mono text-xl no-underline sm:text-2xl">CoffeeVault</a>
		</div>
		<div class="navbar-center hidden lg:flex">
			<ul class="menu menu-horizontal px-1">
				{@render NavMenu()}
			</ul>
		</div>
		<div class="navbar-end">
			<a href="/login" class="btn btn-sm sm:btn-md">Login</a>
		</div>
	</nav>
</header>
<main class="flex min-h-screen w-full flex-col items-center px-4 pt-20 pb-8 sm:px-6 lg:px-8">
	{@render children()}
</main>
