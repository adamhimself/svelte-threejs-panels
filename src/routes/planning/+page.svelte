<script lang="ts">
	import { onMount } from 'svelte';
	import { getToastStore, ProgressRadial, type ToastSettings } from '@skeletonlabs/skeleton';
	import { onboardInstallationPostUrl } from '$lib/endpoints';
	import {
		initCamera,
		initDirectionalLight,
		initHemiLight,
		initScene
	} from './planner-threejs-scene/planner-scene';
	import * as THREE from 'three';
	import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
	import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

	import Layout from '../+layout.svelte';
	import type { PanelPosition } from './PanelPosition';
	import { initGround } from './planner-threejs-scene/ground';

	const toastStore = getToastStore();

	const minRotationX = THREE.MathUtils.degToRad(-45); // -45 degrees limit
	const maxRotationX = THREE.MathUtils.degToRad(45); // 45 degrees limit

	let scene: THREE.Scene;
	let camera: THREE.Camera;
	let renderer: THREE.Renderer;
	let controls: OrbitControls;
	let transformControls: TransformControls;
	let scenePanels: object[] = [];
	let panels: PanelPosition[] = [];
	let ground: THREE.Mesh;
	let raycaster = new THREE.Raycaster();
	let mouse = new THREE.Vector2();

	let mesh;

	const gridSize = 100;
	const numberOfGridDivisions = 50;
	const gridSquareSize = gridSize / numberOfGridDivisions;

	let isDrawingEnabled = false;
	let isDragging = false;
	let startPoint = new THREE.Vector3();
	let endPoint = new THREE.Vector3();
	let boundingBoxOutline: THREE.LineSegments;

	let mouseX = 0;
	let mouseY = 0;
	let group;

	onMount(() => {
		init();
		animate();
	});

	function init() {
		scene = initScene();
		camera = initCamera();

		const hemiLight = initHemiLight();
		scene.add(hemiLight);

		const directionalLight = initDirectionalLight();
		scene.add(directionalLight);

		// ground

		ground = initGround();
		scene.add(ground);

		const grid = new THREE.GridHelper(gridSize, numberOfGridDivisions, 0x000000, 0x000000);
		grid.material.opacity = 0.2;
		grid.material.transparent = true;
		scene.add(grid);

		const geometry = new THREE.BoxGeometry();
		const material = new THREE.MeshPhongMaterial({ vertexColors: true });

		// color vertices based on vertex positions
		const colors = geometry.getAttribute('position').array.slice();
		for (let i = 0, l = colors.length; i < l; i++) {
			if (colors[i] > 0) colors[i] = 0.5;
			else colors[i] = 0;
		}

		geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3, false));

		mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.position.y = 0.5;
		scenePanels = [...scenePanels, mesh];
		scene.add(mesh);

		renderer = new THREE.WebGLRenderer({ antialias: true });
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;

		controls = new OrbitControls(camera, renderer.domElement);
		controls.enabled = true;

		transformControls = new TransformControls(camera, renderer.domElement);
		transformControls.setMode('rotate');
		transformControls.showX = false;
		transformControls.showY = false;
		transformControls.showZ = true;

		group = new THREE.Group();
		scene.add(group);

		const plannerContainer = document.getElementById('planner-container');

		if (plannerContainer) {
			plannerContainer.appendChild(renderer.domElement);
		}

		window.addEventListener('resize', onWindowResize);

		// Attach the correct event handlers to the plannerContainer
		plannerContainer.addEventListener('mousedown', onMouseDown); // For mouse down events
		plannerContainer.addEventListener('mouseup', onMouseUp); // Optionally for mouse up events
		plannerContainer.addEventListener('mousemove', onMouseMove);
		window.addEventListener('keydown', onDocumentKeyDown, false);
		window.addEventListener('keyup', onDocumentKeyUp, false);

		window.addEventListener('keydown', function (event) {
			switch (event.code) {
				case 'KeyE':
					isDrawingEnabled = !isDrawingEnabled;

					break;
				case 'KeyR':
					transformControls.setMode('rotate');
					break;
			}
		});

		animate();
	}

	function onDocumentKeyDown(event) {
		if (event.keyCode === 16) {
			// 16 is the key code for Shift
			controls.enabled = true;
		}
	}

	function onDocumentKeyUp(event) {
		if (event.keyCode === 16) {
			// 16 is the key code for Shift
			controls.enabled = false;
		}
	}

	const onMouseDown = (e: MouseEvent) => {
		isDragging = true;
		updateRayCasterPosition(e);
		const intersects = raycaster.intersectObject(ground);
		if (intersects.length > 0) {
			// Get the first intersection point
			const intersectPoint = intersects[0].point;
			startPoint = snapToGrid(intersectPoint);
			intersectPoint;
		}
	};

	const onMouseMove = (e: MouseEvent) => {
		if (!isDragging) return;
		updateRayCasterPosition(e);

		const intersects = raycaster.intersectObject(ground);
		if (intersects.length > 0) {
			const intersectPoint = intersects[0].point;
			endPoint = snapToGrid(intersectPoint);
			drawBoundingBoxOutline();

			if (!isDrawingEnabled) return;

			addBoxesToCoveredGridSquares();
		}
	};

	const onMouseUp = (event) => {
		if (!isDragging) return;
		isDragging = false;
		const intersects = raycaster.intersectObject(ground);
		if (intersects.length > 0) {
			// Get the first intersection point
			const intersectPoint = intersects[0].point;
			endPoint = intersectPoint;
			//drawBoundingBoxOutline(intersectPoint);
		}

		let mousePos = getWorldPosition(event);
		// Finalize the bounding box and populate with boxes
	};

	const calculateBoundingBox = () => {
		// Calculate the size based on startPoint and endPoint
		const size = new THREE.Vector3(
			Math.abs(endPoint.x - startPoint.x),
			Math.abs(endPoint.y - startPoint.y),
			Math.abs(endPoint.z - startPoint.z)
		);

		// Calculate the mid-point for setting the position
		const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);

		return { size, midPoint };
	};

	const drawBoundingBoxOutline = (currentPos: THREE.Vector3) => {
		console.log('drawing bound box');
		const { size, midPoint } = calculateBoundingBox();
		const testSize = new THREE.Vector3(5, 0, 10);

		const geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
		//const geometry = new THREE.BoxGeometry(testSize.x, testSize.y, testSize.z);
		const edges = new THREE.EdgesGeometry(geometry);
		const material = new THREE.LineBasicMaterial({ color: 0x21799c });

		// If boundingBoxOutline already exists, just update its geometry and position
		if (boundingBoxOutline) {
			boundingBoxOutline.geometry.dispose(); // Dispose old geometry
			boundingBoxOutline.geometry = edges;
			boundingBoxOutline.position.set(midPoint.x, midPoint.y, midPoint.z);
		} else {
			// If boundingBoxOutline does not exist, create a new one
			boundingBoxOutline = new THREE.LineSegments(edges, material);
			boundingBoxOutline.position.set(midPoint.x, midPoint.y, midPoint.z);
			scene.add(boundingBoxOutline);
		}
	};

	const snapToGrid = (point) => {
		return new THREE.Vector3(
			Math.round(point.x / gridSquareSize) * gridSquareSize,
			point.y, // Assuming y-axis is not needed to be snapped (as it's a ground plane)
			Math.round(point.z / gridSquareSize) * gridSquareSize
		);
	};

	const addBoxesToCoveredGridSquares = () => {
		// Calculate the range of grid squares covered by the bounding box
		const minX = Math.floor(Math.min(startPoint.x, endPoint.x) / gridSquareSize);
		const maxX = Math.floor(Math.max(startPoint.x, endPoint.x) / gridSquareSize);
		const minZ = Math.floor(Math.min(startPoint.z, endPoint.z) / gridSquareSize);
		const maxZ = Math.floor(Math.max(startPoint.z, endPoint.z) / gridSquareSize);

		for (let x = minX; x <= maxX; x++) {
			for (let z = minZ; z <= maxZ; z++) {
				// Create a box for each grid square
				const cubeGeometry = new THREE.BoxGeometry(1.6, 0.04, 1); // Adjust size as needed
				const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x181721 }); // Change color as needed

				const solarPanel = new THREE.Mesh(cubeGeometry, cubeMaterial);
				solarPanel.castShadow = true;

				// Calculate the center position for the box
				const boxPositionX = x * gridSquareSize + gridSquareSize / 2;
				const boxPositionZ = z * gridSquareSize + gridSquareSize / 2;

				let newPanel: PanelPosition = { x: boxPositionX, y: boxPositionZ };

				if (panels.some((panel) => panel.x === newPanel.x && panel.y === newPanel.y)) {
					// Panel with the same position already exists, so don't add
				} else {
					// Panel with the same position does not exist, so you can add it
					panels.push(newPanel);
					// Position the box
					solarPanel.position.set(boxPositionX, 0.5, boxPositionZ); // Adjust Y position as needed
					transformControls.attach(solarPanel);
					scene.add(transformControls);
					scene.add(solarPanel);

					// Set the azimuth and tilt angles (convert degrees to radians if necessary)
					const azimuthAngleInDegrees = 40; // example value
					const tiltAngleInDegrees = 35; // example value

					solarPanel.rotation.y = THREE.MathUtils.degToRad(azimuthAngleInDegrees);
					solarPanel.rotation.z = THREE.MathUtils.degToRad(tiltAngleInDegrees);
				}
			}
		}
	};

	function getWorldPosition(event) {
		const rect = renderer.domElement.getBoundingClientRect();
		const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
		// Experiment with this value, ensuring it's between the camera's near and far planes
		const depthValue = 0.5;

		const vector = new THREE.Vector3(x, depthValue, y);
		vector.unproject(camera);
		return vector;
	}

	const updateRayCasterPosition = (event: any) => {
		const rect = renderer.domElement.getBoundingClientRect();
		mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
		mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

		// Update the raycaster with the camera and mouse position
		raycaster.setFromCamera(mouse, camera);
	};

	const onWindowResize = () => {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	};

	const animate = () => {
		requestAnimationFrame(animate);
		controls.update();
		renderer.render(scene, camera);
	};

	const onboardInstallation = async () => {
		console.log('onboarding');
		let url = onboardInstallationPostUrl('3fa85f64-5717-4562-b3fc-2c963f66afa6');
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					installationId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
					scannedPanelIds: ['3fa85f64-5717-4562-b3fc-2c963f66afa6']
				})
			});
		} catch (error) {}
	};
