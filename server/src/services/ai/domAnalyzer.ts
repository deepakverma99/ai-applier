// services/ai/domAnalyzer.ts
import type { Page } from 'playwright';
import { openai } from '../../config/openai.js';
import type { FieldMapping } from '../../types/index.js';

export async function analyzeFormFields(page: Page): Promise<FieldMapping[]> {
  // Step 1: Extract all visible form elements from the page
  const formHTML = await page.evaluate(() => {
    function generateUniqueSelector(el: Element): string {
      if (el.id) return `#${el.id}`;
      if (el.getAttribute('name')) return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
      return el.tagName.toLowerCase();
    }

    const inputs = document.querySelectorAll(
      'input, textarea, select, [contenteditable="true"]'
    );
    
    return Array.from(inputs).map(el => {
      const inputEl = el as HTMLInputElement;
      return {
        tagName: el.tagName,
        type: el.getAttribute('type'),
        name: el.getAttribute('name'),
        id: el.id,
        placeholder: el.getAttribute('placeholder'),
        ariaLabel: el.getAttribute('aria-label'),
        label: el.closest('label')?.textContent?.trim() 
               || document.querySelector(`label[for="${el.id}"]`)?.textContent?.trim(),
        required: inputEl.required || el.hasAttribute('required'),
        selector: generateUniqueSelector(el),
        options: el.tagName === 'SELECT' 
          ? Array.from(el.querySelectorAll('option')).map(o => o.textContent)
          : null
      };
    });
  });

  // Step 2: Send extracted field info to GPT-4o for mapping
  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a form field analyzer. Given a list of form fields 
        from a job application, map each field to the corresponding key in a 
        master profile JSON. Return an array of mappings:
        {
          "mappings": [
            {
              "selector": "CSS selector",
              "action": "fill",
              "profileKey": "personal.full_name",
              "confidence": 0.95
            }
          ]
        }
        Common actions: fill, select, click, upload.
        Common keys: personal.full_name, personal.email, personal.phone, etc.`
      },
      {
        role: "user",
        content: JSON.stringify(formHTML)
      }
    ],
    response_format: { type: "json_object" },
    temperature: 0.1
  });

  const content = completion.choices[0]?.message.content;
  if (!content) return [];
  
  return JSON.parse(content).mappings;
}