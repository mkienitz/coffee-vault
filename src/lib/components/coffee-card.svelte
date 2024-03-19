<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { getCountryCode, getEmojiFlag } from 'countries-list';
	import type { z } from 'zod';
	import type { coffeeSchema } from '$lib/schemas';
	export let coffee: z.infer<typeof coffeeSchema>;
	const flag = getEmojiFlag(getCountryCode(coffee.country) || 'CO');
	const dummyWeight = Math.floor(Math.random() * coffee.weight);
</script>

<Card.Root class="w-[420px]">
	<Card.Header>
		<Card.Title class="flex flex-col space-y-1">
			<div class="flex flex-row items-center justify-between">
				<div class="text-2xl">{`${flag} ${coffee.name}`}</div>
				<Button href={`/coffees/${coffee.id}`} variant="link" class="p-0">Edit</Button>
			</div>
			<div class="text-sm text-muted-foreground">{coffee.roaster}</div>
		</Card.Title>
	</Card.Header>
	<Card.Content class="flex flex-col space-y-4">
		<div></div>
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
	<Card.Footer class="flex flex-row items-start justify-between">
		<div class="text-muted-foreground">Roasted: {coffee.roastingDate}</div>
		<div class="flex w-1/3 flex-col items-center space-y-1">
			<Progress value={(dummyWeight / coffee.weight) * 100} />
			<div class="text-sm text-muted-foreground">{dummyWeight}/{coffee.weight}g</div>
		</div>
	</Card.Footer>
</Card.Root>
