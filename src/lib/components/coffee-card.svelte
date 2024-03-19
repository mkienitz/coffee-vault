<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Button } from '$lib/components/ui/button';
	import { getCountryCode, getEmojiFlag } from 'countries-list';
	import type { z } from 'zod';
	import type { coffeeSchema } from '$lib/schemas';
	export let coffee: z.infer<typeof coffeeSchema>;
	let flag = getEmojiFlag(getCountryCode(coffee.country) || 'CO');
</script>

<Card.Root class="w-80">
	<Card.Header>
		<Card.Title class="flex items-center justify-between">
			{`${flag} ${coffee.name}`}
			<Button href={`/coffees/${coffee.id}`} variant="link">Edit</Button>
		</Card.Title>
		<Card.Description>Card Description</Card.Description>
	</Card.Header>
	<Card.Content>
		<Progress value={100} />
		<Card.Description>{coffee.weight}/{coffee.weight}g</Card.Description>
	</Card.Content>
	<Card.Footer>
		<p>Card Footer</p>
	</Card.Footer>
</Card.Root>
