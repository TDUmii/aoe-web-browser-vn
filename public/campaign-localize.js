// The public engine caches parsed scenario objects. Translate presentation fields
// before campaignflow copies them into its mission screen. Keep scenario names,
// paths, player settings, objective conditions, resource costs and victory rules.
const TEXT_FIELDS = ['description', 'hints', 'winMessage', 'lossMessage', 'history'];

export async function applyCampaignVietnamese(loadCampaignScenario, catalog) {
  // Requests for missions in one campaign share the engine's cached file fetch.
  // Register every translation immediately; callers may await this before startup
  // to guarantee that even a fast launch cannot render the original English text.
  const counts = await Promise.all((catalog.campaigns ?? []).map(async entry => {
    const scenario = await loadCampaignScenario(entry.file, entry.index);
    if (scenario.name !== entry.expectedName) {
      throw new Error('campaign-version-mismatch');
    }
    let translated = 0;
    for (const field of TEXT_FIELDS) {
      if (typeof entry.texts?.[field] === 'string') {
        scenario[field] = entry.texts[field].replace(/\r?\n/g, '\r\n');
        translated++;
      }
    }
    return translated;
  }));
  return counts.reduce((total, count) => total + count, 0);
}
