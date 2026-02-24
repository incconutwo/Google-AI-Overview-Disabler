// 1. Immediate Setup
let hideAiModeEnabled = false;
let isStorageLoaded = false;
const OBSERVER_CONFIG = { childList: true, subtree: true };

// 2. Pre-load settings
chrome.storage.local.get(['hideAiMode'], (result) => {
  hideAiModeEnabled = result.hideAiMode || false;
  isStorageLoaded = true;
  updateAiModeVisibility();
  // Force a re-run in case we missed elements
  processAllSpans();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.hideAiMode) {
    hideAiModeEnabled = changes.hideAiMode.newValue;
    updateAiModeVisibility();
  }
});

function updateAiModeVisibility() {
  const aiModeTabs = document.querySelectorAll('[data-gaod-type="ai-mode"]');
  for (const tab of aiModeTabs) {
    tab.style.display = hideAiModeEnabled ? 'none' : '';
  }
}

// 3. Mode Detection Helpers
function isWebMode() {
  return window.location.href.includes('udm=14');
}

function processAllSpans() {
  const allSpans = document.querySelectorAll('span.R1QWuf');
  for (const span of allSpans) {
    processSpan(span);
  }
}

// 4. Core Logic
function processSpan(span) {
  const text = span.textContent.trim();
  const listItem = span.closest('[role="listitem"]');
  if (!listItem) return;

  const inWebMode = isWebMode();

  if (text === 'Web') {
    if (inWebMode) {
      // Logic for Web Mode: It becomes the "All" tab
      if (listItem.dataset.gaodType !== 'simulated-all') {
        span.textContent = 'All';
        listItem.dataset.gaodType = 'simulated-all';
        
        // Move to start
        const parent = listItem.parentElement;
        if (parent && parent.firstElementChild !== listItem) {
          parent.insertBefore(listItem, parent.firstElementChild);
        }
      }
      // Ensure visibility (fix for disappearance)
      if (listItem.style.display === 'none') {
        listItem.style.display = '';
      }
    } 
  } 
  // Handle case where we renamed it to All, we need to maintain it
  else if (text === 'All' && listItem.dataset.gaodType === 'simulated-all') {
     if (inWebMode) {
         // Ensure it stays at top
        const parent = listItem.parentElement;
        if (parent && parent.firstElementChild !== listItem) {
          parent.insertBefore(listItem, parent.firstElementChild);
        }
        // Ensure visible
        if (listItem.style.display === 'none') {
            listItem.style.display = '';
        }
     }
  }
  
  else if (text === 'All' && !listItem.dataset.gaodType) {
    // This is the REAL "All" tab (no dataset tag yet)
    if (inWebMode) {
      listItem.dataset.gaodType = 'original-all';
      listItem.style.display = 'none';
    }
  }
  else if (text === 'All' && listItem.dataset.gaodType === 'original-all') {
      // Re-enforce hiding of original All in web mode
      if (inWebMode && listItem.style.display !== 'none') {
          listItem.style.display = 'none';
      }
  }

  else if (text === 'AI Mode') {
    listItem.dataset.gaodType = 'ai-mode';
    const shouldHide = isStorageLoaded ? hideAiModeEnabled : true; // Default hide until loaded
    // Only apply if strictly different to avoid thrashing
    const desiredDisplay = shouldHide ? 'none' : '';
    if (listItem.style.display !== desiredDisplay) {
        listItem.style.display = desiredDisplay;
    }
  }
}


// 5. Handling Navigation & Dynamic Updates
let lastHref = window.location.href;

const observer = new MutationObserver((mutations) => {
  // Check URL change (SPA navigation)
  if (window.location.href !== lastHref) {
    lastHref = window.location.href;
    // On navigation, Google might re-render or just toggle classes. 
    // We should re-scan.
    processAllSpans();
  }

  for (const mutation of mutations) {
    // Check for added nodes
    for (const node of mutation.addedNodes) {
      if (node.nodeType === 1) { // Element
        if (node.matches && node.matches('span.R1QWuf')) {
          processSpan(node);
        }
        if (node.getElementsByTagName) {
          const spans = node.getElementsByTagName('span');
          for (const span of spans) {
             if (span.classList.contains('R1QWuf')) {
                 processSpan(span);
             }
          }
        }
      }
    }
    
    // Check for Attribute changes (e.g. classes changing on active tab)
    // Google might hide/show tabs dynamically or change classes
    if (mutation.type === 'attributes' && mutation.target.nodeType === 1) {
       // If the modified element is inside one of our interesting items
       const interestingItem = mutation.target.closest('[role="listitem"]');
       if (interestingItem) {
           const span = interestingItem.querySelector('span.R1QWuf');
           if (span) processSpan(span);
       }
    }
  }
});

// Observe
if (document.documentElement) {
  // We added attributeFilter to catch visibility/class changes on list items
  observer.observe(document.documentElement, { 
      childList: true, 
      subtree: true, 
      attributes: true, 
      attributeFilter: ['style', 'class', 'aria-selected'] 
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.documentElement, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style', 'class', 'aria-selected'] 
    });
  });
}
