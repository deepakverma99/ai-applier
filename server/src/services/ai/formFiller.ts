import type { MasterProfile, FieldMapping } from '../../types/index.js';
import { openai } from '../../config/openai.js';

export const formFiller = {
  async mapFieldsToProfile(fields: any[], profile: MasterProfile): Promise<FieldMapping[]> {
    const prompt = `
      As an expert career automation agent, map the following job application form fields to the user's master profile.
      
      Fields: ${JSON.stringify(fields)}
      Profile: ${JSON.stringify(profile)}
      
      Return a JSON array of mappings: { fieldId: string, value: string, reason: string }.
      If no match is found, leave the value empty.
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'system', content: 'You are a precise data mapper.' }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0]?.message.content || '{}');
    return result.mappings || [];
  }
};
