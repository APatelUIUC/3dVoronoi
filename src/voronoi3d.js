/**
 * 3D Voronoi Tessellation using Plane Cutting
 * 
 * This implements the core algorithm used by Voro++:
 * 1. Initialize each cell as a large bounding box (convex polyhedron)
 * 2. For each seed point, cut with perpendicular bisector planes to all neighbors
 * 3. The resulting convex polyhedron is the Voronoi cell
 */

const EPSILON = 1e-10;

/**
 * Represents a 3D vector
 */
class Vec3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    
    clone() {
        return new Vec3(this.x, this.y, this.z);
    }
    
    add(v) {
        return new Vec3(this.x + v.x, this.y + v.y, this.z + v.z);
    }
    
    sub(v) {
        return new Vec3(this.x - v.x, this.y - v.y, this.z - v.z);
    }
    
    scale(s) {
        return new Vec3(this.x * s, this.y * s, this.z * s);
    }
    
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    
    cross(v) {
        return new Vec3(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }
    
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }
    
    normalize() {
        const len = this.length();
        if (len < EPSILON) return new Vec3(0, 0, 0);
        return this.scale(1 / len);
    }
    
    equals(v) {
        return Math.abs(this.x - v.x) < EPSILON &&
               Math.abs(this.y - v.y) < EPSILON &&
               Math.abs(this.z - v.z) < EPSILON;
    }
}

/**
 * Represents a plane in 3D space: ax + by + cz + d = 0
 * Where (a, b, c) is the normal and d is the distance from origin
 */
class Plane {
    constructor(normal, d) {
        this.normal = normal.normalize();
        this.d = d;
    }
    
    /**
     * Create a plane from a point and normal
     */
    static fromPointAndNormal(point, normal) {
        const n = normal.normalize();
        const d = -n.dot(point);
        return new Plane(n, d);
    }
    
    /**
     * Create a perpendicular bisector plane between two points
     * The plane passes through the midpoint and is perpendicular to the line connecting them
     */
    static perpendicularBisector(p1, p2) {
        const midpoint = new Vec3(
            (p1.x + p2.x) / 2,
            (p1.y + p2.y) / 2,
            (p1.z + p2.z) / 2
        );
        const normal = new Vec3(p2.x - p1.x, p2.y - p1.y, p2.z - p1.z);
        return Plane.fromPointAndNormal(midpoint, normal);
    }
    
    /**
     * Get signed distance from point to plane
     * Positive = in front of plane (in direction of normal)
     * Negative = behind plane
     */
    signedDistance(point) {
        return this.normal.dot(point) + this.d;
    }
}

/**
 * Represents a convex polyhedron as a collection of vertices and faces
 */
class ConvexPolyhedron {
    constructor() {
        this.vertices = [];
        this.faces = [];  // Each face is an array of vertex indices (counter-clockwise when viewed from outside)
    }
    
    /**
     * Create an axis-aligned bounding box polyhedron
     */
    static createBox(minX, minY, minZ, maxX, maxY, maxZ) {
        const poly = new ConvexPolyhedron();
        
        // 8 vertices of the box
        poly.vertices = [
            new Vec3(minX, minY, minZ), // 0
            new Vec3(maxX, minY, minZ), // 1
            new Vec3(maxX, maxY, minZ), // 2
            new Vec3(minX, maxY, minZ), // 3
            new Vec3(minX, minY, maxZ), // 4
            new Vec3(maxX, minY, maxZ), // 5
            new Vec3(maxX, maxY, maxZ), // 6
            new Vec3(minX, maxY, maxZ), // 7
        ];
        
        // 6 faces (counter-clockwise when viewed from outside)
        poly.faces = [
            [0, 3, 2, 1], // bottom (z = minZ)
            [4, 5, 6, 7], // top (z = maxZ)
            [0, 1, 5, 4], // front (y = minY)
            [2, 3, 7, 6], // back (y = maxY)
            [0, 4, 7, 3], // left (x = minX)
            [1, 2, 6, 5], // right (x = maxX)
        ];
        
        return poly;
    }
    
