<script lang="ts">
	import { goto } from '$app/navigation';
	import { getCountryCode, getEmojiFlag, type TCountryCode } from 'countries-list';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Table from '$lib/components/ui/table';
	import { ArrowDownZa, ArrowUpAz, MoveLeft, MoveRight } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import type { CoffeeWithDoses } from '$lib/schemas';
	import { Button } from '$lib/components/ui/button/index.js';

	type SortingFunction = (a: CoffeeWithDoses, b: CoffeeWithDoses) => number;
	let sortedBy = $state('roastingDate');
	let ascending = $state(true);

	const createSortingFunction: (fieldName: string) => SortingFunction = (fieldName) => {
		return (c1, c2) => {
			const accessor = (coffee: CoffeeWithDoses) => coffee[fieldName as keyof typeof coffee];
			if (accessor(c1) === accessor(c2)) {
				return 0;
			}
			if (accessor(c1) < accessor(c2)) {
				return ascending ? -1 : 1;
			} else {
				return ascending ? 1 : -1;
			}
		};
	};

	const sortBy = (fieldName: string) => {
		if (sortedBy === fieldName) {
			ascending = !ascending;
		}
		sortedBy = fieldName;
	};

	let currentSortingFunction: SortingFunction = $derived(createSortingFunction(sortedBy));

	type Filter = (coffee: CoffeeWithDoses) => boolean;
	let currentFilter: Filter = $state((_) => true);

	let { data } = $props();
	const coffees = $state(data.coffees);

	// Pagination
	const pageSize = 15;
	const nPages = $derived(Math.ceil(coffees.length / pageSize));
	let currPage = $state(Math.min(data.page, nPages));

	let filteredCoffees = $derived(coffees.filter(currentFilter));

	let currCoffees = $derived(
		filteredCoffees
			.toSorted(currentSortingFunction)
			.slice((currPage - 1) * pageSize, (currPage - 1) * pageSize + pageSize)
	);
	$effect(() => {
		goto(`?page=${currPage}`);
	});
</script>

{#snippet tableHead(headerName: string, fieldName: string)}
	<Table.Head>
		<Button
			variant="ghost"
			onclick={() => {
				sortBy(fieldName);
			}}
			>{headerName}
			{#if sortedBy === fieldName}
				{#if ascending}
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
				count={coffees.length}
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
			<Button
				variant="secondary"
				onclick={() => {
					currentFilter = (_) => true;
				}}>Reset Filters</Button
			>
			<Button href="/coffees">Add Coffee</Button>
		</div>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					{@render tableHead('Name', 'name')}
					{@render tableHead('Country', 'country')}
					{@render tableHead('Variety', 'varietals')}
					{@render tableHead('Roaster', 'roaster')}
					{@render tableHead('Process', 'process')}
					{@render tableHead('Roast Date', 'roastingDate')}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each currCoffees as coffee (coffee.id)}
					<Table.Row class="content-center">
						<Table.Cell
							><Button variant="link" href="/coffees/{coffee.id}/doses">{coffee.name}</Button
							></Table.Cell
						>
						<Table.Cell>
							<Button
								variant="ghost"
								onclick={() => {
									currentFilter = (c) => c.country === coffee.country;
								}}
							>
								{`${getEmojiFlag(getCountryCode(coffee.country) as TCountryCode)} ${coffee.country}`}
							</Button>
						</Table.Cell>
						<Table.Cell
							><Button
								variant="ghost"
								onclick={() => {
									currentFilter = (c) => c.varietals === coffee.varietals;
								}}>{coffee.varietals}</Button
							></Table.Cell
						>
						<Table.Cell
							><Button
								variant="ghost"
								onclick={() => {
									currentFilter = (c) => c.roaster === coffee.roaster;
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
