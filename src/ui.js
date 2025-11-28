/**
 * UI Controller Module
 * 
 * Handles all user interface interactions including toggles,
 * sliders, and educational content display.
 */

let api = null;

/**
 * Initialize UI controls
 * @param {Object} appApi - API functions from main.js
 */
export function initUI(appApi) {
    api = appApi;
    
    setupToggleButtons();
    setupSliders();
    setupKeyboardShortcuts();
}

/**
 * Set up toggle button functionality
 */
function setupToggleButtons() {
    const togglePoints = document.getElementById('toggle-points');
    const toggleCells = document.getElementById('toggle-cells');
    
    if (togglePoints) {
        togglePoints.addEventListener('click', () => {
            const isActive = togglePoints.classList.toggle('active');
            api.togglePoints(isActive);
            updateToggleAccessibility(togglePoints, isActive);
        });
    }
    
    if (toggleCells) {
        toggleCells.addEventListener('click', () => {
            const isActive = toggleCells.classList.toggle('active');
            api.toggleCells(isActive);
            updateToggleAccessibility(toggleCells, isActive);
            
            // If cells are shown, potentially also show points for context
            // (This is a UX decision - can be adjusted)
        });
    }
}

/**
 * Update accessibility attributes for toggle buttons
 */
function updateToggleAccessibility(button, isActive) {
    button.setAttribute('aria-pressed', isActive.toString());
}

/**
 * Set up slider controls
 */
function setupSliders() {
    const gridSizeSlider = document.getElementById('grid-size');
    const gridSizeValue = document.getElementById('grid-size-value');
    const layerSpacingSlider = document.getElementById('layer-spacing');
    const layerSpacingValue = document.getElementById('layer-spacing-value');
    
    if (gridSizeSlider && gridSizeValue) {
        // Set initial value display
        updateGridSizeDisplay(gridSizeSlider.value, gridSizeValue);
        
        gridSizeSlider.addEventListener('input', (e) => {
            updateGridSizeDisplay(e.target.value, gridSizeValue);
        });
        
        gridSizeSlider.addEventListener('change', (e) => {
            const size = parseInt(e.target.value, 10);
            api.setGridSize(size);
        });
    }
    
    if (layerSpacingSlider && layerSpacingValue) {
        // Set initial value display
        updateLayerSpacingDisplay(layerSpacingSlider.value, layerSpacingValue);
        
        layerSpacingSlider.addEventListener('input', (e) => {
            updateLayerSpacingDisplay(e.target.value, layerSpacingValue);
        });
        
        layerSpacingSlider.addEventListener('change', (e) => {
            const spacing = parseFloat(e.target.value);
            api.setLayerSpacing(spacing);
        });
    }
}

/**
 * Update grid size display text
 */
function updateGridSizeDisplay(value, element) {
    element.textContent = `${value}×${value}`;
}

/**
 * Update layer spacing display text
 */
function updateLayerSpacingDisplay(value, element) {
    element.textContent = parseFloat(value).toFixed(1);
}

/**
 * Set up keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ignore if user is typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case 'p':
                // Toggle points
                const togglePoints = document.getElementById('toggle-points');
                if (togglePoints) {
                    togglePoints.click();
                }
                break;
                
            case 'c':
                // Toggle cells
                const toggleCells = document.getElementById('toggle-cells');
                if (toggleCells) {
                    toggleCells.click();
                }
                break;
                
            case 'b':
                // Toggle both
                const tp = document.getElementById('toggle-points');
                const tc = document.getElementById('toggle-cells');
                if (tp && tc) {
                    tp.click();
                    tc.click();
                }
                break;
                
            case 'r':
                // Reset view (would need camera reset function)
                break;
                
            case '?':
            case 'h':
                // Show help (could toggle a help overlay)
                showKeyboardHelp();
                break;
        }
    });
}

/**
 * Show keyboard shortcuts help (could be expanded to a modal)
 */
function showKeyboardHelp() {
    console.log(`
🎹 Keyboard Shortcuts:
  P - Toggle seed points
  C - Toggle Voronoi cells
  B - Toggle both
  H/? - Show this help
  
🖱️ Mouse Controls:
  Drag - Rotate view
  Scroll - Zoom in/out
  Right-drag - Pan
    `);
}

/**
 * Create a notification toast (for feedback)
 */
export function showNotification(message, duration = 2000) {
    // Check if notification container exists, create if not
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.textContent = message;
    toast.style.cssText = `
        background: rgba(251, 191, 36, 0.9);
        color: #0c0a09;
        padding: 12px 20px;
        border-radius: 8px;
        margin-top: 10px;
        font-family: 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(20px);
        transition: opacity 0.3s, transform 0.3s;
    `;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    });
    
    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

/**
 * Update UI state to match app state (for sync after programmatic changes)
 */
export function syncUIState(state) {
    const togglePoints = document.getElementById('toggle-points');
    const toggleCells = document.getElementById('toggle-cells');
    const gridSizeSlider = document.getElementById('grid-size');
    const layerSpacingSlider = document.getElementById('layer-spacing');
    
    if (togglePoints) {
        togglePoints.classList.toggle('active', state.showPoints);
    }
    if (toggleCells) {
        toggleCells.classList.toggle('active', state.showCells);
    }
    if (gridSizeSlider) {
        gridSizeSlider.value = state.gridSize;
        const display = document.getElementById('grid-size-value');
        if (display) updateGridSizeDisplay(state.gridSize, display);
    }
    if (layerSpacingSlider) {
        layerSpacingSlider.value = state.layerSpacing;
        const display = document.getElementById('layer-spacing-value');
        if (display) updateLayerSpacingDisplay(state.layerSpacing, display);
    }
}

