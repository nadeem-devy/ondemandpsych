import { prisma } from "./prisma";

export type ContentMap = Record<string, Record<string, string>>;

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
 * Get ALL sections for a page in one query.
 * Returns a map: { sectionId: { field: value } }
 */
export async function getAllPageContent(pageSlug: string): Promise<ContentMap> {
  try {
    const sections = await prisma.pageContent.findMany({
      where: { pageSlug },
    });
    const map: ContentMap = {};
    for (const s of sections) {
      map[s.sectionId] = JSON.parse(s.content);
    }
    return map;
  } catch {
    return {};
  }
}

/**
 * Get a site setting by key.
 */
export async function getSiteSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const record = await prisma.siteSettings.findUnique({ where: { key } });
    if (record) {
      return JSON.parse(record.value) as T;
    }
  } catch {
    // DB not ready or error
  }
  return defaultValue;
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
