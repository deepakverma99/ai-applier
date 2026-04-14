// services/ai/resumeParser.ts
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { openai } from '../../config/openai.js';
export async function parseResume(fileBuffer) {
    // Step 1: Extract raw text from PDF
    // @ts-ignore - pdf-parse types are tricky
    const pdfData = await pdfParse(fileBuffer);
    const rawText = pdfData.text;
    // Step 2: Send to GPT-4o with structured output prompt
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
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
        response_format: { type: "json_object" },
        temperature: 0.1
    });
    const content = completion.choices[0]?.message.content;
    if (!content)
        throw new Error('Failed to parse resume: Empty response from AI');
    return JSON.parse(content);
}
//# sourceMappingURL=resumeParser.js.map