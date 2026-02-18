// Mock Prisma Client for testing
export class PrismaClient {
  apiKey = {
    findUnique: jest.fn(),
    update: jest.fn(),
  };
}
