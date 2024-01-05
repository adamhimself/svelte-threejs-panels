import * as THREE from 'three';
import { TransformControls } from 'three/examples/jsm/controls/TransformControls';

let transformControls: TransformControls;

export const initTransformControls = () => {
    transformControls = new TransformControls(camera, renderer.domElement);
    transformControls.setMode('rotate');
    transformControls.showX = false;
    transformControls.showY = false;
    transformControls.showZ = true;
}