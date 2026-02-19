import { z } from 'zod';
import { insertCharacterSchema, characters } from './schema';

export const api = {
  // We aren't strictly using these for a backend-heavy app, 
  // but defining them helps structure the potential future backend 
  // and satisfies the architecture requirements.
  characters: {
    list: {
      method: 'GET' as const,
      path: '/api/characters' as const,
      responses: {
        200: z.array(z.custom<typeof characters.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/characters' as const,
      input: insertCharacterSchema,
      responses: {
        201: z.custom<typeof characters.$inferSelect>(),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/characters/:id' as const,
      input: insertCharacterSchema.partial(),
      responses: {
        200: z.custom<typeof characters.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/characters/:id' as const,
      responses: {
        204: z.void(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
