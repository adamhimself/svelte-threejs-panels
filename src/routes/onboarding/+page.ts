import { orchEndpoint } from '$lib/endpoints';
import type { PageLoad } from './$types';
import type { OrchResponseDto } from './orchResponseDto';

export const load = (async ({ fetch }) => {
    const response = await fetch(`${orchEndpoint}`);
    const res: OrchResponseDto = await response.json();
    return {
        res
    };
}) satisfies PageLoad;