import * as THREE from "three";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a simple sphere to represent the world
const geometry = new THREE.SphereGeometry(1, 32, 32);
const material = new THREE.MeshBasicMaterial({ color: 0x0077ff, wireframe: true });
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

// Set initial camera position
camera.position.z = 5;

// Orbit control parameters
let angle = 0;   // Initial angle
const radius = 5;  // Orbit radius

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera position to orbit diagonally
  angle += 0.01;  // Adjust speed here
  camera.position.x = radius * Math.cos(angle);
  camera.position.y = radius * Math.sin(angle);
  camera.position.z = radius * Math.sin(angle) * Math.cos(angle);

  // Ensure camera looks at the center (the world)
  camera.lookAt(sphere.position);

  renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

