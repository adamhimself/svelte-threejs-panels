<script lang="ts">
	import '../app.postcss';
	import {
		AppShell,
		AppBar,
		ListBox,
		ListBoxItem,
		AppRail,
		AppRailAnchor,
		AppRailTile,
		Modal,
		Toast
	} from '@skeletonlabs/skeleton';
	let currentTile: number = 0;

	import { initializeStores } from '@skeletonlabs/skeleton';

	initializeStores();
</script>

<Toast />
<Modal />
<!-- App Shell -->
<AppShell>
	<svelte:fragment slot="header">
		<!-- App Bar -->
		<AppBar>
			<svelte:fragment slot="lead">
				<strong class="text-xl uppercase">Lovely Lumens <i class="fa-solid fa-sun" /></strong>
			</svelte:fragment>

			<svelte:fragment slot="trail">
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://discord.gg/EXqV7W8MtY"
					target="_blank"
					rel="noreferrer"
				>
					Discord
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://twitter.com/SkeletonUI"
					target="_blank"
					rel="noreferrer"
				>
					Twitter
				</a>
				<a
					class="btn btn-sm variant-ghost-surface"
					href="https://github.com/skeletonlabs/skeleton"
					target="_blank"
					rel="noreferrer"
				>
					GitHub
				</a>
			</svelte:fragment>
		</AppBar>
	</svelte:fragment>

	<svelte:fragment slot="sidebarLeft" />
	<!-- Page Route Content -->
	<slot />
</AppShell>