</script>

<h1 class="h1">Plan Installation</h1>
<h2>X: {mouseX}, y: {mouseY}</h2>
<p>panels: {panels.length}</p>
<p>drawing: {isDrawingEnabled ? 'enabled' : 'disabled'}</p>
<!-- Display the panel count -->
<div id="planner-container" class="flex" style="width: 100%; height: 100%">
	<!-- <div class="toolbar">
		<button type="button" on:click={onboardInstallation} class="btn-icon variant-filled"
			>onboard</button
		>

		<h2>Construction type</h2>
		<div class="btn-group variant-filled">
			<button>Sloped roof</button>
			<button>Flat roof</button>
			<button>East-West</button>
		</div>

		<h2>Panel Orientation</h2>
		<div class="btn-group variant-filled">
			<button>Portrait</button>
			<button>Landscape</button>
		</div>

		<h2>Rotation</h2>

		<label for="tilt-degree">Tilt Degree:</label>
		<input
			id="tilt-degree"
			class="input"
			title="tilt degree"
			aria-label="tilt degree"
			type="number"
		/>

		<label for="azimuth-degree">Azimuth Degree:</label>
		<input
			id="azimuth-degree"
			class="input"
			title="azimuth degree"
			aria-label="azimuth degree"
			type="number"
		/>

		<h2>Panel type</h2>
		<select class="select">
			<option value="1">BenQ SunForte PM096B00-335 W</option>
			<option value="2">Trina HoneyM TSM-335DE06M.08(II)</option>
			<option value="3">LG MonoX Plus LG295S1C-A5</option>
			<option value="4">Victron 55W-12V Mono</option>
		</select>

		<h2>Inverter type</h2>
		<select class="select">
			<option value="1">GoodWe GW17KN-DT</option>
			<option value="2">GoodWe GW6000D-NS</option>
			<option value="3">HUAWEI Single phase Residental solar inverter SUN2000L-3.68KTL-L1</option>
			<option value="4">KOSTAL PIKO MP PLUS 2.5-1</option>
		</select>

		<h3>Panel Count: {panelCount}</h3>
		<h3>Capacity: {panelCount * 300} kW</h3>
		{#if isLoadingValidation}
			<h3>Validating</h3>
			<ProgressRadial ... stroke={100} meter="stroke-primary-500" track="stroke-primary-500/30" />
		{/if}
	</div> -->
	<div id="canvas-container" />
</div>

<style>
	.h1,
	h3 {
		margin: 2rem;
	}

	#canvas-container {
		height: 100%;
		width: 100%;
	}

	#mycanvas {
		background: radial-gradient(circle, rgb(255, 255, 255) 0%, rgb(112, 126, 250) 100%);
	}

	html {
		height: 100%;
	}
	body {
		margin: 0;
		padding: 0;
		height: 100%;
		overflow: hidden;
		cursor: none;
	}

	.toolbar {
		flex-direction: column;
		width: 15rem;
		padding: 1rem;
	}
</style>
