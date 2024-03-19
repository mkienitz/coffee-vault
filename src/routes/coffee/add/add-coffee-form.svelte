<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Separator } from '$lib/components/ui/separator';
	import * as Card from '$lib/components/ui/card';
	import { buttonVariants } from '$lib/components/ui/button';
	import { getCountryCode, getEmojiFlag } from 'countries-list';
	import { formSchema } from './schema';
	import SuperDebug, { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { CalendarIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import {
		CalendarDate,
		getLocalTimeZone,
		today,
		parseDate,
		DateFormatter
	} from '@internationalized/date';
	import type { PageData } from './$types';
	import { browser } from '$app/environment';

	export let data: PageData;

	const form = superForm(data.form, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;

	// Date Picker
	$: selectedRoastingDate = $formData.roastingDate ? parseDate($formData.roastingDate) : undefined;
	const df = new DateFormatter('en-DE', {
		dateStyle: 'long'
	});

	// Country
	$: selectedCountry = $formData.country
		? {
				value: $formData.country,
				label: $formData.country
			}
		: undefined;
	let countryFlag: string;
	$: {
		let cc = getCountryCode($formData.country);
		countryFlag = cc ? getEmojiFlag(cc) : '';
	}
</script>

<form method="POST" use:enhance class={cn($$restProps.class)}>
	<Card.Root>
		<Card.Header>
			<Card.Title>Add a new Coffee</Card.Title>
			<Card.Description>highly controversial coffees are not desired</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex flex-row space-x-4">
				<Form.Field {form} name="name" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input {...attrs} bind:value={$formData.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="roaster" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Roaster</Form.Label>
						<Input {...attrs} bind:value={$formData.roaster} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<div class="flex flex-row space-x-4">
				<Form.Field {form} name="varietals" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Varietals</Form.Label>
						<Input {...attrs} bind:value={$formData.varietals} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="process" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Process</Form.Label>
						<Input {...attrs} bind:value={$formData.process} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<div>
				<div class="flex flex-row justify-between space-x-4">
					<Form.Field {form} name="country" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Country</Form.Label>
							<Select.Root
								selected={selectedCountry}
								onSelectedChange={(v) => {
									v && ($formData.country = v.value);
								}}
							>
								<Select.Trigger
									{...attrs}
									class="justify-between space-x-1 text-ellipsis text-start"
								>
									<div>{countryFlag}</div>
									<Select.Value placeholder="Select the origin country" class="w-full" />
								</Select.Trigger>
								<Select.Content class="max-h-72 overflow-y-auto">
									{#each data.countryNames as countryName}
										<Select.Item {...countryName} />
									{/each}
								</Select.Content>
							</Select.Root>
							<input hidden bind:value={$formData.country} name={attrs.name} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="region" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Region</Form.Label>
							<Input {...attrs} bind:value={$formData.region} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="flex flex-row space-x-4">
					<Form.Field {form} name="farm" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Farm</Form.Label>
							<Input {...attrs} bind:value={$formData.farm} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field {form} name="elevation" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Elevation</Form.Label>
							<Input {...attrs} bind:value={$formData.elevation} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<Separator />
			<div class="flex flex-row space-x-4">
				<Form.Field {form} name="weight" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Weight</Form.Label>
						<Input {...attrs} bind:value={$formData.weight} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field {form} name="roastingDate" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Roasting Date</Form.Label>
						<Popover.Root>
							<Popover.Trigger
								{...attrs}
								class={cn(
									buttonVariants({ variant: 'outline' }),
									'w-full justify-between font-normal',
									!selectedRoastingDate && 'text-muted-foreground'
								)}
							>
								<div>
									{selectedRoastingDate
										? df.format(selectedRoastingDate.toDate(getLocalTimeZone()))
										: 'Pick a date'}
								</div>
								<CalendarIcon class="h-4 w-4 opacity-50" />
							</Popover.Trigger>
							<Popover.Content side="bottom">
								<Calendar
									bind:value={selectedRoastingDate}
									minValue={new CalendarDate(1900, 1, 1)}
									maxValue={today(getLocalTimeZone())}
									calendarLabel="Roasting date"
									initialFocus
									onValueChange={(v) => {
										$formData.roastingDate = v ? v.toString() : '';
									}}
								/>
							</Popover.Content>
						</Popover.Root>
						<input hidden value={$formData.roastingDate} name={attrs.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<Form.Field {form} name="notes">
				<Form.Control let:attrs>
					<Form.Label>Notes</Form.Label>
					<Textarea
						{...attrs}
						placeholder="Add some notes"
						class="resize-none"
						bind:value={$formData.notes}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</Card.Content>
		{#if browser}
			<SuperDebug data={$formData} />
		{/if}
	</Card.Root>
</form>
