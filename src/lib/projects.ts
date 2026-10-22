/** Returns the case-study projects, failing the build if any of them has no write-up. */
export function requireCaseStudyBodies<T extends { id: string; body?: string; data: { caseStudy: boolean } }>(
  projects: readonly T[],
): T[] {
  const caseStudies = projects.filter((project) => project.data.caseStudy);
  for (const project of caseStudies) {
    if (!project.body?.trim()) {
      throw new Error(`Case study '${project.id}' has an empty body`);
    }
  }
  return caseStudies;
}

/** Fails the build when showcase data is keyed by an id that matches no project file. */
export function assertKnownProjectIds(ids: readonly string[], known: readonly string[]): void {
  for (const id of ids) {
    if (!known.includes(id)) {
      throw new Error(`Unknown project id '${id}' in showcase data`);
    }
  }
}
