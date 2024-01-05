<script lang="ts">
	import { getModalStore, type ModalComponent, type ModalSettings } from '@skeletonlabs/skeleton';
	import type { PageData } from './$types';
	import ModalList from './ModalList.svelte';
	const modalStore = getModalStore();
	export let data: PageData;
	const modalComponent: ModalComponent = {
		// Pass a reference to your custom component
		ref: ModalList,
		// Add the component properties as key/value pairs
		props: { background: 'bg-red-500' },
		// Provide a template literal for the default component slot
		slot: '<p>Skeleton</p>'
	};

	const modal: ModalSettings = {
		type: 'component',
		// Pass the component directly:
		component: modalComponent
	};
	modalStore.trigger(modal);

	const openModel = () => {
		console.log('opening modal');
		modalStore.trigger(modal);
	};
	modalStore.trigger(modal);
</script>

<div class="p-16">
	<h1 class="h1 header mb-16">Installation {data.id}</h1>
	<button on:click={openModel} type="button" class="btn variant-ghost-secondary">
		<span>(icon)</span>
		<span>Scan panels</span>
	</button>
</div>
