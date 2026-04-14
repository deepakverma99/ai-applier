// services/ai/resumeParser.ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { openai } from '../../config/openai.js';
import type { MasterProfile } from '../../types/index.js';

async function parseResume(fileBuffer: Buffer): Promise<MasterProfile> {
  // Step 1: Extract raw text from PDF
  // @ts-ignore - pdf-parse types are tricky
  const pdfData = await pdfParse(fileBuffer);
  const rawText = pdfData.text;

  // Step 2: Send to GPT-4o with structured output prompt
  const completion = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b:free",
    messages: [
      {
        role: "system",
        content: `You are a resume parser. Extract all information from the 
        resume text and return it as structured JSON matching this exact schema:
        {
          "personal": { "full_name", "email", "phone", "location", "linkedin", "portfolio" },
          "summary": "string",
          "experience": [{ "title", "company", "location", "start_date", "end_date", "description", "technologies" }],
          "education": [{ "degree", "institution", "graduation_year", "gpa" }],
          "skills": { "languages", "frameworks", "tools", "databases" },
          "certifications": [],
          "work_authorization": "",
          "willing_to_relocate": null,
          "expected_salary": { "min", "max", "currency" }
        }
        Fill in what you can find. Use null for missing fields.`
      },
      {
        role: "user",
        content: rawText
      }
    ],
    temperature: 0.1
  });

  let content = completion.choices[0]?.message.content;
  if (!content) throw new Error('Failed to parse resume: Empty response from AI');

  // Defensive parsing for models that might return markdown blocks
  const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) || content.match(/```\n?([\s\S]*?)\n?```/);
  if (jsonMatch?.[1]) {
    content = jsonMatch[1].trim();
  }

  try {
    return JSON.parse(content) as MasterProfile;
  } catch (err) {
    console.error('Failed to parse AI response as JSON:', content);
    throw new Error('AI returned invalid JSON format');
  }
}

export const resumeParser = {
  parse: parseResume,
  parseResume
};