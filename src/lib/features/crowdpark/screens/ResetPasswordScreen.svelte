<script lang="ts">
	import AtSignIcon from '@lucide/svelte/icons/at-sign';
	import LockKeyholeIcon from '@lucide/svelte/icons/lock-keyhole';
	import RotateCcwKeyIcon from '@lucide/svelte/icons/rotate-ccw-key';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Button } from '$lib/components/ui/button';
	import AppChrome from '../components/AppChrome.svelte';
	import MobileHeader from '../components/MobileHeader.svelte';
	let email = $state('bebek@example.com');
	let sent = $state(false);
</script>

<svelte:head><title>Reset Password · CrowdPark</title></svelte:head>
<AppChrome active="profile" />
<MobileHeader title="Reset Password" eyebrow="CrowdPark" backHref="/profile" />
<main class="pb-mobile-nav mx-auto max-w-[620px] px-4 pt-5 text-center md:min-h-screen md:pt-28">
	<div
		class="mx-auto grid size-20 place-items-center rounded-full border border-primary text-primary shadow-brand"
	>
		<RotateCcwKeyIcon />
	</div>
	<h1 class="mt-7 text-[22px] font-bold">Reset Account Password</h1>
	<p class="mx-auto mt-2 max-w-[360px] text-sm leading-6 text-muted-foreground">
		Enter your registered email to receive an OTP verification code. We will send a 6-digit security
		code to verify your identity.
	</p>
	<Card.Root class="mt-5 text-left [--card-spacing:--spacing(5)]"
		><Card.Header class="sr-only"><Card.Title>Request password reset</Card.Title></Card.Header
		><Card.Content
			><form
				onsubmit={(e) => {
					e.preventDefault();
					sent = true;
				}}
			>
				<Field.FieldGroup
					><Field.Field
						><Field.FieldLabel for="email">Registered Email / WhatsApp Number</Field.FieldLabel
						><InputGroup.Root class="h-12"
							><InputGroup.Addon><AtSignIcon /></InputGroup.Addon><InputGroup.Input
								id="email"
								type="email"
								required
								bind:value={email}
							/></InputGroup.Root
						><Field.FieldDescription
							>Ensure this email is active and synced with real-time CrowdPark AI notifications.</Field.FieldDescription
						></Field.Field
					><Button type="submit" class="h-12 w-full shadow-brand"
						>{sent ? 'OTP Code Sent' : 'Send OTP Code'}</Button
					></Field.FieldGroup
				>
			</form></Card.Content
		></Card.Root
	>
	<p class="mt-5 text-sm text-muted-foreground">
		Didn't receive code?　<Button variant="link">Resend in 52 seconds</Button>
	</p>
	<p class="mt-5 text-sm font-bold text-muted-foreground">
		Need immediate assistance? Contact Commuter Support
	</p>
	<Card.Root size="sm" class="mt-7"
		><Card.Header class="flex-row justify-center"
			><LockKeyholeIcon /><Card.Description
				>Protected by Google Identity & End-to-End Encryption</Card.Description
			></Card.Header
		></Card.Root
	>
</main>
