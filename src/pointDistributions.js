/**
 * Point Distribution Generators for 3D Voronoi Visualization
 * 
 * A collection of mathematically interesting and visually appealing
 * point distributions that create unique Voronoi cell patterns.
 */

/**
 * Distribution metadata for UI display
 * Note: Honeycomb is handled separately via hexGrid.js and added manually in UI
 */
export const DISTRIBUTIONS = {
    random: {
        id: 'random',
        name: 'Random',
        icon: '🎲',
        description: 'Uniformly distributed random points',
        category: 'chaotic'
    },
    bcc: {
        id: 'bcc',
        name: 'BCC Lattice',
        icon: '💎',
        description: 'Body-centered cubic - creates truncated octahedra',
        category: 'crystalline'
    },
    fcc: {
        id: 'fcc',
        name: 'FCC Lattice',
        icon: '🔷',
        description: 'Face-centered cubic - creates rhombic dodecahedra',
        category: 'crystalline'
    },
    simpleCubic: {
        id: 'simpleCubic',
        name: 'Cubic Grid',
        icon: '🧊',
        description: 'Simple cubic lattice - creates cube cells',
        category: 'crystalline'
    },
    fibonacciSphere: {
        id: 'fibonacciSphere',
        name: 'Fibonacci Sphere',
        icon: '🌻',
        description: 'Golden angle distribution on a sphere',
        category: 'organic'
    },
    doubleHelix: {
        id: 'doubleHelix',
        name: 'Double Helix',
        icon: '🧬',
        description: 'DNA-inspired double spiral pattern',
        category: 'organic'
    },
    galaxy: {
        id: 'galaxy',
        name: 'Galaxy Clusters',
        icon: '🌌',
        description: 'Multiple spiral arms with clustered points',
        category: 'chaotic'
    },
    concentricShells: {
        id: 'concentricShells',
        name: 'Concentric Shells',
        icon: '🎯',
        description: 'Points arranged on nested spherical shells',
        category: 'organic'
    },
    jitteredGrid: {
        id: 'jitteredGrid',
        name: 'Jittered Grid',
        icon: '📊',
        description: 'Perturbed cubic grid - semi-regular cells',
        category: 'chaotic'
    },
    spiralTower: {
        id: 'spiralTower',
        name: 'Spiral Tower',
        icon: '🗼',
        description: 'Vertical spiral rising pattern',
        category: 'organic'
    },
    diamondLattice: {
        id: 'diamondLattice',
        name: 'Diamond Lattice',
        icon: '💠',
        description: 'Carbon diamond crystal structure',
        category: 'crystalline'
    }
};

/**
 * Calculate bounding box for a set of points
 */
function calculateBoundingBox(points) {
    if (points.length === 0) {
        return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
    }
    
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
    
    return { min, max };
}

/**
 * Body-Centered Cubic (BCC) Lattice
 * Creates truncated octahedra - 14-faced space-filling polyhedra
 * Found in iron, chromium, tungsten crystals
 */
