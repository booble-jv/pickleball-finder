// Pickleball Finder - Renderer Process JavaScript

// Window control functionality
function initializeWindowControls() {
    console.log('Initializing window controls...');
    console.log('ElectronAPI available:', !!window.electronAPI);
    
    const minimizeBtn = document.getElementById('minimizeBtn');
    const maximizeBtn = document.getElementById('maximizeBtn');
    const closeBtn = document.getElementById('closeBtn');

    console.log('Buttons found:', {
        minimize: !!minimizeBtn,
        maximize: !!maximizeBtn,
        close: !!closeBtn
    });

    if (!window.electronAPI) {
        console.log('ElectronAPI not available - window controls will not work');
        // Don't hide the title bar, just disable functionality
        return;
    }

    minimizeBtn?.addEventListener('click', () => {
        window.electronAPI.windowControl('minimize');
    });

    maximizeBtn?.addEventListener('click', async () => {
        window.electronAPI.windowControl('maximize');
        
        // Update maximize button icon
        try {
            const isMaximized = await window.electronAPI.isMaximized();
            updateMaximizeButton(isMaximized);
        } catch (error) {
            console.log('Could not get window state:', error);
        }
    });

    closeBtn?.addEventListener('click', () => {
        window.electronAPI.windowControl('close');
    });

    // Check initial maximize state
    if (window.electronAPI.isMaximized) {
        window.electronAPI.isMaximized().then(isMaximized => {
            updateMaximizeButton(isMaximized);
        }).catch(error => {
            console.log('Could not get initial window state:', error);
        });
    }
}

// Update maximize button appearance
function updateMaximizeButton(isMaximized) {
    const maximizeBtn = document.getElementById('maximizeBtn');
    if (!maximizeBtn) return;

    if (isMaximized) {
        maximizeBtn.classList.add('maximized');
        maximizeBtn.title = 'Restore';
        // Update SVG for restore icon
        maximizeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="1" y="3" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
                <rect x="3" y="1" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
        `;
    } else {
        maximizeBtn.classList.remove('maximized');
        maximizeBtn.title = 'Maximize';
        // Update SVG for maximize icon
        maximizeBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 12 12">
                <rect x="1" y="1" width="10" height="10" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
        `;
    }
}

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));

            // Add active class to clicked button
            button.classList.add('active');

            // Show corresponding tab pane
            const tabId = button.getAttribute('data-tab');
            const targetPane = document.getElementById(tabId);
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });
}

// Search functionality
function initializeSearch() {
    const searchBtn = document.getElementById('searchBtn');
    const locationInput = document.getElementById('locationInput');

    function performSearch() {
        const location = locationInput.value.trim();
        if (!location) {
            alert('Please enter a location to search.');
            return;
        }

        console.log('Searching for courts and players in:', location);
        
        // Show loading state
        searchBtn.textContent = 'Searching...';
        searchBtn.disabled = true;

        // Simulate search with timeout
        setTimeout(() => {
            searchBtn.textContent = 'Search';
            searchBtn.disabled = false;
            
            // You can add actual search logic here
            showSearchResults(location);
        }, 1500);
    }

    searchBtn.addEventListener('click', performSearch);
    
    locationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

// Show search results (placeholder)
function showSearchResults(location) {
    console.log(`Showing results for: ${location}`);
    // Add animation to results
    const resultsSection = document.querySelector('.results-section');
    resultsSection.classList.add('fade-in');
}

// Footer button handlers
function initializeFooterButtons() {
    const addCourtBtn = document.getElementById('addCourtBtn');
    const createEventBtn = document.getElementById('createEventBtn');
    const settingsBtn = document.getElementById('settingsBtn');

    addCourtBtn.addEventListener('click', () => {
        console.log('Add Court clicked');
        // You can implement a modal or new window here
        alert('Add Court feature coming soon!');
    });

    createEventBtn.addEventListener('click', () => {
        console.log('Create Event clicked');
        alert('Create Event feature coming soon!');
    });

    settingsBtn.addEventListener('click', () => {
        console.log('Settings clicked');
        alert('Settings feature coming soon!');
    });
}

// Card interaction handlers
function initializeCardInteractions() {
    // Handle "View Details" buttons for courts
    document.addEventListener('click', (e) => {
        if (e.target.textContent === 'View Details') {
            const card = e.target.closest('.card');
            const courtName = card.querySelector('h3').textContent;
            console.log('View details for:', courtName);
            alert(`Details for ${courtName} - Feature coming soon!`);
        }
        
        if (e.target.textContent === 'Connect') {
            const card = e.target.closest('.card');
            const playerName = card.querySelector('h3').textContent;
            console.log('Connect with:', playerName);
            alert(`Connecting with ${playerName} - Feature coming soon!`);
        }
        
        if (e.target.textContent === 'Join Event') {
            const card = e.target.closest('.card');
            const eventName = card.querySelector('h3').textContent;
            console.log('Join event:', eventName);
            alert(`Joining ${eventName} - Feature coming soon!`);
        }
    });
}

// Get app version from main process
async function loadAppVersion() {
    try {
        if (window.electronAPI && window.electronAPI.getAppVersion) {
            const version = await window.electronAPI.getAppVersion();
            const versionElement = document.getElementById('appVersion');
            if (versionElement) {
                versionElement.textContent = `Version ${version}`;
            }
        }
    } catch (error) {
        console.log('Could not load app version:', error);
        const versionElement = document.getElementById('appVersion');
        if (versionElement) {
            versionElement.textContent = 'Version 1.0.0';
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Pickleball Finder initialized');
    
    // Show dev indicator if in development mode
    const devIndicator = document.getElementById('devIndicator');
    if (devIndicator && window.electronAPI && window.electronAPI.isDevMode) {
        try {
            const isDevMode = await window.electronAPI.isDevMode();
            console.log('Dev mode status:', isDevMode);
            
            if (isDevMode) {
                devIndicator.style.display = 'inline';
                console.log('✅ Development mode detected - showing dev indicator');
            } else {
                devIndicator.style.display = 'none';
                console.log('❌ Production mode - hiding dev indicator');
            }
        } catch (error) {
            console.log('Could not get dev mode status:', error);
        }
    }
    
    initializeWindowControls();
    initializeTabs();
    initializeSearch();
    initializeFooterButtons();
    initializeCardInteractions();
    loadAppVersion();
    
    // Add fade-in animation to main content
    setTimeout(() => {
        document.querySelector('.app-container').classList.add('fade-in');
    }, 100);
});

// Listen for menu events from main process
if (window.electronAPI) {
    window.electronAPI.onMenuNewFile?.(() => {
        console.log('New file requested from menu');
    });
    
    window.electronAPI.onMenuOpenFile?.((filePath) => {
        console.log('Open file requested from menu:', filePath);
    });
    
    window.electronAPI.onMenuSettings?.(() => {
        console.log('Settings requested from menu');
        document.getElementById('settingsBtn')?.click();
    });
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeWindowControls,
        updateMaximizeButton,
        initializeTabs,
        initializeSearch,
        showSearchResults,
        initializeFooterButtons,
        initializeCardInteractions,
        loadAppVersion
    };
}