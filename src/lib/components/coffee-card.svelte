<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { getCountryCode, getEmojiFlag } from 'countries-list';
	import type { z } from 'zod';
	import type { coffeeSchema } from '$lib/schemas';
	import { cn } from '$lib/utils';
	import { Separator } from '$lib/components/ui/separator';
	import { Badge } from '$lib/components/ui/badge';
	let { coffee }: { coffee: z.infer<typeof coffeeSchema> } = $props();
	const flag = getEmojiFlag(getCountryCode(coffee.country) || 'CO');
	const dummyWeight = Math.floor(Math.random() * coffee.weight);
</script>

<Card.Root class={'flex w-[400px] flex-col'}>
	<Card.Header class="pb-0">
		<Card.Title class="flex flex-col space-y-1">
			<div class="flex flex-row items-center justify-between">
				<div class="text-2xl">{`${flag} ${coffee.name}`}</div>
				<Button href={`/coffees/${coffee.id}`} variant="link" class="h-fit w-fit p-0">Edit</Button>
			</div>
			<div class="flex flex-row items-center justify-between">
				<small class="text-muted-foreground">{coffee.roaster}</small>
				<small class="text-muted-foreground">{coffee.roastingDate}</small>
			</div>
		</Card.Title>
	</Card.Header>
	<Separator class="my-3" />
	<Card.Content class="flex grow flex-col space-y-4 pb-0">
		<div class="flex flex-col space-y-1">
			<div class="font-bold">Origin</div>
			<div class="text-sm">{coffee.farm}, {coffee.region}, {coffee.country}</div>
		</div>
		<div class="flex flex-col space-y-1">
			<div class="font-bold">Varietals</div>
			<div class="text-sm">{coffee.varietals}</div>
		</div>
		<div class="flex flex-col space-y-1">
			<div class="font-bold">Process</div>
			<div class="text-sm">{coffee.process}</div>
		</div>
	</Card.Content>
	<Separator class="my-3" />
	<Card.Footer class="flex w-full flex-row justify-between justify-self-end">
		<div>
			<Badge variant="outline">some</Badge>
			<Badge variant="outline">badges</Badge>
		</div>
		<div class="flex flex-row items-center space-x-1">
			<Progress class="w-[80px]" value={(dummyWeight / coffee.weight) * 100} />
			<div class="text-sm text-muted-foreground">{dummyWeight}/{coffee.weight}g</div>
		</div>
	</Card.Footer>
</Card.Root>
