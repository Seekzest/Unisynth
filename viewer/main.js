import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Scene setup
let scene, camera, renderer, controls;
let cameraFrustums = [];
let animationId;
let stats = { fps: 0, lastTime: Date.now(), frames: 0 };

// Initialize the 3D scene
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);
    scene.fog = new THREE.Fog(0x1a1a1a, 10, 50);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 50;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Add grid helper
    const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
    scene.add(gridHelper);

    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);

    // Start animation loop
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    animationId = requestAnimationFrame(animate);

    // Update controls
    controls.update();

    // Update FPS counter
    stats.frames++;
    const currentTime = Date.now();
    if (currentTime >= stats.lastTime + 1000) {
        stats.fps = Math.round((stats.frames * 1000) / (currentTime - stats.lastTime));
        stats.frames = 0;
        stats.lastTime = currentTime;
        document.getElementById('fps').textContent = stats.fps;
    }

    // Render scene
    renderer.render(scene, camera);
}

// API functions
async function fetchSessions() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/sessions`);
        const data = await response.json();
        return data.sessions || [];
    } catch (error) {
        console.error('Error fetching sessions:', error);
        return [];
    }
}

async function fetchSessionData(sessionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
        const data = await response.json();
        return data.session;
    } catch (error) {
        console.error('Error fetching session data:', error);
        return null;
    }
}

// Visualization functions
function createCameraFrustum(position, rotation, color) {
    const frustumGroup = new THREE.Group();

    // Create camera box
    const geometry = new THREE.BoxGeometry(0.2, 0.15, 0.3);
    const material = new THREE.MeshPhongMaterial({ color });
    const cameraMesh = new THREE.Mesh(geometry, material);
    frustumGroup.add(cameraMesh);

    // Create frustum lines
    const frustumGeometry = new THREE.BufferGeometry();
    const frustumVertices = new Float32Array([
        0, 0, 0,
        -0.5, -0.3, -1.5,
        0, 0, 0,
        0.5, -0.3, -1.5,
        0, 0, 0,
        0.5, 0.3, -1.5,
        0, 0, 0,
        -0.5, 0.3, -1.5,
        // Connect frustum corners
        -0.5, -0.3, -1.5,
        0.5, -0.3, -1.5,
        0.5, -0.3, -1.5,
        0.5, 0.3, -1.5,
        0.5, 0.3, -1.5,
        -0.5, 0.3, -1.5,
        -0.5, 0.3, -1.5,
        -0.5, -0.3, -1.5,
    ]);
    frustumGeometry.setAttribute('position', new THREE.BufferAttribute(frustumVertices, 3));
    
    const lineMaterial = new THREE.LineBasicMaterial({ color, opacity: 0.6, transparent: true });
    const frustumLines = new THREE.LineSegments(frustumGeometry, lineMaterial);
    frustumGroup.add(frustumLines);

    // Set position and rotation
    frustumGroup.position.set(position.x, position.y, position.z);
    if (rotation) {
        frustumGroup.rotation.set(rotation.x, rotation.y, rotation.z);
    }

    // Add label
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText('Camera', canvas.width / 2, canvas.height / 2 + 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(1, 0.25, 1);
    sprite.position.y = 0.5;
    frustumGroup.add(sprite);

    return frustumGroup;
}

function clearScene() {
    // Remove all camera frustums
    cameraFrustums.forEach(frustum => {
        scene.remove(frustum);
    });
    cameraFrustums = [];
}

function visualizeSession(sessionData) {
    clearScene();

    if (!sessionData || !sessionData.devices) {
        console.log('No session data to visualize');
        return;
    }

    // Create camera frustums for each device
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    sessionData.devices.forEach((device, index) => {
        const color = colors[index % colors.length];
        
        // For now, place cameras in a circle around the origin
        // In a real implementation, this would use actual pose data
        const angle = (index / sessionData.devices.length) * Math.PI * 2;
        const radius = 3;
        const position = {
            x: Math.cos(angle) * radius,
            y: 1.5,
            z: Math.sin(angle) * radius
        };
        
        const rotation = {
            x: 0,
            y: -angle,
            z: 0
        };

        const frustum = createCameraFrustum(position, rotation, color);
        scene.add(frustum);
        cameraFrustums.push(frustum);
    });

    // Add a central point cloud (placeholder)
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsCount = 1000;
    const positions = new Float32Array(pointsCount * 3);
    const colors = new Float32Array(pointsCount * 3);

    for (let i = 0; i < pointsCount; i++) {
        // Random points in a sphere
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = Math.random() * 2;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        colors[i * 3] = Math.random();
        colors[i * 3 + 1] = Math.random();
        colors[i * 3 + 2] = Math.random();
    }

    pointsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pointsGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8
    });

    const pointCloud = new THREE.Points(pointsGeometry, pointsMaterial);
    scene.add(pointCloud);

    // Update UI
    document.getElementById('camera-count').textContent = sessionData.devices.length;
    document.getElementById('recording-count').textContent = sessionData.recordings.length;
}

// UI functions
async function loadSessions() {
    const sessions = await fetchSessions();
    const select = document.getElementById('session-select');
    
    select.innerHTML = '';
    
    if (sessions.length === 0) {
        select.innerHTML = '<option value="">No sessions available</option>';
        return;
    }

    sessions.forEach(session => {
        const option = document.createElement('option');
        option.value = session.id;
        option.textContent = `${session.name} (${session.devices.length} devices)`;
        select.appendChild(option);
    });
}

async function loadSelectedSession() {
    const select = document.getElementById('session-select');
    const sessionId = select.value;
    
    if (!sessionId) {
        alert('Please select a session');
        return;
    }

    document.getElementById('loading').style.display = 'block';
    
    try {
        const sessionData = await fetchSessionData(sessionId);
        if (sessionData) {
            visualizeSession(sessionData);
        } else {
            alert('Failed to load session data');
        }
    } catch (error) {
        console.error('Error loading session:', error);
        alert('Error loading session');
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initScene();
    loadSessions();

    document.getElementById('load-button').addEventListener('click', loadSelectedSession);
    
    // Refresh sessions every 10 seconds
    setInterval(loadSessions, 10000);
});
