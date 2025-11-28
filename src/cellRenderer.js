/**
 * Cell Renderer - Creates Three.js meshes for Voronoi cells
 * 
 * Handles rendering of both the transparent cell bodies and wireframe edges
 */

import * as THREE from 'three';

/**
 * Color palette for honeycomb theme
 */
const COLORS = {
    cellFill: 0xfbbf24,      // Amber-400
    cellEdge: 0xf59e0b,      // Amber-500
    cellEdgeBright: 0xfcd34d, // Amber-300
    pointLayerA: 0xf59e0b,   // Amber-500
    pointLayerB: 0xfde68a,   // Amber-200
    pointGlow: 0xfbbf24,     // Amber-400
};

/**
 * Varied color palette for distinguishing cells - honeycomb theme
 * Uses variations of amber, gold, honey, and warm yellows
 */
const CELL_COLOR_PALETTE = [
    { fill: 0xfbbf24, edge: 0xd97706 },  // Classic amber
    { fill: 0xfcd34d, edge: 0xf59e0b },  // Bright gold
    { fill: 0xf59e0b, edge: 0xb45309 },  // Deep amber
    { fill: 0xfde68a, edge: 0xfbbf24 },  // Light honey
    { fill: 0xeab308, edge: 0xa16207 },  // Golden yellow
    { fill: 0xfef08a, edge: 0xeab308 },  // Pale gold
    { fill: 0xca8a04, edge: 0x854d0e },  // Dark honey
    { fill: 0xfacc15, edge: 0xca8a04 },  // Sunflower
    { fill: 0xd97706, edge: 0x92400e },  // Burnt amber
    { fill: 0xfef3c7, edge: 0xfcd34d },  // Cream gold
    { fill: 0xb45309, edge: 0x78350f },  // Bronze
    { fill: 0xfde047, edge: 0xeab308 },  // Lemon gold
];

/**
 * Create a Three.js mesh for a Voronoi cell
 * @param {Object} meshData - Output from cellToMeshData
 * @param {Object} options - Rendering options
 * @returns {THREE.Group} Group containing cell mesh and wireframe
 */
export function createCellMesh(meshData, options = {}) {
    const {
        fillOpacity = 0.15,
        showFill = true,
        showEdges = true,
        edgeColor = COLORS.cellEdge,
        fillColor = COLORS.cellFill,
    } = options;
    
    const group = new THREE.Group();
    
    // Create geometry from mesh data
    const geometry = new THREE.BufferGeometry();
    
    // Set vertices
    const positions = new Float32Array(meshData.vertices);
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Set indices for faces
    if (meshData.indices.length > 0) {
        geometry.setIndex(meshData.indices);
    }
    
    geometry.computeVertexNormals();
    
    // Create filled mesh (semi-transparent)
    if (showFill && meshData.indices.length > 0) {
        const fillMaterial = new THREE.MeshPhysicalMaterial({
            color: fillColor,
            transparent: true,
            opacity: fillOpacity,
            side: THREE.DoubleSide,
            metalness: 0.1,
            roughness: 0.3,
            depthWrite: false,
        });
        
        const fillMesh = new THREE.Mesh(geometry, fillMaterial);
        fillMesh.renderOrder = 1;
        group.add(fillMesh);
    }
    
    // Create wireframe edges
    if (showEdges && meshData.edges.length > 0) {
        const edgePositions = [];
        const vertices = meshData.vertices;
        
        for (const [a, b] of meshData.edges) {
            edgePositions.push(
                vertices[a * 3], vertices[a * 3 + 1], vertices[a * 3 + 2],
                vertices[b * 3], vertices[b * 3 + 1], vertices[b * 3 + 2]
            );
        }
        
        const edgeGeometry = new THREE.BufferGeometry();
        edgeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(edgePositions, 3));
        
        const edgeMaterial = new THREE.LineBasicMaterial({
            color: edgeColor,
            transparent: true,
            opacity: 0.9,
            linewidth: 1, // Note: linewidth > 1 only works on some platforms
        });
        
        const edgeMesh = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edgeMesh.renderOrder = 2;
        group.add(edgeMesh);
    }
    
    return group;
}

/**
 * Create a group of seed points as spheres
 * @param {Array<{x, y, z, layer}>} points - Seed points
 * @param {Object} options - Rendering options
 * @returns {THREE.Group} Group containing all point meshes
 */
