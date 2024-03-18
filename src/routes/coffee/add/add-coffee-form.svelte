<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import * as Select from '$lib/components/ui/select';
	import { Input } from '$lib/components/ui/input';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Card from '$lib/components/ui/card';
	import { buttonVariants } from '$lib/components/ui/button';
	import { countries } from 'countries-list';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
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

	const countryNames = Object.values(countries).map((country) => {
		return {
			value: country.name,
			label: country.name
		};
	});
</script>

<form method="POST" use:enhance class={cn('space-y-4', $$restProps.class)}>
	<Card.Root>
		<Card.Header>
			<Card.Title>Add a new Coffee</Card.Title>
			<Card.Description>highly controverse coffees are not desired</Card.Description>
		</Card.Header>
		<Card.Content>
			<Form.Field {form} name="name">
				<Form.Control let:attrs>
					<Form.Label>Name</Form.Label>
					<Input {...attrs} bind:value={$formData.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="roaster">
				<Form.Control let:attrs>
					<Form.Label>Roaster</Form.Label>
					<Input {...attrs} bind:value={$formData.roaster} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="varietals">
				<Form.Control let:attrs>
					<Form.Label>Varietals</Form.Label>
					<Input {...attrs} bind:value={$formData.varietals} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="country">
				<Form.Control let:attrs>
					<Form.Label>Country</Form.Label>
					<Select.Root
						selected={selectedCountry}
						onSelectedChange={(v) => {
							v && ($formData.country = v.value);
						}}
					>
						<Select.Trigger {...attrs}>
							<Select.Value placeholder="Select the origin country" />
						</Select.Trigger>
						<Select.Content class="max-h-48 overflow-y-auto">
							{#each countryNames as countryName}
								<Select.Item {...countryName} />
							{/each}
						</Select.Content>
					</Select.Root>
					<input hidden bind:value={$formData.country} name={attrs.name} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="region">
				<Form.Control let:attrs>
					<Form.Label>Region</Form.Label>
					<Input {...attrs} bind:value={$formData.region} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="farm">
				<Form.Control let:attrs>
					<Form.Label>Farm</Form.Label>
					<Input {...attrs} bind:value={$formData.farm} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="process">
				<Form.Control let:attrs>
					<Form.Label>Process</Form.Label>
					<Input {...attrs} bind:value={$formData.process} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="elevation">
				<Form.Control let:attrs>
					<Form.Label>Elevation</Form.Label>
					<Input {...attrs} bind:value={$formData.elevation} />
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="weight">
				<Form.Control let:attrs>
					<Form.Label>Weight</Form.Label>
					<Input {...attrs} type="number" step=0.5 bind:value={$formData.weight} />
					<Form.Description>initial bag weight in grams</Form.Description>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<Form.Field {form} name="roastingDate" class="flex flex-col">
				<Form.Control let:attrs>
					<Form.Label>Roasting Date</Form.Label>
					<Popover.Root>
						<Popover.Trigger
							{...attrs}
							class={cn(
								buttonVariants({ variant: 'outline' }),
								'w-[280px] justify-start pl-4 text-left font-normal',
								!selectedRoastingDate && 'text-muted-foreground'
							)}
						>
							{selectedRoastingDate
								? df.format(selectedRoastingDate.toDate(getLocalTimeZone()))
								: 'Pick a date'}
							<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
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
		</Card.Content>
		<Card.Footer>
			<Form.Button>Submit</Form.Button>
		</Card.Footer>
	</Card.Root>
</form>
