"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = require("openai");
const Sentry = require("@sentry/nestjs");
const prisma_service_1 = require("../../common/prisma/prisma.service");
const ai_fallback_1 = require("./ai.fallback");
let AiService = AiService_1 = class AiService {
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
        this.logger = new common_1.Logger(AiService_1.name);
        this.openai = null;
        this.defaultModel =
            this.configService.get('ai.model') ||
                process.env.AI_MODEL ||
                process.env.GROQ_MODEL ||
                'llama-3.3-70b-versatile';
        const apiKey = this.configService.get('ai.apiKey') ||
            this.configService.get('groq.apiKey') ||
            process.env.AI_API_KEY ||
            process.env.GROQ_API_KEY ||
            process.env.OPENAI_API_KEY;
        const baseURL = this.configService.get('ai.baseUrl') ||
            process.env.AI_BASE_URL ||
            process.env.GROQ_BASE_URL ||
            'https://api.groq.com/openai/v1';
        if (apiKey && !apiKey.includes('placeholder') && apiKey.trim() !== '') {
            this.openai = new openai_1.default({
                apiKey,
                baseURL,
            });
            this.logger.log(`AI Engine initialized successfully [Model: ${this.defaultModel}]`);
        }
        else {
            this.logger.warn('AI API Key is unconfigured or contains placeholder. Standard template engine active.');
        }
    }
    async parseInteraction(dto) {
        const referenceDate = dto.referenceDate || new Date().toISOString().split('T')[0];
        const systemPrompt = `You are FollowLoop.ai's High-Precision NLP Parser & CRM Entity Extraction Specialist.
Given unstructured text describing a user's business interaction (email, phone call, meeting, transcript, note), analyze and extract key entity details accurately.
Today's reference date is: ${referenceDate}.

CRITICAL RULES FOR ENTITY EXTRACTION:
1. contactName: Extract the exact person's first or full name mentioned (e.g. "Ahmed", "Sarah", "Sarah Connor", "Diego Fuentes", "Alex"). NEVER include prepositions like "regarding" or "about". NEVER default to "HR Department" unless text mentions "HR".
2. company: Extract the exact organization, venue, or business name mentioned (e.g. "Grand Luxe Wedding Hall", "Cyberdyne Systems", "Acme Inc"), otherwise return null.
3. email: Extract any email address explicitly mentioned in the text (e.g. "ahmed@grandluxe.com", "sarah@acme.org"), otherwise return null.
4. channel: Identify whether this interaction occurred over "EMAIL", "LINKEDIN", or "WHATSAPP". Default to "EMAIL" if unspecified.
5. contextSummary: A concise 1-2 sentence summary highlighting key specifics mentioned (e.g. dates, guest estimates, requested quotes, pricing).
6. suggestedDate: Calculated recommended follow-up date in YYYY-MM-DD format (typically 3 to 5 days after the reference date).
7. Multi-Step Follow-Up Sequence:
   - initialDraft (Step 1 - Day 0): Subject & body referencing specific details from the interaction note.
   - sequence1 (Step 2 - Day 3): Gentle check-in / bump message (recommendedDelayDays: 3).
   - sequence2 (Step 3 - Day 7): Value-add / walkthrough confirmation / soft break-up message (recommendedDelayDays: 4).

Respond strictly in valid JSON format matching this exact schema:
{
  "contactName": string,
  "company": string | null,
  "email": string | null,
  "channel": "EMAIL" | "LINKEDIN" | "WHATSAPP",
  "contextSummary": string,
  "suggestedDate": string,
  "initialDraft": { "subject": string, "body": string },
  "sequence1": { "step": 1, "name": "Gentle Check-in", "recommendedDelayDays": 3, "subject": string, "body": string },
  "sequence2": { "step": 2, "name": "Value-Add & Next Steps", "recommendedDelayDays": 4, "subject": string, "body": string }
}`;
        const userPrompt = `Raw Interaction Text:\n"${dto.text}"`;
        if (!this.openai) {
            this.logger.warn('AI SDK uninitialized. Serving deterministic template engine response for parseInteraction.');
            return ai_fallback_1.AiFallbackService.fallbackParseInteraction(dto.text, referenceDate);
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.3,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('AI Provider returned an empty content payload during text parsing.');
            }
            const parsed = JSON.parse(content);
            const validChannels = ['EMAIL', 'LINKEDIN', 'WHATSAPP'];
            const channel = validChannels.includes(parsed.channel) ? parsed.channel : 'EMAIL';
            let email = parsed.email || null;
            const emailMatch = dto.text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
            if (emailMatch) {
                email = emailMatch[0];
            }
            let company = parsed.company || null;
            if (!company && email && email.includes('@')) {
                const domainParts = email.split('@')[1].split('.');
                if (domainParts[0] && !['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'example', 'followloop'].includes(domainParts[0].toLowerCase())) {
                    company = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
                }
            }
            if (!company) {
                const companyMatch = dto.text.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*)/);
                if (companyMatch && companyMatch[1]) {
                    const candidate = companyMatch[1].trim();
                    const ignoreList = ['HR', 'LinkedIn', 'WhatsApp', 'Email', 'Friday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'];
                    if (!ignoreList.includes(candidate)) {
                        company = candidate;
                    }
                }
            }
            let contactName = parsed.contactName;
            if (!contactName || contactName === 'Lead Contact' || contactName === 'HR Department' || contactName === 'Prospect') {
                const nameMatch = dto.text.match(/(?:met with|spoke with|spoke to|called|emailed|contacted|meeting with|discussion with|note from|message from|talked to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
                if (nameMatch && nameMatch[1]) {
                    contactName = nameMatch[1].trim();
                }
                else if (email && email.includes('@')) {
                    const username = email.split('@')[0];
                    const parts = username.split(/[._-]/).filter(Boolean);
                    if (parts.length > 0) {
                        contactName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
                    }
                }
            }
            if (!contactName) {
                contactName = company ? `${company} Lead` : 'Prospect';
            }
            if (!email) {
                email = null;
            }
            return {
                contactName,
                company: company || null,
                email,
                contact: {
                    name: contactName,
                    company: company || null,
                    email,
                },
                channel,
                contextSummary: parsed.contextSummary || dto.text,
                suggestedDate: parsed.suggestedDate || this.calculateDefaultFollowUpDate(referenceDate, 4),
                initialDraft: {
                    subject: parsed.initialDraft?.subject || `Following up on our recent interaction`,
                    body: parsed.initialDraft?.body ||
                        `Hi ${contactName},\n\nI am following up regarding our recent interaction. Let me know when you have time for a quick chat.\n\nBest regards,`,
                },
                sequence1: parsed.sequence1,
                sequence2: parsed.sequence2,
                isFallback: false,
                model: this.defaultModel,
                generationEngine: 'LLM_AI',
            };
        }
        catch (error) {
            this.logger.error('Failed to parse interaction with OpenAI API:', error.stack || error.message);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(error);
            }
            return ai_fallback_1.AiFallbackService.fallbackParseInteraction(dto.text, referenceDate);
        }
    }
    async generateFollowUpSequence(userId, dto) {
        let contactInfo = {
            name: 'Prospect',
            company: 'their organization',
            channel: dto.channel || 'EMAIL',
            notes: null,
            email: null,
        };
        if (dto.contactId) {
            const contact = await this.prisma.contact.findFirst({
                where: { id: dto.contactId, userId },
            });
            if (contact) {
                contactInfo = {
                    name: contact.name,
                    company: contact.company || 'their company',
                    channel: dto.channel || contact.channel || 'EMAIL',
                    notes: contact.notes,
                    email: contact.email,
                };
            }
        }
        const ignoredDays = dto.ignoredDays || 5;
        const tone = dto.tone || 'Professional, warm, and concise';
        const previousMessageContext = dto.previousMessage || dto.contactId ? `Previous outreach sent ${ignoredDays} days ago with no response.` : 'Initial follow-up went unanswered.';
        const systemPrompt = `You are FollowLoop.ai's Lead Re-Engagement Specialist.
Your objective is to craft a 2-step automated follow-up sequence for a prospect who has ignored a previous message.

WRITING GUIDELINES:
- Avoid generic corporate templates or unnatural robotic copy.
- Directly reference specific context from notes, pricing proposals, venue bookings, or meeting summaries.
- Keep emails clear, natural, and human.

Channel: ${contactInfo.channel}
Tone: ${tone}

Respond strictly in valid JSON format matching this exact schema:
{
  "sequence1": {
    "step": 1,
    "name": "Gentle Check-in / Polite Bump",
    "recommendedDelayDays": 3,
    "subject": "Re: [Context-specific subject line]",
    "body": "A short, polite 50-90 word message bumping the previous message, referencing specific details from notes."
  },
  "sequence2": {
    "step": 2,
    "name": "Value-Add & Soft Break-up",
    "recommendedDelayDays": 7,
    "subject": "Re: Resource & Next steps for [Company]",
    "body": "A compelling 75-120 word message offering a quick insight or final check-in."
  }
}`;
        const userPrompt = `
Prospect Details:
- Name: ${contactInfo.name}
- Company: ${contactInfo.company || 'N/A'}
- Background Notes: ${contactInfo.notes || 'N/A'}

Ignored Outreach Context:
- Days Silent: ${ignoredDays}
- Original Message Summary: ${previousMessageContext}
`;
        if (!this.openai) {
            this.logger.warn('AI Engine uninitialized. Serving fallback sequence variations.');
            return ai_fallback_1.AiFallbackService.fallbackSequenceVariations(contactInfo.name, contactInfo.company || 'your team');
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('AI Provider returned an empty payload during sequence generation.');
            }
            const parsed = JSON.parse(content);
            return {
                sequence1: {
                    step: 1,
                    name: parsed.sequence1?.name || 'Gentle Check-in',
                    recommendedDelayDays: parsed.sequence1?.recommendedDelayDays || 3,
                    subject: parsed.sequence1?.subject || `Re: Following up with ${contactInfo.name}`,
                    body: parsed.sequence1?.body ||
                        `Hi ${contactInfo.name},\n\nJust bumping this to the top of your inbox. Did you get a chance to review my previous message?\n\nBest regards,`,
                },
                sequence2: {
                    step: 2,
                    name: parsed.sequence2?.name || 'Value-Add & Soft Break-Up',
                    recommendedDelayDays: parsed.sequence2?.recommendedDelayDays || 7,
                    subject: parsed.sequence2?.subject || `Re: Quick thought for ${contactInfo.company}`,
                    body: parsed.sequence2?.body ||
                        `Hi ${contactInfo.name},\n\nI know you're busy. I wanted to check one last time if this is currently a priority for ${contactInfo.company}.\n\nIf not, no worries at all—feel free to reach out whenever the timing is right.\n\nBest regards,`,
                },
                model: this.defaultModel,
                isFallback: false,
                generationEngine: 'LLM_AI',
            };
        }
        catch (error) {
            this.logger.error('Failed to generate follow-up sequence with AI model:', error.stack || error.message);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(error);
            }
            return ai_fallback_1.AiFallbackService.fallbackSequenceVariations(contactInfo.name, contactInfo.company || 'your team');
        }
    }
    async generateEmailDraft(userId, dto) {
        const contact = await this.prisma.contact.findFirst({
            where: { id: dto.contactId, userId },
            include: { user: true },
        });
        if (!contact) {
            throw new common_1.NotFoundException(`Contact with ID "${dto.contactId}" not found`);
        }
        const senderName = contact.user?.fullName || 'Sales Representative';
        const senderCompany = contact.user?.companyName || 'Our Team';
        const recipientName = contact.name;
        const recipientCompany = contact.company || 'your organization';
        const channel = contact.channel;
        const position = contact.position || 'Partner';
        const existingNotes = contact.notes || 'No prior background notes recorded.';
        const systemPrompt = `You are an expert AI copywriter at FollowLoop.ai specialized in hyper-personalized outreach and follow-ups.
Preferred Channel: ${channel}.

STRICT RULES:
- Write naturally like a thoughtful professional speaking 1-on-1 to a human client or prospect.
- Seamlessly weave in specific details (e.g. venue bookings, pricing, dates, guest estimates, walkthroughs).
- Avoid robotic corporate templates.

Respond strictly in JSON format with exactly two keys:
{
  "subject": "The generated context-aware email subject line",
  "body": "The generated natural email or message body text (100-180 words)"
}`;
        const userPrompt = `
Sender Info:
- Name: ${senderName}
- Company: ${senderCompany}

Recipient Info:
- Name: ${recipientName}
- Company: ${recipientCompany}
- Position: ${position}
- Stage: ${contact.currentStage}
- Notes: ${existingNotes}

Follow-up Goals:
- Purpose: ${dto.purpose || 'Follow up regarding our previous interaction and discuss next steps'}
- Desired Tone: ${dto.tone || 'Professional, warm, and concise'}
- Additional Context: ${dto.customContext || 'N/A'}

Generate a short (100-180 words), high-converting follow-up draft.
`;
        if (!this.openai) {
            this.logger.warn('AI API key not configured. Returning smart fallback draft.');
            return ai_fallback_1.AiFallbackService.generateFallbackDraft(recipientName, recipientCompany, dto.purpose, contact.id);
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('Empty response payload returned by AI Model');
            }
            const parsed = JSON.parse(content);
            return {
                subject: parsed.subject || `Following up with ${contact.name}`,
                body: parsed.body || `Hi ${contact.name},\n\nHope you're having a great week...`,
                model: this.defaultModel,
                contactId: contact.id,
                isFallback: false,
                generationEngine: 'LLM_AI',
            };
        }
        catch (error) {
            this.logger.error('Failed to generate email draft using AI model', error.stack || error.message);
            if (process.env.SENTRY_DSN) {
                Sentry.captureException(error);
            }
            return ai_fallback_1.AiFallbackService.generateFallbackDraft(recipientName, recipientCompany, dto.purpose, contact.id);
        }
    }
    async generatePostReplySequence(userId, dto) {
        let contactName = 'Prospect';
        let company = 'their company';
        if (dto.contactId) {
            const contact = await this.prisma.contact.findFirst({
                where: { id: dto.contactId, userId },
            });
            if (contact) {
                contactName = contact.name;
                company = contact.company || 'their company';
            }
        }
        const tone = dto.tone || 'Consultative, warm, and clear';
        const systemPrompt = `You are FollowLoop.ai's Conversation Continuator & Deal Closer AI.
A prospect has just sent an email reply: "${dto.replyText}".
Analyze customer sentiment (e.g. Interested, Booking Confirmation, Pricing Request, Question) and craft a 2-step post-reply nurture sequence.

Channel: EMAIL
Tone: ${tone}

Respond strictly in valid JSON format:
{
  "sentiment": string,
  "suggestedNextStep": string,
  "sequence1": {
    "step": 1,
    "name": "Immediate Response & Confirmation",
    "recommendedDelayDays": 1,
    "subject": string,
    "body": string
  },
  "sequence2": {
    "step": 2,
    "name": "Pre-meeting Check-in & Value Add",
    "recommendedDelayDays": 3,
    "subject": string,
    "body": string
  }
}`;
        const userPrompt = `Prospect: ${contactName} (${company})\nIncoming Reply:\n"${dto.replyText}"`;
        if (!this.openai) {
            this.logger.warn('Groq SDK uninitialized. Serving fallback post-reply sequence.');
            return ai_fallback_1.AiFallbackService.fallbackPostReplySequence(dto.replyText, contactName);
        }
        try {
            const response = await this.openai.chat.completions.create({
                model: this.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt },
                ],
                response_format: { type: 'json_object' },
                temperature: 0.5,
            });
            const content = response.choices[0]?.message?.content;
            if (!content) {
                throw new Error('OpenAI returned an empty payload during post-reply sequence generation.');
            }
            return JSON.parse(content);
        }
        catch (error) {
            this.logger.error('Failed to generate post-reply sequence:', error.stack || error.message);
            return ai_fallback_1.AiFallbackService.fallbackPostReplySequence(dto.replyText, contactName);
        }
    }
    async generateAndSaveForTask(userId, taskId) {
        const task = await this.prisma.followUpTask.findFirst({
            where: {
                id: taskId,
                OR: [{ userId }, { contact: { userId } }],
            },
            include: { contact: true },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID "${taskId}" not found`);
        }
        const draft = await this.generateEmailDraft(userId, {
            contactId: task.contactId,
            purpose: task.title || undefined,
        });
        const updatedTask = await this.prisma.followUpTask.update({
            where: { id: taskId },
            data: {
                subjectLine: draft.subject,
                aiGeneratedContent: draft.body,
            },
            include: { contact: true },
        });
        return {
            task: updatedTask,
            generatedDraft: draft,
        };
    }
    calculateDefaultFollowUpDate(baseDateStr, addDays) {
        try {
            const d = new Date(baseDateStr);
            if (isNaN(d.getTime())) {
                const today = new Date();
                today.setDate(today.getDate() + addDays);
                return today.toISOString().split('T')[0];
            }
            d.setDate(d.getDate() + addDays);
            return d.toISOString().split('T')[0];
        }
        catch {
            const today = new Date();
            today.setDate(today.getDate() + addDays);
            return today.toISOString().split('T')[0];
        }
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], AiService);
//# sourceMappingURL=ai.service.js.map