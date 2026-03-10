import { prisma } from "./prisma";

/**
 * Get page section content from DB, falling back to hardcoded defaults.
 */
export async function getPageContent<T>(
  pageSlug: string,
  sectionId: string,
  defaults: T
): Promise<T> {
  try {
    const record = await prisma.pageContent.findUnique({
      where: { pageSlug_sectionId: { pageSlug, sectionId } },
    });
    if (record) {
      return { ...defaults, ...JSON.parse(record.content) } as T;
    }
  } catch {
    // DB not ready or error — use defaults
  }
  return defaults;
}

/**
 * Save page section content to DB.
 */
export async function savePageContent(
  pageSlug: string,
  sectionId: string,
  content: Record<string, unknown>
) {
  return prisma.pageContent.upsert({
    where: { pageSlug_sectionId: { pageSlug, sectionId } },
    update: { content: JSON.stringify(content) },
    create: { pageSlug, sectionId, content: JSON.stringify(content) },
  });
}
