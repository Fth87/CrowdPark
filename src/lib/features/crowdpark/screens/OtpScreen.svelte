<script lang="ts">
	import { page } from '$app/state';
	import CheckCircleIcon from '@lucide/svelte/icons/circle-check';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ShieldIcon from '@lucide/svelte/icons/shield';
	import * as Card from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';

	const email = $derived(page.url.searchParams.get('email') ?? '');

	// 6 individual digit slots
	let digits = $state(['', '', '', '', '', '']);
	let inputs: HTMLInputElement[] = [];
	let loading = $state(false);
	let verified = $state(false);
	let error = $state('');
	let resendCountdown = $state(52);

	// Countdown timer
	$effect(() => {
		if (resendCountdown <= 0) return;
		const t = setInterval(() => {
			resendCountdown -= 1;
			if (resendCountdown <= 0) clearInterval(t);
		}, 1000);
		return () => clearInterval(t);
	});

	const handleDigit = (index: number, e: Event) => {
		const val = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(-1);
		digits[index] = val;
		if (val && index < 5) inputs[index + 1]?.focus();
	};

	const handleKeydown = (index: number, e: KeyboardEvent) => {
		if (e.key === 'Backspace' && !digits[index] && index > 0) {
			inputs[index - 1]?.focus();
		}
	};

	const handlePaste = (e: ClipboardEvent) => {
		const pasted = e.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
		pasted.split('').forEach((ch, i) => (digits[i] = ch));
		inputs[Math.min(pasted.length, 5)]?.focus();
		e.preventDefault();
	};

	import { verifyOtp, resendOtp } from '../api';

	const submit = async (e: SubmitEvent) => {
		e.preventDefault();
		error = '';
		const code = digits.join('');
		if (code.length < 6) {
			error = 'Please enter all 6 digits.';
			return;
		}
		loading = true;
		if (email) {
			const { error: verifyErr } = await verifyOtp(email, code);
			if (verifyErr) {
				loading = false;
				error = verifyErr.message ?? 'Invalid or expired OTP code.';
				return;
			}
		} else {
			await new Promise((r) => setTimeout(r, 600));
		}
		loading = false;
		verified = true;
		setTimeout(() => (window.location.href = '/'), 1200);
	};

	const resend = async () => {
		if (resendCountdown > 0) return;
		resendCountdown = 52;
		if (email) {
			await resendOtp(email);
		}
	};
</script>

<svelte:head><title>Verify OTP · CrowdPark</title></svelte:head>

<div
	class="flex min-h-screen flex-col items-center justify-center bg-surface px-4 py-10 md:bg-panel"
>
	<!-- Brand mark -->
	<div class="mb-8 flex flex-col items-center gap-3">
		<div class="size-14 rounded-2xl bg-brand shadow-brand"></div>
		<p class="text-2xl font-medium tracking-[-0.04em]">CrowdPark</p>
	</div>

	<Card.Root class="w-full max-w-[420px] text-center [--card-spacing:--spacing(6)]">
		<Card.Header class="items-center">
			{#if verified}
				<div
					class="mx-auto grid size-16 place-items-center rounded-full border border-success text-success"
				>
					<CheckCircleIcon class="size-7" />
				</div>
				<Card.Title class="mt-4 text-xl">Verified!</Card.Title>
				<Card.Description>Redirecting you to the app…</Card.Description>
			{:else}
				<div
					class="mx-auto grid size-16 place-items-center rounded-full border border-primary text-primary shadow-brand"
				>
					<ShieldIcon class="size-7" />
				</div>
				<Card.Title class="mt-4 text-xl">OTP Verification</Card.Title>
				<Card.Description class="max-w-[300px]">
					Enter the 6-digit code sent to
					{#if email}<b class="text-foreground">{email}</b>{:else}your email{/if}.
				</Card.Description>
			{/if}
		</Card.Header>

		{#if !verified}
			<Card.Content>
				<form onsubmit={submit} class="flex flex-col items-center gap-5">
					<!-- OTP digit inputs -->
					<div class="flex gap-2" onpaste={handlePaste}>
						{#each digits as digit, i}
							<input
								bind:this={inputs[i]}
								type="text"
								inputmode="numeric"
								maxlength={1}
								value={digit}
								oninput={(e) => handleDigit(i, e)}
								onkeydown={(e) => handleKeydown(i, e)}
								class="size-12 rounded-[14px] border border-border bg-background text-center text-xl font-bold tracking-[-0.04em] outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
								aria-label={`Digit ${i + 1} of 6`}
							/>
						{/each}
					</div>

					{#if error}
						<p class="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
					{/if}

					<Button type="submit" class="h-12 w-full shadow-brand" disabled={loading}>
						{loading ? 'Verifying…' : 'Verify OTP'}
					</Button>
				</form>

				<p class="mt-5 text-sm text-muted-foreground">
					Didn't receive a code?
					<Button
						variant="link"
						class="h-auto p-0 text-sm"
						onclick={resend}
						disabled={resendCountdown > 0}
					>
						{resendCountdown > 0 ? `Resend in ${resendCountdown}s` : 'Resend code'}
					</Button>
				</p>
			</Card.Content>
		{/if}
	</Card.Root>

	<p class="mt-6 text-sm text-muted-foreground">
		Wrong email?
		<Button variant="link" href="/register" class="h-auto p-0 text-sm">Go back</Button>
	</p>

	<Card.Root size="sm" class="mt-8 w-full max-w-[420px]">
		<Card.Header class="flex-row justify-center">
			<RotateCcwIcon class="text-muted-foreground" />
			<Card.Description>Protected by Google Identity & End-to-End Encryption</Card.Description>
		</Card.Header>
	</Card.Root>
</div>
