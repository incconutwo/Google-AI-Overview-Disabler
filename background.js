chrome.runtime.onInstalled.addListener(async () => {
  // Ensure we have a default state
  const { enabled = true } = await chrome.storage.local.get('enabled');
  await chrome.storage.local.set({ enabled });

  // Sync laws/rules with initial state
  if (enabled) {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      enableRulesetIds: ['redirect_rules']
    });
  } else {
    await chrome.declarativeNetRequest.updateEnabledRulesets({
      disableRulesetIds: ['redirect_rules']
    });
  }
});
