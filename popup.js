const RULE_ID = 1;

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('enableToggle');
  const statusDot = document.querySelector('.status-dot');
  const statusText = document.querySelector('.status-text');

  // Load saved state
  const { enabled = true } = await chrome.storage.local.get('enabled');
  toggle.checked = enabled;
  updateStatus(enabled);

  // Handle toggle change
  toggle.addEventListener('change', async () => {
    const isEnabled = toggle.checked;
    
    await chrome.storage.local.set({ enabled: isEnabled });
    
    if (isEnabled) {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        enableRulesetIds: ['redirect_rules']
      });
    } else {
      await chrome.declarativeNetRequest.updateEnabledRulesets({
        disableRulesetIds: ['redirect_rules']
      });
    }
    
    updateStatus(isEnabled);
  });

  function updateStatus(isEnabled) {
    if (isEnabled) {
      statusDot.classList.add('active');
      statusText.textContent = 'Active';
    } else {
      statusDot.classList.remove('active');
      statusText.textContent = 'Disabled';
    }
  }
});
