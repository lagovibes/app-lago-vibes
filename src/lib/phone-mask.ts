/**
 * Aplica máscara de telefone no formato (XX) XXXXX-XXXX
 * @param value - Valor do input
 * @returns Valor formatado
 */
export function applyPhoneMask(value: string): string {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // Aplica a máscara conforme o tamanho
  if (numbers.length <= 2) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
  }
  
  // Limita a 11 dígitos
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
}

/**
 * Remove a máscara do telefone, deixando apenas números
 * @param value - Valor formatado
 * @returns Apenas números
 */
export function removePhoneMask(value: string): string {
  return value.replace(/\D/g, '');
}
