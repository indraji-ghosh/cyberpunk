import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { RGBShiftShader } from 'three/examples/jsm/shaders/RGBShiftShader';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import gsap from 'gsap';

// Create scene
const scene = new THREE.Scene();

//camera
const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#canvas'),
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;

// Post processing setup
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const rgbShiftPass = new ShaderPass(RGBShiftShader);
rgbShiftPass.uniforms['amount'].value = 0.0055;
composer.addPass(rgbShiftPass);



// Load HDRI environment map
new RGBELoader()
    .load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/pond_bridge_night_1k.hdr', function(texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
    });

// Load GLTF model
const loader = new GLTFLoader();
let model;

loader.load(
    './DamagedHelmet.gltf',
    function (gltf) {
        model = gltf.scene;
        scene.add(model);
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('An error occurred loading the model:', error);
    }
);


window.addEventListener('mousemove', (e)=>{
    if(model){
        const mouseX = (e.clientX / window.innerWidth) * 0.5;
        const mouseY = (e.clientY / window.innerHeight) * 0.5;
        
        gsap.to(model.rotation, {
            y: mouseX * Math.PI * 0.3,
            x: mouseY * Math.PI * 0.3,
            duration: 0.5,
            ease: "power2.out"
        });
    }
})


// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        // Add any model animations here if needed
    }
    composer.render(); // Use composer instead of renderer
}
animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Update composer size too
});
