<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	async function importPanel() {
		const response = await fetch('https://localhost:5218/panels/with-optimiser/import', {
			method: 'POST',
			headers: {
				'Context-Type': 'application/json'
			}
		});
		console.log('importing panel');
	}
</script>

<h1>Asset management</h1>
<button on:click={importPanel} type="button" class="btn variant-filled"
	>Import panel with Optimiser</button
>