    /**
     * Clone this polyhedron
     */
    clone() {
        const poly = new ConvexPolyhedron();
        poly.vertices = this.vertices.map(v => v.clone());
        poly.faces = this.faces.map(f => [...f]);
        return poly;
    }
    
    /**
     * Cut the polyhedron with a plane, keeping the negative half-space
     * (the side opposite to the plane normal)
     */
    cutWithPlane(plane) {
        // Classify each vertex as inside (negative), outside (positive), or on the plane
        const distances = this.vertices.map(v => plane.signedDistance(v));
        const INSIDE = -1, ON = 0, OUTSIDE = 1;
        
        const classify = (d) => {
            if (d < -EPSILON) return INSIDE;
            if (d > EPSILON) return OUTSIDE;
            return ON;
        };
        
        const classifications = distances.map(classify);
        
        // Check if any vertices are outside - if not, no cutting needed
        const hasOutside = classifications.some(c => c === OUTSIDE);
        const hasInside = classifications.some(c => c === INSIDE);
        
        if (!hasOutside) {
            // All vertices are inside or on the plane - no cut needed
            return;
        }
        
        if (!hasInside) {
            // All vertices are outside or on the plane - cell is completely cut away
            this.vertices = [];
            this.faces = [];
            return;
        }
        
        // We need to cut - create new vertices and faces
        const newVertices = [];
        const newFaces = [];
        const edgeIntersections = new Map(); // Maps edge string to new vertex index
        
        // Helper to get intersection point on an edge
        const getEdgeKey = (i, j) => i < j ? `${i}-${j}` : `${j}-${i}`;
        
        const getOrCreateIntersection = (i, j) => {
            const key = getEdgeKey(i, j);
            if (edgeIntersections.has(key)) {
                return edgeIntersections.get(key);
            }
            
            // Calculate intersection point
            const v1 = this.vertices[i];
            const v2 = this.vertices[j];
            const d1 = distances[i];
            const d2 = distances[j];
            
            // Linear interpolation to find intersection
            const t = d1 / (d1 - d2);
            const intersection = new Vec3(
                v1.x + t * (v2.x - v1.x),
                v1.y + t * (v2.y - v1.y),
                v1.z + t * (v2.z - v1.z)
            );
            
            const newIndex = newVertices.length;
            newVertices.push(intersection);
            edgeIntersections.set(key, newIndex);
            return newIndex;
        };
        
        // First, copy inside vertices and create mapping
        const vertexMap = new Map(); // old index -> new index
        for (let i = 0; i < this.vertices.length; i++) {
            if (classifications[i] !== OUTSIDE) {
                vertexMap.set(i, newVertices.length);
                newVertices.push(this.vertices[i].clone());
            }
        }
        
        // Process each face
        const capEdges = []; // Edges that will form the new cap face
        
        for (const face of this.faces) {
            const newFace = [];
            const n = face.length;
            
            for (let i = 0; i < n; i++) {
                const curr = face[i];
                const next = face[(i + 1) % n];
                const currClass = classifications[curr];
                const nextClass = classifications[next];
                
                // Add current vertex if it's inside or on the plane
                if (currClass !== OUTSIDE) {
                    newFace.push(vertexMap.get(curr));
                }
                
                // Check if edge crosses the plane
                if ((currClass === INSIDE && nextClass === OUTSIDE) ||
                    (currClass === OUTSIDE && nextClass === INSIDE)) {
                    const intersectionIndex = getOrCreateIntersection(curr, next);
                    newFace.push(intersectionIndex);
                    
                    // Track edges for cap face
                    if (currClass === INSIDE) {
                        capEdges.push([intersectionIndex, curr, next]);
                    } else {
                        capEdges.push([intersectionIndex, next, curr]);
                    }
                } else if (currClass === ON && nextClass === OUTSIDE) {
                    // Current vertex is on plane, next is outside
                    capEdges.push([vertexMap.get(curr), curr, next]);
                } else if (currClass === OUTSIDE && nextClass === ON) {
                    // Current is outside, next is on plane
                    capEdges.push([vertexMap.get(next), next, curr]);
                }
            }
            
            // Add the face if it has at least 3 vertices
            if (newFace.length >= 3) {
                newFaces.push(newFace);
            }
        }
        
        // Create the cap face from the intersection edges
        if (capEdges.length >= 3) {
            const capFace = this.buildCapFace(capEdges, newVertices, plane);
            if (capFace && capFace.length >= 3) {
                newFaces.push(capFace);
            }
        }
        
        this.vertices = newVertices;
        this.faces = newFaces;
    }
    
