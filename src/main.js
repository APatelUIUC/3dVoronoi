/**
 * Main Application Entry Point
 * 
 * Sets up the Three.js scene, camera, controls, and coordinates
 * between the Voronoi computation and rendering modules.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generateHoneycombPoints } from './hexGrid.js';
import { computeVoronoiCells, cellToMeshData } from './voronoi3d.js';
import { 
    createPointsGroup, 
    createVoronoiCellsGroup, 
    createLighting,
    createReferenceGrid,
    COLORS 
} from './cellRenderer.js';
import { initUI } from './ui.js';

// Application state
const state = {
    gridSize: 6,
    layerSpacing: 1.0,
    showPoints: true,
    showCells: true,
    points: null,
    voronoiCells: null,
    isRandomMode: false,
};

// Three.js components
let scene, camera, renderer, controls;
let pointsGroup, cellsGroup, gridGroup;

/**
 * Initialize the Three.js scene
 */
function initScene() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0a09);
    
    // Add subtle fog for depth
    scene.fog = new THREE.Fog(0x0c0a09, 8, 25);
    
    // Create camera
    camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        100
    );
    camera.position.set(4, 3, 5);
    camera.lookAt(0, 0, 0);
    
    // Create renderer
    const container = document.getElementById('canvas-container');
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);
    
    // Create controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 2;
    controls.maxDistance = 20;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.5;
    
    // Add lighting
    const lights = createLighting();
    lights.forEach(light => scene.add(light));
    
    // Reference grid disabled - not needed for visualization
    // gridGroup = createReferenceGrid(10);
    // scene.add(gridGroup);
    
    // Handle window resize
    window.addEventListener('resize', onWindowResize);
}

/**
 * Generate points and compute Voronoi cells
 */
function generateVisualization() {
    // Remove existing groups
    if (pointsGroup) {
        scene.remove(pointsGroup);
        pointsGroup = null;
    }
    if (cellsGroup) {
        scene.remove(cellsGroup);
        cellsGroup = null;
    }
    
    let points, boundingBox;
    
    if (state.isRandomMode) {
        // Generate random points in a bounded region
        const result = generateRandomPoints(state.gridSize);
        points = result.points;
        boundingBox = result.boundingBox;
    } else {
        // Generate honeycomb points
        const result = generateHoneycombPoints(
            state.gridSize, 
            1.0,  // spacing
            state.layerSpacing
        );
        points = result.points;
        boundingBox = result.metadata.boundingBox;
    }
    
    state.points = points;
    
    // Create points visualization
    pointsGroup = createPointsGroup(state.points, {
        radius: 0.06,
        segments: 16,
    });
    pointsGroup.visible = state.showPoints;
    scene.add(pointsGroup);
    
    // Compute Voronoi cells
    state.voronoiCells = computeVoronoiCells(
        state.points,
        boundingBox,
        1.0  // padding
    );
    
    // Create cells visualization with varied colors
    cellsGroup = createVoronoiCellsGroup(
        state.voronoiCells,
        cellToMeshData,
        {
            fillOpacity: 0.25,
            showFill: true,
            showEdges: true,
            useVariedColors: true,
        }
    );
    cellsGroup.visible = state.showCells;
    scene.add(cellsGroup);
    
    // Log info
    console.log(`Generated ${state.points.length} points (${state.isRandomMode ? 'random' : 'honeycomb'})`);
    console.log(`Computed ${state.voronoiCells.length} Voronoi cells`);
}

/**
 * Generate random points in a bounded region
 */
function generateRandomPoints(gridSize) {
    const count = gridSize * gridSize * 2; // Similar count to honeycomb
    const points = [];
    
    // Determine bounds based on grid size
    const spread = gridSize * 0.6;
    const zSpread = spread * 0.4;
    
    for (let i = 0; i < count; i++) {
        points.push({
            x: (Math.random() - 0.5) * spread * 2,
            y: (Math.random() - 0.5) * spread * 2,
            z: (Math.random() - 0.5) * zSpread * 2,
            layer: Math.random() > 0.5 ? 'A' : 'B',
            id: `R-${i}`
        });
    }
    
    // Calculate bounding box
    const min = { x: Infinity, y: Infinity, z: Infinity };
    const max = { x: -Infinity, y: -Infinity, z: -Infinity };
    
    for (const pt of points) {
        min.x = Math.min(min.x, pt.x);
        min.y = Math.min(min.y, pt.y);
        min.z = Math.min(min.z, pt.z);
        max.x = Math.max(max.x, pt.x);
        max.y = Math.max(max.y, pt.y);
        max.z = Math.max(max.z, pt.z);
    }
    
    return {
        points,
        boundingBox: { min, max }
    };
}

/**
 * Handle window resize
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

/**
 * Animation loop
 */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

/**
 * Toggle points visibility
 */
export function togglePoints(visible) {
    state.showPoints = visible;
    if (pointsGroup) {
        pointsGroup.visible = visible;
    }
}

/**
 * Toggle cells visibility
 */
export function toggleCells(visible) {
    state.showCells = visible;
    if (cellsGroup) {
        cellsGroup.visible = visible;
    }
}

/**
 * Update grid size
 */
export function setGridSize(size) {
    state.gridSize = size;
    showLoading();
    // Use setTimeout to allow UI to update before heavy computation
    setTimeout(() => {
        generateVisualization();
        hideLoading();
    }, 50);
}

/**
 * Update layer spacing
 */
export function setLayerSpacing(spacing) {
    state.layerSpacing = spacing;
    showLoading();
    setTimeout(() => {
        generateVisualization();
        hideLoading();
    }, 50);
}

/**
 * Set random point mode
 */
export function setRandomMode() {
    state.isRandomMode = true;
    showLoading();
    setTimeout(() => {
        generateVisualization();
        hideLoading();
    }, 50);
}

/**
 * Reset to honeycomb pattern
 */
export function resetToHoneycomb() {
    state.isRandomMode = false;
    showLoading();
    setTimeout(() => {
        generateVisualization();
        hideLoading();
    }, 50);
}

/**
 * Show loading indicator
 */
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.remove('hidden');
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
    }
}

/**
 * Get current state
 */
export function getState() {
    return { ...state };
}

/**
 * Main initialization
 */
function init() {
    console.log('🍯 3D Voronoi Honeycomb Visualization');
    console.log('Initializing...');
    
    // Initialize Three.js scene
    initScene();
    
    // Generate initial visualization
    generateVisualization();
    
    // Initialize UI controls
    initUI({
        togglePoints,
        toggleCells,
        setGridSize,
        setLayerSpacing,
        setRandomMode,
        resetToHoneycomb,
        getState,
    });
    
    // Hide loading indicator
    hideLoading();
    
    // Start animation loop
    animate();
    
    console.log('Initialization complete!');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