export function createPointsGroup(points, options = {}) {
    const {
        radius = 0.08,
        segments = 16,
    } = options;
    
    const group = new THREE.Group();
    
    // Create shared geometries and materials for performance
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
    
    const materialLayerA = new THREE.MeshPhysicalMaterial({
        color: COLORS.pointLayerA,
        emissive: COLORS.pointLayerA,
        emissiveIntensity: 0.3,
        metalness: 0.5,
        roughness: 0.2,
    });
    
    const materialLayerB = new THREE.MeshPhysicalMaterial({
        color: COLORS.pointLayerB,
        emissive: COLORS.pointLayerB,
        emissiveIntensity: 0.4,
        metalness: 0.5,
        roughness: 0.2,
    });
    
    for (const point of points) {
        const material = point.layer === 'A' ? materialLayerA : materialLayerB;
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(point.x, point.y, point.z);
        sphere.userData = { point };
        group.add(sphere);
    }
    
    // Add point light glow effect using sprites
    const glowTexture = createGlowTexture();
    const glowMaterial = new THREE.SpriteMaterial({
        map: glowTexture,
        color: COLORS.pointGlow,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
    });
    
    for (const point of points) {
        const sprite = new THREE.Sprite(glowMaterial.clone());
        sprite.position.set(point.x, point.y, point.z);
        sprite.scale.set(radius * 4, radius * 4, 1);
        group.add(sprite);
    }
    
    return group;
}

/**
 * Create a glow texture for point sprites
 * @returns {THREE.CanvasTexture}
 */
function createGlowTexture() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    
    return new THREE.CanvasTexture(canvas);
}

/**
 * Create all Voronoi cell meshes from computed cells
 * @param {Array<{seed, cell}>} voronoiCells - Output from computeVoronoiCells
 * @param {Function} cellToMeshData - Conversion function
 * @param {Object} options - Rendering options
 * @returns {THREE.Group} Group containing all cell meshes
 */
export function createVoronoiCellsGroup(voronoiCells, cellToMeshData, options = {}) {
    const group = new THREE.Group();
    const { useVariedColors = false, ...baseOptions } = options;
    
    voronoiCells.forEach(({ seed, cell }, index) => {
        const meshData = cellToMeshData(cell);
        
        // Determine colors for this cell
        let cellOptions = { ...baseOptions };
        if (useVariedColors) {
            const colorScheme = CELL_COLOR_PALETTE[index % CELL_COLOR_PALETTE.length];
            cellOptions.fillColor = colorScheme.fill;
            cellOptions.edgeColor = colorScheme.edge;
        }
        
        const cellMesh = createCellMesh(meshData, cellOptions);
        cellMesh.userData = { seed, meshData, colorIndex: index % CELL_COLOR_PALETTE.length };
        group.add(cellMesh);
    });
    
    return group;
}

/**
 * Create ambient lighting setup for the scene
 * @returns {Array<THREE.Light>} Array of lights to add to scene
 */
export function createLighting() {
    const lights = [];
    
    // Ambient light for overall visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    lights.push(ambient);
    
    // Main directional light (warm tone)
    const mainLight = new THREE.DirectionalLight(0xffeedd, 0.8);
    mainLight.position.set(5, 10, 5);
    lights.push(mainLight);
    
    // Fill light from opposite side (cooler tone)
    const fillLight = new THREE.DirectionalLight(0xddeeff, 0.4);
    fillLight.position.set(-5, -5, -5);
    lights.push(fillLight);
    
    // Rim light from behind
    const rimLight = new THREE.DirectionalLight(0xffd700, 0.3);
    rimLight.position.set(0, -5, 10);
    lights.push(rimLight);
    
    return lights;
}

/**
 * Create a subtle grid/ground plane for reference
 * @param {number} size - Size of the grid
 * @returns {THREE.Group} Group containing grid elements
 */
export function createReferenceGrid(size = 10) {
    const group = new THREE.Group();
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(size, 20, 0x44403c, 0x292524);
    gridHelper.rotation.x = Math.PI / 2; // Rotate to XY plane
    gridHelper.position.z = -size / 4;
    gridHelper.material.opacity = 0.3;
    gridHelper.material.transparent = true;
    group.add(gridHelper);
    
    return group;
}

export { COLORS };

