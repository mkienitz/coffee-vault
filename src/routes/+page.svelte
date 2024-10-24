<script lang="ts">
	import { goto } from '$app/navigation';
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Table from '$lib/components/ui/table';
	import { ArrowDownZa, ArrowUpAz, MoveLeft, MoveRight, X } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import type { CoffeeWithDoses } from '$lib/schemas';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data } = $props();
	const coffees = $state(data.coffees);

	type CoffeeKey = keyof CoffeeWithDoses;

	// FILTERING
	type Filter = { key: CoffeeKey; value: CoffeeWithDoses[CoffeeKey] };
	let filters: Filter[] = $state([]);
	let filteredCoffees = $derived(
		coffees.filter((coffee) => {
			return !filters.some(({ key, value }) => coffee[key] !== value);
		})
	);

	// SORTING
	let sortedBy: { key: CoffeeKey; ascending: boolean } = $state({
		key: 'roastingDate',
		ascending: true
	});

	let sortedCoffees = $derived(
		filteredCoffees.toSorted((a, b) => {
			if (a[sortedBy.key] === b[sortedBy.key]) {
				return 0;
			}
			if (a[sortedBy.key] < b[sortedBy.key]) {
				return sortedBy.ascending ? -1 : 1;
			} else {
				return sortedBy.ascending ? 1 : -1;
			}
		})
	);

	// PAGINATION
	const pageSize = 15;
	const nPages = $derived(Math.ceil(filteredCoffees.length / pageSize));
	let currPage = $state(data.page);
	$effect(() => {
		currPage = Math.min(data.page, nPages);
	});

	let paginatedCoffees = $derived(
		sortedCoffees.slice((currPage - 1) * pageSize, (currPage - 1) * pageSize + pageSize)
	);
	$effect(() => {
		goto(`?page=${currPage}`);
	});
</script>

{#snippet tableHead(fieldName: CoffeeKey, headerName: string | undefined = undefined)}
	<Table.Head>
		<Button
			variant="ghost"
			onclick={() => {
				if (sortedBy.key == fieldName) {
					sortedBy.ascending = !sortedBy.ascending;
				}
				sortedBy.key = fieldName;
			}}
			>{headerName ?? fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}
			{#if sortedBy.key === fieldName}
				{#if sortedBy.ascending}
					<ArrowUpAz />
				{:else}
					<ArrowDownZa />
				{/if}
			{/if}
		</Button>
	</Table.Head>
{/snippet}

<div>
	<div class="flex flex-col items-center space-y-4">
		<div class="flex w-full flex-row justify-between">
			<Pagination.Root
				count={filteredCoffees.length}
				perPage={pageSize}
				bind:page={currPage}
				let:pages
				let:currentPage
			>
				<Pagination.Content>
					<Pagination.Item>
						<Pagination.PrevButton>
							<MoveLeft />
						</Pagination.PrevButton>
					</Pagination.Item>
					{#each pages as page (page.key)}
						{#if page.type === 'ellipsis'}
							<Pagination.Item>
								<Pagination.Ellipsis />
							</Pagination.Item>
						{:else}
							<Pagination.Item>
								<Pagination.Link {page} isActive={currentPage == page.value}>
									{page.value}
								</Pagination.Link>
							</Pagination.Item>
						{/if}
					{/each}
					<Pagination.Item>
						<Pagination.NextButton>
							<MoveRight />
						</Pagination.NextButton>
					</Pagination.Item>
				</Pagination.Content>
			</Pagination.Root>
		</div>
		<div class="flex w-full flex-row justify-between">
			<div class="space-x-2">
				{#each filters as filter}
					<button>
						<Badge variant="secondary"
							>{filter.value}<X
								class="size-4"
								onclick={() => filters.splice(filters.indexOf(filter))}
							/></Badge
						>
					</button>
				{/each}
				<Button
					variant="secondary"
					onclick={() => {
						filters = [];
					}}>Reset Filters</Button
				>
			</div>
			<Button href="/coffees">Add Coffee</Button>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{@render tableHead('name')}
					{@render tableHead('country')}
					{@render tableHead('varietals')}
					{@render tableHead('roaster')}
					{@render tableHead('process')}
					{@render tableHead('roastingDate', 'Roasted')}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each paginatedCoffees as coffee (coffee.id)}
					<Table.Row class="content-center">
						<Table.Cell
							><Button variant="link" href="/coffees/{coffee.id}/doses">{coffee.name}</Button
							></Table.Cell
						>
						<Table.Cell>
							<Button
								variant="ghost"
								onclick={() => {
									filters.push({ key: 'country', value: coffee.country });
								}}
							>
								{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.country}`}
							</Button>
						</Table.Cell>
						<Table.Cell
							><Button
								variant="ghost"
								onclick={() => {
									filters.push({ key: 'varietals', value: coffee.varietals });
								}}>{coffee.varietals}</Button
							></Table.Cell
						>
						<Table.Cell
							><Button
								variant="ghost"
								onclick={() => {
									filters.push({ key: 'roaster', value: coffee.roaster });
								}}>{coffee.roaster}</Button
							></Table.Cell
						>
						<Table.Cell class="text-center">
							<HoverCard.Root>
								<HoverCard.Trigger target="_blank">
									<Badge variant="outline" class="bg-pink-600">washed</Badge>
								</HoverCard.Trigger>
								<HoverCard.Content class="w-fit text-center"
									><span class="text-sm">{coffee.process}</span></HoverCard.Content
								>
							</HoverCard.Root>
						</Table.Cell>
						<Table.Cell class="text-center">{coffee.roastingDate}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
