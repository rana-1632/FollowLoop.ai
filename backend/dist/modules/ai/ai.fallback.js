"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiFallbackService = void 0;
class AiFallbackService {
    static fallbackParseInteraction(text, referenceDate) {
        const lower = text.toLowerCase();
        let channel = 'EMAIL';
        if (lower.includes('linkedin'))
            channel = 'LINKEDIN';
        else if (lower.includes('whatsapp') || lower.includes('chat') || lower.includes('message'))
            channel = 'WHATSAPP';
        let email = null;
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
        if (emailMatch) {
            email = emailMatch[0];
        }
        let company = null;
        if (email && email.includes('@')) {
            const domainParts = email.split('@')[1].split('.');
            if (domainParts[0] && !['gmail', 'yahoo', 'outlook', 'hotmail', 'icloud', 'example', 'followloop'].includes(domainParts[0].toLowerCase())) {
                company = domainParts[0].charAt(0).toUpperCase() + domainParts[0].slice(1);
            }
        }
        if (!company) {
            const companyMatch = text.match(/(?:at|with|for)\s+([A-Z][A-Za-z0-9]+(?:\s+[A-Z][A-Za-z0-9]+)*)/);
            if (companyMatch && companyMatch[1]) {
                const candidate = companyMatch[1].trim();
                const ignoreCompanies = ['HR', 'LinkedIn', 'WhatsApp', 'Email', 'Friday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday', 'November'];
                if (!ignoreCompanies.includes(candidate)) {
                    company = candidate;
                }
            }
        }
        let contactName = null;
        const verbMatch = text.match(/(?:met with|spoke with|spoke to|called|emailed|contacted|meeting with|discussion with|note from|message from|talked to|attn:?|attention:?)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (verbMatch && verbMatch[1]) {
            let rawName = verbMatch[1].trim();
            rawName = rawName.replace(/\s+(?:regarding|about|for|at|with|the|on|to)$/i, '').trim();
            const excludedWords = [
                'HR',
                'LinkedIn',
                'WhatsApp',
                'Email',
                'Friday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Saturday',
                'Sunday',
                'November',
                'December',
                'January',
                'February',
                'March',
            ];
            if (!excludedWords.includes(rawName)) {
                contactName = rawName;
            }
        }
        if (!contactName && email && email.includes('@')) {
            const username = email.split('@')[0];
            const parts = username.split(/[._-]/).filter(Boolean);
            if (parts.length > 0) {
                contactName = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
            }
        }
        if (!contactName) {
            contactName = company ? `${company} Lead` : 'Prospect';
        }
        if (!email) {
            email = null;
        }
        const suggestedDate = this.calculateDefaultFollowUpDate(referenceDate, 4);
        let subject = `Following up on our recent conversation`;
        let body = `Hi ${contactName},\n\nIt was great connecting with you recently.\n\nI am writing to follow up on our previous discussion and see if you have any questions. Let me know when you have 10 minutes available for a brief check-in.\n\nBest regards,`;
        if (lower.includes('wedding') || lower.includes('hall') || lower.includes('catering') || lower.includes('walkthrough')) {
            subject = `${company || 'Venue'} Booking Quotation & Walkthrough`;
            body = `Hi ${contactName},\n\nThank you for meeting with us regarding your booking at ${company || 'our venue'}. I have logged all your key requirements, including guest seating, catering options, and setup preferences.\n\nI am currently preparing the formal quotation for you and look forward to our upcoming venue walkthrough. Please let me know if any other details come up in the meantime.\n\nBest regards,`;
        }
        else if (lower.includes('pricing') || lower.includes('quote') || lower.includes('budget') || lower.includes('proposal')) {
            subject = `Follow-up regarding pricing proposal for ${company || 'your team'}`;
            body = `Hi ${contactName},\n\nFollowing up on our discussion regarding pricing and custom options for ${company || 'your team'}.\n\nI've prepared the details as requested and would love to walk you through the options. Let me know when you're available for a quick chat.\n\nBest regards,`;
        }
        const sequence1 = {
            step: 1,
            name: 'Gentle Check-in',
            recommendedDelayDays: 3,
            subject: `Re: ${subject}`,
            body: `Hi ${contactName},\n\nI wanted to gently bump this to the top of your inbox. Did you get a chance to review my previous message regarding ${company || 'our discussion'}?\n\nBest regards,`,
        };
        const sequence2 = {
            step: 2,
            name: 'Value-Add & Walkthrough Confirmation',
            recommendedDelayDays: 4,
            subject: `Re: Next steps for ${company || 'your event'}`,
            body: `Hi ${contactName},\n\nI know schedule bandwidth can be tight. I wanted to confirm if you'd still like to proceed with the walkthrough next week.\n\nIf you have 5 minutes available, let me know. Otherwise, I'll pause outreach for now.\n\nBest regards,`,
        };
        return {
            contactName,
            company,
            email,
            channel,
            contextSummary: text,
            suggestedDate,
            initialDraft: {
                subject,
                body,
            },
            sequence1,
            sequence2,
            isFallback: true,
            model: 'fallback-template',
            generationEngine: 'FALLBACK_RULE_ENGINE',
        };
    }
    static fallbackSequenceVariations(contactName, company) {
        return {
            sequence1: {
                step: 1,
                name: 'Gentle Check-in',
                recommendedDelayDays: 3,
                subject: `Re: Quick check-in regarding our recent discussion`,
                body: `Hi ${contactName},\n\nI wanted to gently bump this to the top of your inbox. Did you get a chance to review my previous message regarding ${company}?\n\nBest regards,`,
            },
            sequence2: {
                step: 2,
                name: 'Value-Add & Soft Break-Up',
                recommendedDelayDays: 7,
                subject: `Re: Next steps & resource for ${company}`,
                body: `Hi ${contactName},\n\nI know schedule bandwidth can be tight. I wanted to share one final thought regarding how we can support ${company}.\n\nIf you have 5 minutes next week, let me know. Otherwise, I'll pause outreach for now.\n\nBest regards,`,
            },
            model: 'fallback-template',
            isFallback: true,
            generationEngine: 'FALLBACK_RULE_ENGINE',
        };
    }
    static generateFallbackDraft(recipientName, company, purpose, contactId) {
        return {
            subject: `Quick check-in regarding ${purpose || 'our previous conversation'}`,
            body: `Hi ${recipientName},\n\nI hope you're having a great week.\n\nI wanted to briefly follow up regarding ${purpose || 'potential collaboration'} with ${company}.\n\nDo you have 10 minutes available later this week for a quick check-in?\n\nBest regards,`,
            model: 'fallback-template',
            contactId,
            isFallback: true,
            generationEngine: 'FALLBACK_RULE_ENGINE',
        };
    }
    static fallbackPostReplySequence(replyText, contactName = 'Prospect') {
        return {
            sentiment: 'Positive Interest / Confirmation',
            suggestedNextStep: 'Schedule Walkthrough & Confirm Booking Terms',
            sequence1: {
                step: 1,
                name: 'Immediate Reply & Next Steps Confirmation',
                recommendedDelayDays: 1,
                subject: `Re: Thank you for confirming — Next steps`,
                body: `Hi ${contactName},\n\nThank you for getting back to us! We're thrilled to move forward.\n\nI've noted your confirmation regarding the booking. Let me know what time works best for you tomorrow or next Tuesday for the walkthrough.\n\nBest regards,`,
            },
            sequence2: {
                step: 2,
                name: 'Walkthrough Pre-Check & Calendar Invite',
                recommendedDelayDays: 3,
                subject: `Re: Walkthrough Schedule & Details`,
                body: `Hi ${contactName},\n\nJust checking in to confirm our scheduled walkthrough. Please let me know if you need to adjust the timing.\n\nLooking forward to meeting with you!\n\nBest regards,`,
            },
            isFallback: true,
            model: 'fallback-template',
            generationEngine: 'FALLBACK_RULE_ENGINE',
        };
    }
    static calculateDefaultFollowUpDate(baseDateStr, addDays) {
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
}
exports.AiFallbackService = AiFallbackService;
//# sourceMappingURL=ai.fallback.js.map