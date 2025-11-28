/**
 * Hexagonal Grid Generator for 3D Voronoi Honeycomb Visualization
 * 
 * Creates two hexagonally-packed planes of points with ABAB stacking,
 * mimicking the arrangement found in natural honeycomb structures.
 */

/**
 * Generate a 2D hexagonal lattice of points
 * @param {number} rows - Number of rows in the grid
 * @param {number} cols - Number of columns in the grid  
 * @param {number} spacing - Distance between adjacent points
 * @param {number} offsetX - X offset for the entire grid
 * @param {number} offsetY - Y offset for the entire grid
 * @returns {Array<{x: number, y: number}>} Array of 2D points
 */
function generateHexLattice2D(rows, cols, spacing, offsetX = 0, offsetY = 0) {
    const points = [];
    
    // Hexagonal lattice constants
    // Distance between row centers in a hex grid
    const rowHeight = spacing * Math.sqrt(3) / 2;
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Offset every other row by half the spacing
            const xOffset = (row % 2) * (spacing / 2);
            
            const x = col * spacing + xOffset + offsetX;
            const y = row * rowHeight + offsetY;
            
            points.push({ x, y });
        }
    }
    
    return points;
}

/**
 * Generate two hexagonally-packed planes with ABAB stacking
 * This creates the arrangement that produces honeycomb-like Voronoi cells
 * 
 * @param {number} gridSize - Number of points per row/column (e.g., 3 means 3x3)
 * @param {number} spacing - Distance between adjacent points in the same layer
 * @param {number} layerSpacingFactor - Multiplier for layer separation (1.0 = optimal packing)
 * @returns {Object} Object containing points array and metadata
 */
export function generateHoneycombPoints(gridSize = 3, spacing = 1.0, layerSpacingFactor = 1.0) {
    const points = [];
    
    // For optimal hexagonal close-packing (HCP), the vertical distance
    // between layers is: h = spacing * sqrt(2/3) ≈ spacing * 0.8165
    // This creates the closest-packed arrangement
    const optimalLayerHeight = spacing * Math.sqrt(2/3);
    const layerHeight = optimalLayerHeight * layerSpacingFactor;
    
    // For ABAB stacking, the B layer is offset in x and y
    // The offset places each B point above the centroid of three A points
    const bLayerOffsetX = spacing / 2;
    const bLayerOffsetY = spacing * Math.sqrt(3) / 6;
    
    // Center the grid around origin
    const gridWidth = (gridSize - 1) * spacing + spacing / 2; // Account for hex offset
    const gridHeight = (gridSize - 1) * spacing * Math.sqrt(3) / 2;
    const centerOffsetX = -gridWidth / 2;
    const centerOffsetY = -gridHeight / 2;
    const centerOffsetZ = -layerHeight / 2;
    
    // Generate Layer A (bottom layer, z = 0)
    const layerA = generateHexLattice2D(gridSize, gridSize, spacing, centerOffsetX, centerOffsetY);
    layerA.forEach((pt, index) => {
        points.push({
            x: pt.x,
            y: pt.y,
            z: centerOffsetZ,
            layer: 'A',
            id: `A-${index}`
        });
    });
    
    // Generate Layer B (top layer, offset and elevated)
    const layerB = generateHexLattice2D(gridSize, gridSize, spacing, 
        centerOffsetX + bLayerOffsetX, 
        centerOffsetY + bLayerOffsetY
    );
    layerB.forEach((pt, index) => {
        points.push({
            x: pt.x,
            y: pt.y,
            z: centerOffsetZ + layerHeight,
            layer: 'B',
            id: `B-${index}`
        });
    });
    
    return {
        points,
        metadata: {
            gridSize,
            spacing,
            layerHeight,
            totalPoints: points.length,
            layerACount: layerA.length,
            layerBCount: layerB.length,
            boundingBox: calculateBoundingBox(points)
        }
    };
}

/**
 * Calculate the axis-aligned bounding box for a set of 3D points
 * @param {Array<{x: number, y: number, z: number}>} points 
 * @returns {Object} Bounding box with min and max coordinates
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
 * Get the center point of the grid
 * @param {Array<{x: number, y: number, z: number}>} points 
 * @returns {{x: number, y: number, z: number}} Center point
 */
export function getGridCenter(points) {
    if (points.length === 0) return { x: 0, y: 0, z: 0 };
    
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const pt of points) {
        sumX += pt.x;
        sumY += pt.y;
        sumZ += pt.z;
    }
    
    return {
        x: sumX / points.length,
        y: sumY / points.length,
        z: sumZ / points.length
    };
}

/**
 * Get neighboring points for a given point (useful for Voronoi computation)
 * Returns points sorted by distance
 * @param {Object} point - The reference point
 * @param {Array} allPoints - All points in the grid
 * @param {number} maxNeighbors - Maximum number of neighbors to return
 * @returns {Array} Array of neighboring points sorted by distance
 */
export function getNeighbors(point, allPoints, maxNeighbors = 20) {
    const distances = allPoints
        .filter(p => p.id !== point.id)
        .map(p => ({
            point: p,
            distance: Math.sqrt(
                Math.pow(p.x - point.x, 2) +
                Math.pow(p.y - point.y, 2) +
                Math.pow(p.z - point.z, 2)
            )
        }))
        .sort((a, b) => a.distance - b.distance);
    
    return distances.slice(0, maxNeighbors).map(d => d.point);
}

