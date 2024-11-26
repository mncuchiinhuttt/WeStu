export function replacePlaceholders(text: string, variables: { [key: string]: string }): string {
  return text.replace(/{(\w+)}/g, (_, key) => variables[key] || `{${key}}`);
}