export function generateBCCPoints(gridSize = 4, spacing = 1.0) {
    const points = [];
    const half = (gridSize - 1) / 2;
    
    // Corner points of the cubic lattice
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                points.push({
                    x: (x - half) * spacing,
                    y: (y - half) * spacing,
                    z: (z - half) * spacing,
                    layer: 'A',
                    id: `BCC-A-${points.length}`
                });
            }
        }
    }
    
    // Center points (offset by half spacing in all directions)
    for (let x = 0; x < gridSize - 1; x++) {
        for (let y = 0; y < gridSize - 1; y++) {
            for (let z = 0; z < gridSize - 1; z++) {
                points.push({
                    x: (x - half + 0.5) * spacing,
                    y: (y - half + 0.5) * spacing,
                    z: (z - half + 0.5) * spacing,
                    layer: 'B',
                    id: `BCC-B-${points.length}`
                });
            }
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Face-Centered Cubic (FCC) Lattice
 * Creates rhombic dodecahedra - 12-faced space-filling polyhedra
 * Found in gold, silver, copper, aluminum crystals
 */
export function generateFCCPoints(gridSize = 4, spacing = 1.0) {
    const points = [];
    const half = (gridSize - 1) / 2;
    
    // Corner points
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                points.push({
                    x: (x - half) * spacing,
                    y: (y - half) * spacing,
                    z: (z - half) * spacing,
                    layer: 'A',
                    id: `FCC-A-${points.length}`
                });
            }
        }
    }
    
    // Face-centered points on XY faces
    for (let x = 0; x < gridSize - 1; x++) {
        for (let y = 0; y < gridSize - 1; y++) {
            for (let z = 0; z < gridSize; z++) {
                points.push({
                    x: (x - half + 0.5) * spacing,
                    y: (y - half + 0.5) * spacing,
                    z: (z - half) * spacing,
                    layer: 'B',
                    id: `FCC-B-${points.length}`
                });
            }
        }
    }
    
    // Face-centered points on XZ faces
    for (let x = 0; x < gridSize - 1; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize - 1; z++) {
                points.push({
                    x: (x - half + 0.5) * spacing,
                    y: (y - half) * spacing,
                    z: (z - half + 0.5) * spacing,
                    layer: 'C',
                    id: `FCC-C-${points.length}`
                });
            }
        }
    }
    
    // Face-centered points on YZ faces
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize - 1; y++) {
            for (let z = 0; z < gridSize - 1; z++) {
                points.push({
                    x: (x - half) * spacing,
                    y: (y - half + 0.5) * spacing,
                    z: (z - half + 0.5) * spacing,
                    layer: 'D',
                    id: `FCC-D-${points.length}`
                });
            }
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Simple Cubic Lattice
 * Creates perfect cube-shaped Voronoi cells
 */
export function generateSimpleCubicPoints(gridSize = 5, spacing = 1.0) {
    const points = [];
    const half = (gridSize - 1) / 2;
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                points.push({
                    x: (x - half) * spacing,
                    y: (y - half) * spacing,
                    z: (z - half) * spacing,
                    layer: 'A',
                    id: `SC-${points.length}`
                });
            }
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Fibonacci Sphere Distribution
 * Uses the golden angle to distribute points evenly on a sphere
 * Creates organic, flower-like Voronoi patterns
 */
export function generateFibonacciSpherePoints(count = 50, radius = 2.0) {
    const points = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees
    
    for (let i = 0; i < count; i++) {
        // Distribute points from pole to pole
        const y = 1 - (i / (count - 1)) * 2; // y goes from 1 to -1
        const radiusAtY = Math.sqrt(1 - y * y);
        
        const theta = goldenAngle * i;
        
        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;
        
        points.push({
            x: x * radius,
            y: y * radius,
            z: z * radius,
            layer: i % 2 === 0 ? 'A' : 'B',
            id: `FIB-${i}`
        });
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Double Helix (DNA-inspired)
 * Two intertwined spirals, like the structure of DNA
 */
export function generateDoubleHelixPoints(turns = 3, pointsPerTurn = 10, radius = 1.5, height = 4.0) {
    const points = [];
    const totalPoints = turns * pointsPerTurn;
    const heightStep = height / totalPoints;
    const phaseOffset = Math.PI; // 180 degrees between helices
    
    // First helix
    for (let i = 0; i < totalPoints; i++) {
        const theta = (i / pointsPerTurn) * 2 * Math.PI;
        const y = (i * heightStep) - height / 2;
        
        points.push({
            x: Math.cos(theta) * radius,
            y: y,
            z: Math.sin(theta) * radius,
            layer: 'A',
            id: `HELIX-A-${i}`
        });
    }
    
    // Second helix (phase shifted)
    for (let i = 0; i < totalPoints; i++) {
        const theta = (i / pointsPerTurn) * 2 * Math.PI + phaseOffset;
        const y = (i * heightStep) - height / 2;
        
        points.push({
            x: Math.cos(theta) * radius,
            y: y,
            z: Math.sin(theta) * radius,
            layer: 'B',
            id: `HELIX-B-${i}`
        });
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Galaxy Clusters
 * Multiple spiral arms emanating from a central cluster
 */
export function generateGalaxyPoints(arms = 4, pointsPerArm = 15, corePoints = 20) {
    const points = [];
    
    // Central core cluster
    for (let i = 0; i < corePoints; i++) {
        const r = Math.random() * 0.5;
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.random() * Math.PI;
        
        points.push({
            x: r * Math.sin(phi) * Math.cos(theta),
            y: r * Math.sin(phi) * Math.sin(theta) * 0.3, // Flatten vertically
            z: r * Math.cos(phi),
            layer: 'core',
            id: `GAL-CORE-${i}`
        });
    }
    
    // Spiral arms
    for (let arm = 0; arm < arms; arm++) {
        const armOffset = (arm / arms) * 2 * Math.PI;
        
        for (let i = 0; i < pointsPerArm; i++) {
            const t = i / pointsPerArm;
            const r = 0.5 + t * 2; // Spiral outward
            const theta = armOffset + t * 2 * Math.PI; // One full rotation per arm
            
            // Add some noise
            const noise = (Math.random() - 0.5) * 0.3;
            const verticalNoise = (Math.random() - 0.5) * 0.2;
            
            points.push({
                x: (r + noise) * Math.cos(theta),
                y: verticalNoise,
                z: (r + noise) * Math.sin(theta),
                layer: `arm-${arm}`,
                id: `GAL-ARM${arm}-${i}`
            });
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Concentric Shells
 * Points distributed on nested spherical shells
 */
export function generateConcentricShellsPoints(shells = 3, pointsPerShell = 20, maxRadius = 2.0) {
    const points = [];
    
    for (let shell = 0; shell < shells; shell++) {
        const radius = ((shell + 1) / shells) * maxRadius;
        const numPoints = Math.floor(pointsPerShell * (shell + 1) / shells) + 8;
        
        // Use Fibonacci distribution for each shell
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        
        for (let i = 0; i < numPoints; i++) {
            const y = 1 - (i / (numPoints - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = goldenAngle * i;
            
            points.push({
                x: Math.cos(theta) * radiusAtY * radius,
                y: y * radius,
                z: Math.sin(theta) * radiusAtY * radius,
                layer: `shell-${shell}`,
                id: `SHELL-${shell}-${i}`
            });
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Jittered Grid
 * Regular cubic grid with random perturbations
 * Creates semi-regular cells with organic variation
 */
export function generateJitteredGridPoints(gridSize = 4, spacing = 1.0, jitterAmount = 0.3) {
    const points = [];
    const half = (gridSize - 1) / 2;
    const maxJitter = spacing * jitterAmount;
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                const jitterX = (Math.random() - 0.5) * 2 * maxJitter;
                const jitterY = (Math.random() - 0.5) * 2 * maxJitter;
                const jitterZ = (Math.random() - 0.5) * 2 * maxJitter;
                
                points.push({
                    x: (x - half) * spacing + jitterX,
                    y: (y - half) * spacing + jitterY,
                    z: (z - half) * spacing + jitterZ,
                    layer: (x + y + z) % 2 === 0 ? 'A' : 'B',
                    id: `JITTER-${points.length}`
                });
            }
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Spiral Tower
 * Points arranged in a vertical spiral pattern
 */
export function generateSpiralTowerPoints(levels = 8, pointsPerLevel = 8, height = 4.0, radius = 1.5) {
    const points = [];
    const levelHeight = height / levels;
    
    for (let level = 0; level < levels; level++) {
        const y = (level * levelHeight) - height / 2;
        const levelRadius = radius * (1 - level / levels * 0.3); // Taper towards top
        const rotationOffset = (level / levels) * Math.PI; // Rotate each level
        
        for (let i = 0; i < pointsPerLevel; i++) {
            const theta = (i / pointsPerLevel) * 2 * Math.PI + rotationOffset;
            
            points.push({
                x: Math.cos(theta) * levelRadius,
                y: y,
                z: Math.sin(theta) * levelRadius,
                layer: level % 2 === 0 ? 'A' : 'B',
                id: `TOWER-${level}-${i}`
            });
        }
    }
    
    // Add center column
    for (let level = 0; level < levels; level++) {
        const y = (level * levelHeight) - height / 2;
        points.push({
            x: 0,
            y: y,
            z: 0,
            layer: 'center',
            id: `TOWER-CENTER-${level}`
        });
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Diamond Lattice
 * The crystal structure of diamond and silicon
 * Two interpenetrating FCC lattices
 */
export function generateDiamondLatticePoints(gridSize = 3, spacing = 1.5) {
    const points = [];
    const half = (gridSize - 1) / 2;
    const offset = spacing / 4;
    
    // First FCC sublattice
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                // Corner atoms
                points.push({
                    x: (x - half) * spacing,
                    y: (y - half) * spacing,
                    z: (z - half) * spacing,
                    layer: 'A',
                    id: `DIA-A-${points.length}`
                });
                
                // Face-centered atoms
                if (x < gridSize - 1 && y < gridSize - 1) {
                    points.push({
                        x: (x - half + 0.5) * spacing,
                        y: (y - half + 0.5) * spacing,
                        z: (z - half) * spacing,
                        layer: 'B',
                        id: `DIA-B-${points.length}`
                    });
                }
                if (x < gridSize - 1 && z < gridSize - 1) {
                    points.push({
                        x: (x - half + 0.5) * spacing,
                        y: (y - half) * spacing,
                        z: (z - half + 0.5) * spacing,
                        layer: 'C',
                        id: `DIA-C-${points.length}`
                    });
                }
                if (y < gridSize - 1 && z < gridSize - 1) {
                    points.push({
                        x: (x - half) * spacing,
                        y: (y - half + 0.5) * spacing,
                        z: (z - half + 0.5) * spacing,
                        layer: 'D',
                        id: `DIA-D-${points.length}`
                    });
                }
            }
        }
    }
    
    // Second sublattice (offset by 1/4, 1/4, 1/4)
    for (let x = 0; x < gridSize - 1; x++) {
        for (let y = 0; y < gridSize - 1; y++) {
            for (let z = 0; z < gridSize - 1; z++) {
                points.push({
                    x: (x - half + 0.25) * spacing,
                    y: (y - half + 0.25) * spacing,
                    z: (z - half + 0.25) * spacing,
                    layer: 'E',
                    id: `DIA-E-${points.length}`
                });
                
                // Additional tetrahedral positions
                points.push({
                    x: (x - half + 0.75) * spacing,
                    y: (y - half + 0.75) * spacing,
                    z: (z - half + 0.25) * spacing,
                    layer: 'F',
                    id: `DIA-F-${points.length}`
                });
                points.push({
                    x: (x - half + 0.75) * spacing,
                    y: (y - half + 0.25) * spacing,
                    z: (z - half + 0.75) * spacing,
                    layer: 'G',
                    id: `DIA-G-${points.length}`
                });
                points.push({
                    x: (x - half + 0.25) * spacing,
                    y: (y - half + 0.75) * spacing,
                    z: (z - half + 0.75) * spacing,
                    layer: 'H',
                    id: `DIA-H-${points.length}`
                });
            }
        }
    }
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Random Points Distribution
 * Uniformly distributed random points
 */
export function generateRandomPoints(gridSize = 6) {
    const count = gridSize * gridSize * 2;
    const points = [];
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
    
    return {
        points,
        boundingBox: calculateBoundingBox(points)
    };
}

/**
 * Master generator function that routes to appropriate distribution
 */
export function generatePoints(distributionId, gridSize = 6, layerSpacing = 1.0) {
    switch (distributionId) {
        case 'bcc':
            return generateBCCPoints(Math.max(2, Math.floor(gridSize * 0.6)), layerSpacing);
        case 'fcc':
            return generateFCCPoints(Math.max(2, Math.floor(gridSize * 0.5)), layerSpacing);
        case 'simpleCubic':
            return generateSimpleCubicPoints(Math.max(2, Math.floor(gridSize * 0.7)), layerSpacing);
        case 'fibonacciSphere':
            return generateFibonacciSpherePoints(gridSize * gridSize, gridSize * 0.35);
        case 'doubleHelix':
            return generateDoubleHelixPoints(
                Math.max(2, Math.floor(gridSize * 0.5)),
                Math.max(6, gridSize),
                gridSize * 0.25,
                gridSize * 0.6 * layerSpacing
            );
        case 'galaxy':
            return generateGalaxyPoints(
                4,
                Math.max(8, gridSize * 2),
                Math.max(10, gridSize * 3)
            );
        case 'concentricShells':
            return generateConcentricShellsPoints(
                Math.max(2, Math.floor(gridSize * 0.5)),
                gridSize * 3,
                gridSize * 0.35
            );
        case 'jitteredGrid':
            return generateJitteredGridPoints(
                Math.max(2, Math.floor(gridSize * 0.6)),
                layerSpacing,
                0.35
            );
        case 'spiralTower':
            return generateSpiralTowerPoints(
                Math.max(4, gridSize),
                Math.max(6, gridSize),
                gridSize * 0.5 * layerSpacing,
                gridSize * 0.25
            );
        case 'diamondLattice':
            return generateDiamondLatticePoints(
                Math.max(2, Math.floor(gridSize * 0.4)),
                layerSpacing * 1.2
            );
        case 'random':
            return generateRandomPoints(gridSize);
        default:
            return null; // Honeycomb handled separately in hexGrid.js
    }
}

