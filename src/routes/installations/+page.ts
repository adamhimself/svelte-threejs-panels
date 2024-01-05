import { getInstallersUrl } from '$lib/endpoints';
import type { PageLoad } from './$types';
import type { InstallerDto } from './InstallerDto';

export const load = (async ({ fetch }) => {
    console.log('I guess im running?');
    console.log(getInstallersUrl);
    // const response = await fetch(`${getInstallersUrl}`);
    // const installersArr: InstallerDto[] = await response.json();

    // return {
    //     installers: installersArr
    // };
}) satisfies PageLoad;