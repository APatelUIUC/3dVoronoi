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
    setupModeButtons();
    setupKeyboardShortcuts();
    
    // Sync initial state to UI
    syncUIState(api.getState());
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
 * Set up mode buttons (Random/Honeycomb)
 */
function setupModeButtons() {
    const randomBtn = document.getElementById('btn-random');
    const honeycombBtn = document.getElementById('btn-honeycomb');
    
    if (randomBtn) {
        randomBtn.addEventListener('click', () => {
            api.setRandomMode();
            updateModeButtonState(true);
            showNotification('🎲 Random points generated');
        });
    }
    
    if (honeycombBtn) {
        honeycombBtn.addEventListener('click', () => {
            api.resetToHoneycomb();
            updateModeButtonState(false);
            showNotification('🍯 Honeycomb pattern restored');
        });
    }
}

/**
 * Update mode button visual state
 */
function updateModeButtonState(isRandomMode) {
    const randomBtn = document.getElementById('btn-random');
    const honeycombBtn = document.getElementById('btn-honeycomb');
    
    if (randomBtn && honeycombBtn) {
        randomBtn.classList.toggle('active', isRandomMode);
        honeycombBtn.classList.toggle('active', !isRandomMode);
    }
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
 * Show keyboard shortcuts help as a polished overlay modal
 */
function showKeyboardHelp() {
    // Check if overlay already exists
    let overlay = document.getElementById('keyboard-help-overlay');
    if (overlay) {
        overlay.classList.toggle('visible');
        return;
    }
    
    // Create overlay
    overlay = document.createElement('div');
    overlay.id = 'keyboard-help-overlay';
    overlay.innerHTML = `
        <div class="help-modal">
            <div class="help-header">
                <h3>⌨️ Keyboard Shortcuts</h3>
                <button class="close-btn" aria-label="Close">&times;</button>
            </div>
            <div class="help-content">
                <div class="help-section">
                    <h4>Visualization</h4>
                    <div class="shortcut-row"><kbd>P</kbd><span>Toggle seed points</span></div>
                    <div class="shortcut-row"><kbd>C</kbd><span>Toggle Voronoi cells</span></div>
                    <div class="shortcut-row"><kbd>B</kbd><span>Toggle both</span></div>
                </div>
                <div class="help-section">
                    <h4>Navigation</h4>
                    <div class="shortcut-row"><kbd>H</kbd> / <kbd>?</kbd><span>Show this help</span></div>
                    <div class="shortcut-row"><kbd>Esc</kbd><span>Close this panel</span></div>
                </div>
                <div class="help-section mouse-section">
                    <h4>🖱️ Mouse Controls</h4>
                    <div class="shortcut-row"><span class="mouse-action">Drag</span><span>Rotate view</span></div>
                    <div class="shortcut-row"><span class="mouse-action">Scroll</span><span>Zoom in/out</span></div>
                    <div class="shortcut-row"><span class="mouse-action">Right-drag</span><span>Pan</span></div>
                </div>
            </div>
        </div>
    `;
    
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(8, 7, 6, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    `;
    
    const modalStyles = `
        <style>
            #keyboard-help-overlay.visible {
                opacity: 1 !important;
                visibility: visible !important;
            }
            
            #keyboard-help-overlay .help-modal {
                background: linear-gradient(135deg, rgba(28, 25, 23, 0.98), rgba(12, 10, 9, 0.95));
                border: 1px solid rgba(251, 191, 36, 0.2);
                border-radius: 20px;
                padding: 0;
                min-width: 360px;
                max-width: 90vw;
                box-shadow: 
                    0 25px 60px -15px rgba(0, 0, 0, 0.5),
                    0 0 80px -20px rgba(251, 191, 36, 0.15);
                transform: scale(0.95) translateY(10px);
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                overflow: hidden;
            }
            
            #keyboard-help-overlay.visible .help-modal {
                transform: scale(1) translateY(0);
            }
            
            #keyboard-help-overlay .help-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px;
                background: rgba(251, 191, 36, 0.08);
                border-bottom: 1px solid rgba(251, 191, 36, 0.1);
            }
            
            #keyboard-help-overlay .help-header h3 {
                font-size: 1.1rem;
                font-weight: 600;
                color: #fcd34d;
                margin: 0;
            }
            
            #keyboard-help-overlay .close-btn {
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #a8a29e;
                width: 32px;
                height: 32px;
                border-radius: 8px;
                font-size: 1.4rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
                line-height: 1;
            }
            
            #keyboard-help-overlay .close-btn:hover {
                background: rgba(251, 191, 36, 0.15);
                border-color: rgba(251, 191, 36, 0.3);
                color: #fcd34d;
            }
            
            #keyboard-help-overlay .help-content {
                padding: 24px;
            }
            
            #keyboard-help-overlay .help-section {
                margin-bottom: 20px;
            }
            
            #keyboard-help-overlay .help-section:last-child {
                margin-bottom: 0;
            }
            
            #keyboard-help-overlay .help-section h4 {
                font-size: 0.7rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.12em;
                color: #f59e0b;
                margin-bottom: 12px;
            }
            
            #keyboard-help-overlay .shortcut-row {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 8px 0;
                color: #e7e5e4;
                font-size: 0.9rem;
            }
            
            #keyboard-help-overlay kbd {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 28px;
                height: 28px;
                padding: 0 10px;
                background: linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(251, 191, 36, 0.08));
                border: 1px solid rgba(251, 191, 36, 0.25);
                border-radius: 6px;
                font-family: 'DM Sans', sans-serif;
                font-size: 0.8rem;
                font-weight: 600;
                color: #fcd34d;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            }
            
            #keyboard-help-overlay .mouse-action {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 80px;
                height: 28px;
                padding: 0 12px;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 6px;
                font-size: 0.8rem;
                font-weight: 500;
                color: #a8a29e;
            }
            
            #keyboard-help-overlay .mouse-section {
                padding-top: 16px;
                border-top: 1px solid rgba(255, 255, 255, 0.06);
            }
        </style>
    `;
    
    overlay.innerHTML = modalStyles + overlay.innerHTML;
    document.body.appendChild(overlay);
    
    // Event listeners
    const closeBtn = overlay.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        overlay.classList.remove('visible');
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.classList.remove('visible');
        }
    });
    
    // Show with animation
    requestAnimationFrame(() => {
        overlay.classList.add('visible');
    });
    
    // Add escape key listener
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape' && overlay.classList.contains('visible')) {
            overlay.classList.remove('visible');
        }
    });
}

/**
 * Create a notification toast (for feedback) - Premium styled
 */
export function showNotification(message, duration = 2500) {
    // Check if notification container exists, create if not
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `<span class="toast-icon">${message.split(' ')[0]}</span><span class="toast-text">${message.split(' ').slice(1).join(' ')}</span>`;
    toast.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        background: linear-gradient(135deg, rgba(251, 191, 36, 0.95), rgba(245, 158, 11, 0.9));
        color: #0c0a09;
        padding: 14px 20px;
        border-radius: 12px;
        font-family: 'DM Sans', 'Outfit', sans-serif;
        font-size: 14px;
        font-weight: 500;
        opacity: 0;
        transform: translateX(30px) scale(0.95);
        transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 
            0 10px 30px -10px rgba(251, 191, 36, 0.4),
            0 4px 12px rgba(0, 0, 0, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.15);
        pointer-events: auto;
    `;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0) scale(1)';
        });
    });
    
    // Remove after duration
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(30px) scale(0.95)';
        setTimeout(() => toast.remove(), 400);
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

