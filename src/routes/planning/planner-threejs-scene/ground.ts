import * as THREE from 'three';


export const initGround = () => {
    const gridSize = 40;
    const numberOfGridDivisions = 40;
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(gridSize, gridSize),
        new THREE.MeshPhongMaterial({ color: 0xcbcbcb, depthWrite: false })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    return ground;
}