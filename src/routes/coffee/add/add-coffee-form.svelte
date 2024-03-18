<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Popover from '$lib/components/ui/popover';
	import { buttonVariants } from '$lib/components/ui/button';
	import { formSchema, type FormSchema } from './schema';
	import { type SuperValidated, type Infer, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { CalendarIcon } from 'lucide-svelte';
	import { cn } from '$lib/utils';
	import {
		CalendarDate,
		getLocalTimeZone,
		today,
		type DateValue,
		parseDate,
		DateFormatter
	} from '@internationalized/date';

	export let data: SuperValidated<Infer<FormSchema>>;

	const form = superForm(data, {
		validators: zodClient(formSchema)
	});

	const { form: formData, enhance } = form;

	// Date Picker
	let roastingDate: DateValue | undefined;
	$: roastingDate = $formData.roastingDate ? parseDate($formData.roastingDate) : undefined;
	const df = new DateFormatter('en-DE', {
		dateStyle: 'long'
	});
</script>

<form method="POST" use:enhance class="space-y-4">
	<Form.Field {form} name="name">
		<Form.Control let:attrs>
			<Form.Label>Name</Form.Label>
			<Input {...attrs} bind:value={$formData.name} />
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
						!roastingDate && 'text-muted-foreground'
					)}
				>
					{roastingDate ? df.format(roastingDate.toDate(getLocalTimeZone())) : 'Pick a date'}
					<CalendarIcon class="ml-auto h-4 w-4 opacity-50" />
				</Popover.Trigger>
				<Popover.Content side="bottom">
					<Calendar
						bind:value={roastingDate}
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
	<Form.Button>Submit</Form.Button>
</form>
