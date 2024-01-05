export const baseUrl = 'http://localhost:5000/api/';

export const getInstallersUrl = 'http://localhost:5000/api/installers';

export const getInstallationsUrl = baseUrl + 'installations';

export const orchEndpoint = 'http://localhost:7018/api/OnboardingOrchestrator_HttpStart';

export const onboardInstallationPostUrl = (id: string) => `${baseUrl}installations/${id}/onboard`;

