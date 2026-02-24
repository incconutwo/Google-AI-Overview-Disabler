const RULE_ID = 1;

// Use a self-executing init function for cleaner scope
(async function init() {
  // Grab DOM elements immediately
  const toggle = document.getElementById('enableToggle');
  const hideAiToggle = document.getElementById('hideAiToggle');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');

  if (!toggle || !statusDot || !statusText || !hideAiToggle) return;

  // Function to update UI states in a single flow
  const updateUI = (isEnabled, isAiHidden) => {
    requestAnimationFrame(() => {
      toggle.checked = isEnabled;
      hideAiToggle.checked = isAiHidden;
      if (isEnabled) {
        statusDot.classList.add('active');
        statusText.textContent = 'Active';
      } else {
        statusDot.classList.remove('active');
        statusText.textContent = 'Disabled';
      }
    });
  };

  try {
    // 1. Get initial state as fast as possible
    const { enabled = true, hideAiMode = false } = await chrome.storage.local.get(['enabled', 'hideAiMode']);
    updateUI(enabled, hideAiMode);

    // 2. Add listener for redirect toggle changes
    toggle.addEventListener('change', async () => {
      const isEnabled = toggle.checked;
      const isAiHidden = hideAiToggle.checked;
      
      // Update UI immediately (optimistic UI)
      updateUI(isEnabled, isAiHidden);

      try {
        // Save to storage
        await chrome.storage.local.set({ enabled: isEnabled });
        
        // Update rulesets
        if (isEnabled) {
          await chrome.declarativeNetRequest.updateEnabledRulesets({
            enableRulesetIds: ['redirect_rules']
          });
        } else {
          await chrome.declarativeNetRequest.updateEnabledRulesets({
            disableRulesetIds: ['redirect_rules']
          });
        }
      } catch (err) {
        console.error('Failed to update state or rules:', err);
        // Revert UI on failure to ensure it matches actual state
        updateUI(!isEnabled, isAiHidden);
      }
    });

    // 3. Add listener for AI Mode toggle changes
    hideAiToggle.addEventListener('change', async () => {
      const isAiHidden = hideAiToggle.checked;
      await chrome.storage.local.set({ hideAiMode: isAiHidden });
    });

  } catch (error) {
    console.error('Initialization error:', error);
  }
})();
