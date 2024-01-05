import * as THREE from 'three';

var scene: THREE.Scene;
var camera: THREE.Camera;

export const initScene = () => {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xa0a0a0);
    scene.fog = new THREE.Fog(0xa0a0a0, 4, 1000);
    return scene;
}

export const initCamera = () => {
    const frustumSize = 40;
    const aspect = window.innerWidth / window.innerHeight;
    camera = new THREE.OrthographicCamera(
        (frustumSize * aspect) / -2,
        (frustumSize * aspect) / 2,
        frustumSize / 2,
        frustumSize / -2,
        1,
        1000
    );
    camera.position.set(-20, 20, 0);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    return camera;
}

export const initDirectionalLight = () => {
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(0, 20, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.top = 2;
    directionalLight.shadow.camera.bottom = -2;
    directionalLight.shadow.camera.left = -2;
    directionalLight.shadow.camera.right = 2;
    return directionalLight;
}

export const initHemiLight = () => {
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 3);
    hemiLight.position.set(0, 20, 0);
    return hemiLight;
}