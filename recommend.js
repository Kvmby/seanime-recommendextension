(async () => {
  const history = await SeAnime.history.get();

  if (!history || history.length === 0) {
    SeAnime.ui.notify("No watch history found.");
    return;
  }

  const watchedGenres = {};
  for (const item of history) {
    const genres = item.genres || [];
    for (const genre of genres) {
      watchedGenres[genre] = (watchedGenres[genre] || 0) + 1;
    }
  }

  const catalog = await SeAnime.catalog.get();

  const recommendations = catalog
    .filter(entry => {
      return !history.some(h => h.id === entry.id);
    })
    .map(entry => {
      const matchCount = (entry.genres || []).reduce(
        (count, genre) => count + (watchedGenres[genre] ? 1 : 0),
        0
      );
      return { entry, score: matchCount };
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  if (recommendations.length === 0) {
    SeAnime.ui.notify("No recommendations found.");
    return;
  }

  const html = recommendations
    .map(r => `<div>
      <strong>${r.entry.title}</strong><br>
      Genres: ${r.entry.genres.join(", ")}
    </div>`)
    .join("<hr>");

  SeAnime.ui.panel.show({
    title: "Recommended For You",
    content: html
  });
})();
