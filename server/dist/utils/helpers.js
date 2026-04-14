// utils/helpers.ts
export function generateUniqueSelector(el) {
    if (el.id)
        return `#${el.id}`;
    if (el.getAttribute('name'))
        return `${el.tagName.toLowerCase()}[name="${el.getAttribute('name')}"]`;
    // Fallback to a simple path-based selector if no ID or Name
    let selector = el.tagName.toLowerCase();
    const parent = el.parentElement;
    if (parent) {
        const siblings = Array.from(parent.children).filter(s => s.tagName === el.tagName);
        if (siblings.length > 1) {
            const index = siblings.indexOf(el) + 1;
            selector += `:nth-of-type(${index})`;
        }
    }
    return selector;
}
export function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}
//# sourceMappingURL=helpers.js.map