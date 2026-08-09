const ROLE_PRIORITY = {
  foundation: 10,
  concept: 20,
  derivation: 30,
  example: 40,
  problem_solving: 50,
  jee_main: 60,
  jee_advanced: 70,
  pyq: 80,
  revision: 90,
  one_shot: 100,
  short: 200,
};

export function getRolePriority(role) {
  return ROLE_PRIORITY[role] ?? 150;
}

export function calculateSequence(videos) {
  return [...videos]
    .sort((a, b) => {
      // Shorts go after normal study material
      if (a.is_short !== b.is_short) {
        return a.is_short ? 1 : -1;
      }

      // First organize by educational purpose
      const roleA = getRolePriority(a.study_role);
      const roleB = getRolePriority(b.study_role);

      if (roleA !== roleB) {
        return roleA - roleB;
      }

      // Within the same role, prefer the AI sequence hint
      const hintA = Number(a.ai_classification?.sequence_hint ?? 999);
      const hintB = Number(b.ai_classification?.sequence_hint ?? 999);

      if (hintA !== hintB) {
        return hintA - hintB;
      }

      // Finally, older videos first
      return (
        new Date(a.published_at || 0) -
        new Date(b.published_at || 0)
      );
    })
    .map((video, index) => ({
      id: video.id,
      sequence_order: index + 1,
    }));
}