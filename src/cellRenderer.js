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
 * Themed color palettes for different distribution categories
 */
export const THEME_PALETTES = {
    // Honeycomb - warm amber/gold tones
    honeycomb: {
        name: 'Honeycomb',
        background: 0x0c0a09,
        fog: 0x0c0a09,
        cells: [
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
        ],
        points: { layerA: 0xf59e0b, layerB: 0xfde68a },
        ui: {
            primary: '#fbbf24',
            primaryLight: '#fcd34d',
            primaryDark: '#d97706',
            accent: '#f59e0b',
            text: '#fef3c7',
        }
    },
    
    // Crystalline - cool blues, cyans, and purples (gemstone-like)
    crystalline: {
        name: 'Crystalline',
        background: 0x050810,
        fog: 0x050810,
        cells: [
            { fill: 0x38bdf8, edge: 0x0284c7 },  // Sky blue
            { fill: 0x22d3ee, edge: 0x0891b2 },  // Cyan
            { fill: 0x818cf8, edge: 0x6366f1 },  // Indigo
            { fill: 0xa78bfa, edge: 0x7c3aed },  // Violet
            { fill: 0x67e8f9, edge: 0x22d3ee },  // Light cyan
            { fill: 0x7dd3fc, edge: 0x38bdf8 },  // Light blue
            { fill: 0xc4b5fd, edge: 0xa78bfa },  // Light violet
            { fill: 0x06b6d4, edge: 0x0e7490 },  // Teal
            { fill: 0x60a5fa, edge: 0x2563eb },  // Blue
            { fill: 0x93c5fd, edge: 0x60a5fa },  // Pale blue
            { fill: 0x5eead4, edge: 0x14b8a6 },  // Aquamarine
            { fill: 0xe0e7ff, edge: 0xc7d2fe },  // Ice
        ],
        points: { layerA: 0x38bdf8, layerB: 0xa78bfa },
        ui: {
            primary: '#38bdf8',
            primaryLight: '#7dd3fc',
            primaryDark: '#0284c7',
            accent: '#818cf8',
            text: '#e0f2fe',
        }
    },
    
    // Organic - greens, teals, and natural earth tones
    organic: {
        name: 'Organic',
        background: 0x071008,
        fog: 0x071008,
        cells: [
            { fill: 0x4ade80, edge: 0x16a34a },  // Green
            { fill: 0x34d399, edge: 0x059669 },  // Emerald
            { fill: 0x2dd4bf, edge: 0x0d9488 },  // Teal
            { fill: 0x86efac, edge: 0x4ade80 },  // Light green
            { fill: 0xa7f3d0, edge: 0x34d399 },  // Mint
            { fill: 0x6ee7b7, edge: 0x10b981 },  // Seafoam
            { fill: 0x22c55e, edge: 0x15803d },  // Forest
            { fill: 0x5eead4, edge: 0x14b8a6 },  // Aqua
            { fill: 0xbbf7d0, edge: 0x86efac },  // Pale green
            { fill: 0x14b8a6, edge: 0x0f766e },  // Deep teal
            { fill: 0xfde047, edge: 0xeab308 },  // Sunflower accent
            { fill: 0xfbbf24, edge: 0xd97706 },  // Pollen accent
        ],
        points: { layerA: 0x4ade80, layerB: 0x2dd4bf },
        ui: {
            primary: '#4ade80',
            primaryLight: '#86efac',
            primaryDark: '#16a34a',
            accent: '#2dd4bf',
            text: '#dcfce7',
        }
    },
    
    // Chaotic - cosmic purples, magentas, and deep space colors
    chaotic: {
        name: 'Chaotic',
        background: 0x0d0515,
        fog: 0x0d0515,
        cells: [
            { fill: 0xf472b6, edge: 0xdb2777 },  // Pink
            { fill: 0xe879f9, edge: 0xc026d3 },  // Fuchsia
            { fill: 0xc084fc, edge: 0x9333ea },  // Purple
            { fill: 0xa78bfa, edge: 0x7c3aed },  // Violet
            { fill: 0xfb7185, edge: 0xf43f5e },  // Rose
            { fill: 0xf9a8d4, edge: 0xf472b6 },  // Light pink
            { fill: 0xd946ef, edge: 0xa21caf },  // Magenta
            { fill: 0x818cf8, edge: 0x6366f1 },  // Indigo
            { fill: 0xfda4af, edge: 0xfb7185 },  // Blush
            { fill: 0xf0abfc, edge: 0xe879f9 },  // Lavender
            { fill: 0x38bdf8, edge: 0x0ea5e9 },  // Electric blue accent
            { fill: 0x22d3ee, edge: 0x06b6d4 },  // Cyan accent
        ],
        points: { layerA: 0xf472b6, layerB: 0xc084fc },
        ui: {
            primary: '#e879f9',
            primaryLight: '#f0abfc',
            primaryDark: '#c026d3',
            accent: '#f472b6',
            text: '#fae8ff',
        }
    }
};

