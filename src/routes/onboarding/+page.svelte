<script lang="ts">
	import type { PageData } from './$types';
	import PollingView from './PollingView.svelte';

	export let data: PageData;
</script>

<h1 class="h1">Onboarding</h1>

<h1>{data.res.id}</h1>

<PollingView statusUrl={data.res.statusQueryGetUri} />