    /**
     * Build a cap face from intersection edges
     */
    buildCapFace(capEdges, vertices, plane) {
        if (capEdges.length < 3) return null;
        
        // Get unique vertices on the cap
        const capVertexIndices = [...new Set(capEdges.map(e => e[0]))];
        
        if (capVertexIndices.length < 3) return null;
        
        // Sort vertices in counter-clockwise order when viewed from the plane normal direction
        const center = new Vec3(0, 0, 0);
        for (const idx of capVertexIndices) {
            center.x += vertices[idx].x;
            center.y += vertices[idx].y;
            center.z += vertices[idx].z;
        }
        center.x /= capVertexIndices.length;
        center.y /= capVertexIndices.length;
        center.z /= capVertexIndices.length;
        
        // Use plane normal to determine winding direction
        // We want counter-clockwise when viewed from the inside (opposite to plane normal)
        const normal = plane.normal.scale(-1); // Inward normal for the cap
        
        // Find a tangent vector on the plane
        let tangent;
        if (Math.abs(normal.x) < 0.9) {
            tangent = new Vec3(1, 0, 0).cross(normal).normalize();
        } else {
            tangent = new Vec3(0, 1, 0).cross(normal).normalize();
        }
        const bitangent = normal.cross(tangent);
        
        // Sort by angle around center
        capVertexIndices.sort((a, b) => {
            const va = vertices[a].sub(center);
            const vb = vertices[b].sub(center);
            const angleA = Math.atan2(va.dot(bitangent), va.dot(tangent));
            const angleB = Math.atan2(vb.dot(bitangent), vb.dot(tangent));
            return angleA - angleB;
        });
        
        return capVertexIndices;
    }
    
    /**
     * Get edges as pairs of vertex indices
     */
    getEdges() {
        const edges = new Set();
        
        for (const face of this.faces) {
            const n = face.length;
            for (let i = 0; i < n; i++) {
                const a = face[i];
                const b = face[(i + 1) % n];
                const key = a < b ? `${a}-${b}` : `${b}-${a}`;
                edges.add(key);
            }
        }
        
        return Array.from(edges).map(key => {
            const [a, b] = key.split('-').map(Number);
            return [a, b];
        });
    }
    
    /**
     * Calculate the volume of the polyhedron
     */
    getVolume() {
        if (this.vertices.length < 4 || this.faces.length < 4) return 0;
        
        let volume = 0;
        const origin = new Vec3(0, 0, 0);
        
        for (const face of this.faces) {
            if (face.length < 3) continue;
            
            // Triangulate the face and sum tetrahedron volumes
            const v0 = this.vertices[face[0]];
            for (let i = 1; i < face.length - 1; i++) {
                const v1 = this.vertices[face[i]];
                const v2 = this.vertices[face[i + 1]];
                
                // Signed volume of tetrahedron with origin
                volume += v0.dot(v1.cross(v2)) / 6;
            }
        }
        
        return Math.abs(volume);
    }
    
    /**
     * Get the centroid of the polyhedron
     */
    getCentroid() {
        if (this.vertices.length === 0) return new Vec3(0, 0, 0);
        
        const sum = new Vec3(0, 0, 0);
        for (const v of this.vertices) {
            sum.x += v.x;
            sum.y += v.y;
            sum.z += v.z;
        }
        
        return new Vec3(
            sum.x / this.vertices.length,
            sum.y / this.vertices.length,
            sum.z / this.vertices.length
        );
    }
}

