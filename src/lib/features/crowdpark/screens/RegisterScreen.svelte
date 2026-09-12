<script lang="ts">
	import AtSignIcon from '@lucide/svelte/icons/at-sign';
	import EyeIcon from '@lucide/svelte/icons/eye';
	import EyeOffIcon from '@lucide/svelte/icons/eye-off';
	import LockKeyholeIcon from '@lucide/svelte/icons/lock-keyhole';
	import UserIcon from '@lucide/svelte/icons/user';
	import * as Card from '$lib/components/ui/card';
	import * as Field from '$lib/components/ui/field';
	import * as InputGroup from '$lib/components/ui/input-group';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { signUp } from '$lib/features/crowdpark/api';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let showPassword = $state(false);
	let showConfirm = $state(false);
	let loading = $state(false);
	let error = $state('');

	const submit = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';
		if (password !== confirmPassword) { error = 'Passwords do not match.'; return; }
		if (!name.trim() || !email.trim() || !password) { error = 'Please fill in all fields.'; return; }
		loading = true;
		const { error: authError } = await signUp(email, password, name);
		loading = false;
		if (authError) {
			error = authError.message ?? 'Registration failed. Please try again.';
		} else {
			window.location.href = `/verify-otp?email=${encodeURIComponent(email)}`;
		}
	};
</script>

<svelte:head><title>Create Account · CrowdPark</title></svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10 md:bg-panel"
>
	<!-- Brand header -->
	<div class="mb-8 flex flex-col items-center gap-3">
		<div class="size-14 rounded-2xl bg-brand shadow-brand"></div>
		<div class="text-center">
			<p class="text-2xl font-medium tracking-[-0.04em]">CrowdPark</p>
			<p class="mt-0.5 text-sm text-muted-foreground">Smart parking for every commuter.</p>
		</div>
	</div>

	<Card.Root class="w-full max-w-[420px] [--card-spacing:--spacing(6)]">
		<Card.Header>
			<Card.Title class="text-xl">Create your account</Card.Title>
			<Card.Description>Join CrowdPark to find the best parking near your station</Card.Description>
		</Card.Header>

		<Card.Content>
			<form onsubmit={submit} class="flex flex-col gap-4" novalidate>
				<Field.FieldGroup>
					<!-- Full name -->
					<Field.Field>
						<Field.FieldLabel for="name">Full Name</Field.FieldLabel>
						<InputGroup.Root class="h-12">
							<InputGroup.Addon><UserIcon /></InputGroup.Addon>
							<InputGroup.Input
								id="name"
								type="text"
								placeholder="Your full name"
								required
								autocomplete="name"
								bind:value={name}
							/>
						</InputGroup.Root>
					</Field.Field>

					<!-- Email -->
					<Field.Field>
						<Field.FieldLabel for="email">Email</Field.FieldLabel>
						<InputGroup.Root class="h-12">
							<InputGroup.Addon><AtSignIcon /></InputGroup.Addon>
							<InputGroup.Input
								id="email"
								type="email"
								placeholder="your@email.com"
								required
								autocomplete="email"
								bind:value={email}
							/>
						</InputGroup.Root>
						<Field.FieldDescription>
							A 6-digit OTP will be sent to this address to verify your account.
						</Field.FieldDescription>
					</Field.Field>

					<!-- Password -->
					<Field.Field>
						<Field.FieldLabel for="password">Password</Field.FieldLabel>
						<InputGroup.Root class="h-12">
							<InputGroup.Addon><LockKeyholeIcon /></InputGroup.Addon>
							<InputGroup.Input
								id="password"
								type={showPassword ? 'text' : 'password'}
								placeholder="Min. 8 characters"
								required
								minlength={8}
								autocomplete="new-password"
								bind:value={password}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
								onclick={() => (showPassword = !showPassword)}
								aria-label={showPassword ? 'Hide password' : 'Show password'}
							>
								{#if showPassword}<EyeOffIcon />{:else}<EyeIcon />{/if}
							</Button>
						</InputGroup.Root>
					</Field.Field>

					<!-- Confirm password -->
					<Field.Field>
						<Field.FieldLabel for="confirm-password">Confirm Password</Field.FieldLabel>
						<InputGroup.Root class="h-12">
							<InputGroup.Addon><LockKeyholeIcon /></InputGroup.Addon>
							<InputGroup.Input
								id="confirm-password"
								type={showConfirm ? 'text' : 'password'}
								placeholder="Re-enter your password"
								required
								autocomplete="new-password"
								bind:value={confirmPassword}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
								onclick={() => (showConfirm = !showConfirm)}
								aria-label={showConfirm ? 'Hide password' : 'Show password'}
							>
								{#if showConfirm}<EyeOffIcon />{:else}<EyeIcon />{/if}
							</Button>
						</InputGroup.Root>
					</Field.Field>

					{#if error}
						<p class="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
					{/if}

					<Button type="submit" class="h-12 w-full shadow-brand" disabled={loading}>
						{loading ? 'Creating account…' : 'Create Account'}
					</Button>
				</Field.FieldGroup>
			</form>

			<div class="my-5 flex items-center gap-3">
				<Separator class="flex-1" />
				<span class="text-xs text-muted-foreground">or</span>
				<Separator class="flex-1" />
			</div>

			<Button
				variant="outline"
				class="h-12 w-full gap-3"
				onclick={() => alert('Google SSO — coming soon')}
			>
				<svg viewBox="0 0 24 24" class="size-5" aria-hidden="true">
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Continue with Google
			</Button>

			<p class="mt-5 text-center text-xs text-muted-foreground">
				By creating an account you agree to our
				<Button variant="link" class="h-auto p-0 text-xs">Terms of Service</Button>
				and
				<Button variant="link" class="h-auto p-0 text-xs">Privacy Policy</Button>.
			</p>
		</Card.Content>
	</Card.Root>

	<p class="mt-6 text-sm text-muted-foreground">
		Already have an account?
		<Button variant="link" href="/login" class="h-auto p-0 text-sm font-semibold text-brand-strong">
			Sign in
		</Button>
	</p>

	<p class="mt-8 text-center text-[10px] text-muted-foreground">
		CrowdPark AI v2.4 · Yogyakarta Transit Hub<br />Protected by End-to-End Encryption
	</p>
</div>
