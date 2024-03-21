<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import { Textarea } from '$lib/components/ui/textarea';
	import { getCountryCode, getEmojiFlag } from 'countries-list';
	import { coffeeSchema } from '$lib/schemas';
	import { superForm } from 'sveltekit-superforms';
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
	import { toast } from 'svelte-sonner';
	import { page } from '$app/stores';
	import { getFlash } from 'sveltekit-flash-message';

	export let data: PageData;

	const sForm = superForm(data.form, {
		resetForm: false,
		validators: zodClient(coffeeSchema)
	});
	const { form, enhance } = sForm;

	// Toaster
	const flash = getFlash(page);
	$: {
		if ($flash) {
			toast.success($flash.message);
		}
	}

	// Date Picker
	$: selectedRoastingDate = $form.roastingDate ? parseDate($form.roastingDate) : undefined;
	const df = new DateFormatter('en-DE', {
		dateStyle: 'long'
	});

	// Country
	$: selectedCountry = $form.country
		? {
				value: $form.country,
				label: $form.country
			}
		: undefined;
	let countryFlag: string;
	$: {
		let cc = getCountryCode($form.country);
		countryFlag = cc ? getEmojiFlag(cc) : '';
	}
</script>

<form id="coffeeForm" method="POST" use:enhance class={cn($$restProps.class, 'w-[540px]')}>
	<Card.Root>
		<Card.Header>
			<Card.Title>{!$form.id ? 'Add a new Coffee' : 'Edit existing Coffee'}</Card.Title>
			<Card.Description>highly controversial coffees are not desired</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<input hidden bind:value={$form.id} name="id" />
			<div class="flex flex-row space-x-4">
				<Form.Field form={sForm} name="name" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Name</Form.Label>
						<Input {...attrs} bind:value={$form.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={sForm} name="roaster" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Roaster</Form.Label>
						<Input {...attrs} bind:value={$form.roaster} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<div class="flex flex-row space-x-4">
				<Form.Field form={sForm} name="varietals" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Varietals</Form.Label>
						<Input {...attrs} bind:value={$form.varietals} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={sForm} name="process" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Process</Form.Label>
						<Input {...attrs} bind:value={$form.process} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<div>
				<div class="flex flex-row justify-between space-x-4">
					<Form.Field form={sForm} name="country" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Country</Form.Label>
							<Select.Root
								selected={selectedCountry}
								onSelectedChange={(v) => {
									v && ($form.country = v.value);
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
							<input hidden bind:value={$form.country} name={attrs.name} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={sForm} name="region" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Region</Form.Label>
							<Input {...attrs} bind:value={$form.region} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
				<div class="flex flex-row space-x-4">
					<Form.Field form={sForm} name="farm" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Farm</Form.Label>
							<Input {...attrs} bind:value={$form.farm} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
					<Form.Field form={sForm} name="elevation" class="w-1/2">
						<Form.Control let:attrs>
							<Form.Label>Elevation</Form.Label>
							<Input {...attrs} bind:value={$form.elevation} />
						</Form.Control>
						<Form.FieldErrors />
					</Form.Field>
				</div>
			</div>
			<Separator />
			<div class="flex flex-row space-x-4">
				<Form.Field form={sForm} name="weight" class="w-1/2">
					<Form.Control let:attrs>
						<Form.Label>Weight</Form.Label>
						<Input {...attrs} bind:value={$form.weight} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
				<Form.Field form={sForm} name="roastingDate" class="w-1/2">
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
										$form.roastingDate = v ? v.toString() : '';
									}}
								/>
							</Popover.Content>
						</Popover.Root>
						<input hidden value={$form.roastingDate} name={attrs.name} />
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>
			</div>
			<Separator />
			<Form.Field form={sForm} name="notes">
				<Form.Control let:attrs>
					<Form.Label>Notes</Form.Label>
					<Textarea
						{...attrs}
						placeholder="Add some notes"
						class="resize-none"
						bind:value={$form.notes}
					/>
				</Form.Control>
				<Form.FieldErrors />
			</Form.Field>
			<div class="flex flex-row justify-between">
				<Form.Button variant="secondary">{$form.id ? 'Edit Coffee' : 'Add Coffee'}</Form.Button>
				{#if $form.id}
					<AlertDialog.Root>
						<AlertDialog.Trigger
							><Button variant="destructive">Delete Coffee</Button></AlertDialog.Trigger
						>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. This will permanently delete the coffee.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<!-- https://github.com/shadcn-ui/ui/issues/709#issuecomment-1662586709 -->
								<AlertDialog.Action
									class={cn(buttonVariants({ variant: 'destructive' }))}
									form="coffeeForm"
									name="delete"
									type="submit">Delete</AlertDialog.Action
								>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>
</form>