/**
 * Compute 3D Voronoi cells for a set of seed points
 * 
 * @param {Array<{x: number, y: number, z: number}>} seeds - Seed points
 * @param {Object} bounds - Bounding box for the tessellation
 * @param {number} padding - Padding around the bounds
 * @returns {Array<{seed: Object, cell: ConvexPolyhedron}>} Voronoi cells
 */
export function computeVoronoiCells(seeds, bounds, padding = 0.5) {
    if (seeds.length === 0) return [];
    
    // Expand bounds with padding
    const expandedBounds = {
        min: {
            x: bounds.min.x - padding,
            y: bounds.min.y - padding,
            z: bounds.min.z - padding
        },
        max: {
            x: bounds.max.x + padding,
            y: bounds.max.y + padding,
            z: bounds.max.z + padding
        }
    };
    
    const cells = [];
    
    for (const seed of seeds) {
        const seedVec = new Vec3(seed.x, seed.y, seed.z);
        
        // Initialize cell as bounding box
        let cell = ConvexPolyhedron.createBox(
            expandedBounds.min.x, expandedBounds.min.y, expandedBounds.min.z,
            expandedBounds.max.x, expandedBounds.max.y, expandedBounds.max.z
        );
        
        // Sort other seeds by distance to this seed (cut with closest first)
        const otherSeeds = seeds
            .filter(s => s !== seed)
            .map(s => ({
                seed: s,
                distance: Math.sqrt(
                    Math.pow(s.x - seed.x, 2) +
                    Math.pow(s.y - seed.y, 2) +
                    Math.pow(s.z - seed.z, 2)
                )
            }))
            .sort((a, b) => a.distance - b.distance);
        
        // Cut with perpendicular bisector planes
        for (const other of otherSeeds) {
            if (cell.vertices.length === 0) break;
            
            // Early termination: if the closest vertex to the other seed
            // is further than twice the distance to the bisector plane,
            // no more cuts are needed from seeds at this distance or further
            const otherVec = new Vec3(other.seed.x, other.seed.y, other.seed.z);
            const bisector = Plane.perpendicularBisector(seedVec, otherVec);
            
            // Check if any vertex could possibly be cut
            const maxDist = Math.max(...cell.vertices.map(v => bisector.signedDistance(v)));
            if (maxDist < -EPSILON) {
                // All vertices are on the inside - but we should continue
                // checking other seeds as they might still cut
                continue;
            }
            
            cell.cutWithPlane(bisector);
        }
        
        if (cell.vertices.length > 0) {
            cells.push({
                seed: seed,
                cell: cell
            });
        }
    }
    
    return cells;
}

/**
 * Convert a Voronoi cell to mesh data for Three.js
 * @param {ConvexPolyhedron} cell - The Voronoi cell
 * @returns {Object} Object with vertices, faces, and edges arrays
 */
export function cellToMeshData(cell) {
    // Vertices as flat array [x1, y1, z1, x2, y2, z2, ...]
    const vertices = [];
    for (const v of cell.vertices) {
        vertices.push(v.x, v.y, v.z);
    }
    
    // Triangulate faces for rendering
    const indices = [];
    for (const face of cell.faces) {
        if (face.length < 3) continue;
        
        // Fan triangulation from first vertex
        for (let i = 1; i < face.length - 1; i++) {
            indices.push(face[0], face[i], face[i + 1]);
        }
    }
    
    // Edges as pairs of vertex indices
    const edges = cell.getEdges();
    
    // Face data for potential face coloring
    const faceData = cell.faces.map(face => ({
        vertices: face,
        center: (() => {
            const center = new Vec3(0, 0, 0);
            for (const idx of face) {
                center.x += cell.vertices[idx].x;
                center.y += cell.vertices[idx].y;
                center.z += cell.vertices[idx].z;
            }
            return {
                x: center.x / face.length,
                y: center.y / face.length,
                z: center.z / face.length
            };
        })()
    }));
    
    return {
        vertices,
        indices,
        edges,
        faceData,
        vertexCount: cell.vertices.length,
        faceCount: cell.faces.length,
        volume: cell.getVolume(),
        centroid: cell.getCentroid()
    };
}

export { Vec3, Plane, ConvexPolyhedron };

