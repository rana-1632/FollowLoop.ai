import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AiService } from './ai.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('AiService', () => {
  let service: AiService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'openai.apiKey') return 'mock-openai-key';
      return null;
    }),
  };

  const mockPrismaService = {
    contact: {
      findFirst: jest.fn(),
    },
    followUpTask: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parseInteraction', () => {
    it('should parse unstructured text and return structured interaction response', async () => {
      const result = await service.parseInteraction({
        text: 'I emailed HR about an internship on August 8',
        referenceDate: '2026-08-12',
      });

      expect(result).toBeDefined();
      expect(result.contactName).toBeDefined();
      expect(result.channel).toBeDefined();
      expect(result.contextSummary).toBeDefined();
      expect(result.suggestedDate).toBeDefined();
      expect(result.initialDraft).toBeDefined();
      expect(result.initialDraft.subject).toBeDefined();
      expect(result.initialDraft.body).toBeDefined();
    });
  });

  describe('generateFollowUpSequence', () => {
    it('should generate 2-step follow-up sequence variations for a silent lead', async () => {
      const result = await service.generateFollowUpSequence('mock-user-id', {
        previousMessage: 'Sent software engineer application last week',
        ignoredDays: 5,
        tone: 'Professional & persistent',
      });

      expect(result).toBeDefined();
      expect(result.sequence1).toBeDefined();
      expect(result.sequence1.step).toBe(1);
      expect(result.sequence1.subject).toBeDefined();
      expect(result.sequence1.body).toBeDefined();

      expect(result.sequence2).toBeDefined();
      expect(result.sequence2.step).toBe(2);
      expect(result.sequence2.subject).toBeDefined();
      expect(result.sequence2.body).toBeDefined();
    });
  });
});