/**
 * Get theme for a distribution
 */
export function getThemeForDistribution(distributionId) {
    // Map distributions to themes
    const themeMap = {
        honeycomb: 'honeycomb',
        bcc: 'crystalline',
        fcc: 'crystalline',
        simpleCubic: 'crystalline',
        diamondLattice: 'crystalline',
        fibonacciSphere: 'organic',
        doubleHelix: 'organic',
        concentricShells: 'organic',
        spiralTower: 'organic',
        random: 'chaotic',
        galaxy: 'chaotic',
        jitteredGrid: 'chaotic',
    };
    
    const themeName = themeMap[distributionId] || 'honeycomb';
    return THEME_PALETTES[themeName];
}

// Default cell color palette (honeycomb for backwards compatibility)
const CELL_COLOR_PALETTE = THEME_PALETTES.honeycomb.cells;

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
        cellIndex = 0,  // Stable index for consistent render order
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
    // Use stable renderOrder based on cellIndex to prevent flickering
    if (showFill && meshData.indices.length > 0) {
        const fillMaterial = new THREE.MeshStandardMaterial({
            color: fillColor,
            transparent: true,
            opacity: fillOpacity,
            side: THREE.DoubleSide,
            depthWrite: false,
        });
        
        const fillMesh = new THREE.Mesh(geometry, fillMaterial);
        // Use stable render order: base 100 + cellIndex to ensure consistent ordering
        fillMesh.renderOrder = 100 + cellIndex;
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
        // Edges render after all fills
        edgeMesh.renderOrder = 1000 + cellIndex;
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
        pointColors = null,
    } = options;
    
    const group = new THREE.Group();
    
    // Create shared geometries and materials for performance
    const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
    
    const layerAColor = pointColors?.layerA || COLORS.pointLayerA;
    const layerBColor = pointColors?.layerB || COLORS.pointLayerB;
    
    const materialLayerA = new THREE.MeshStandardMaterial({
        color: layerAColor,
        metalness: 0.3,
        roughness: 0.4,
    });
    
    const materialLayerB = new THREE.MeshStandardMaterial({
        color: layerBColor,
        metalness: 0.3,
        roughness: 0.4,
    });
    
    for (const point of points) {
        const material = point.layer === 'A' ? materialLayerA : materialLayerB;
        const sphere = new THREE.Mesh(sphereGeometry, material);
        sphere.position.set(point.x, point.y, point.z);
        sphere.userData = { point };
        group.add(sphere);
    }
    
    return group;
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
    const { useVariedColors = false, colorPalette = CELL_COLOR_PALETTE, ...baseOptions } = options;
    
    voronoiCells.forEach(({ seed, cell }, index) => {
        const meshData = cellToMeshData(cell);
        
        // Determine colors for this cell
        let cellOptions = { ...baseOptions, cellIndex: index };
        if (useVariedColors) {
            const colorScheme = colorPalette[index % colorPalette.length];
            cellOptions.fillColor = colorScheme.fill;
            cellOptions.edgeColor = colorScheme.edge;
        }
        
        const cellMesh = createCellMesh(meshData, cellOptions);
        cellMesh.userData = { seed, meshData, colorIndex: index % colorPalette.length };
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

