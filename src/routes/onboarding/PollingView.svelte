<script lang="ts">
	import { onMount } from 'svelte';
	import type { StatusTextDto } from './StatusTextDto';
	import { ProgressRadial } from '@skeletonlabs/skeleton';

	export let statusUrl: string;

	let statusText: StatusTextDto;
	let step: number = 0;
	async function fetchData() {
		try {
			const res = await fetch(statusUrl);
			if (res.ok) {
				statusText = await res.json();
			} else {
			}
		} catch (error) {}
	}

	onMount(() => {
		fetchData(); // Fetch immediately on component mount
		var intervalId = setInterval(fetchData, 500); // Fetch every 5 seconds

		return () => {
			clearInterval(intervalId); // Clear the interval when the component is destroyed
		};
	});
</script>

{#if statusText != undefined}
	{#if parseInt(statusText.customStatus.split(';')[0]) >= 0}
		<h2>{statusText.customStatus}</h2>
		<ProgressRadial />
	{/if}

	{#if parseInt(statusText.customStatus.split(';')[0]) >= 1}
		<h2>{statusText.customStatus}</h2>
		<ProgressRadial />
	{/if}

	{#if parseInt(statusText.customStatus.split(';')[0]) >= 2}
		<h2>{statusText.customStatus}</h2>
		<ProgressRadial />
	{/if}
{/if}
