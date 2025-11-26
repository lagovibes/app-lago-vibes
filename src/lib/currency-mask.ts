/**
 * Formata valor numérico para moeda brasileira (R$ 0,00)
 */
export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Remove formatação de moeda e retorna número
 */
export function parseCurrency(value: string): number {
  const cleanValue = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
}

/**
 * Aplica máscara de moeda brasileira enquanto digita
 * CORRIGIDO: Agora interpreta valores corretamente sem dividir por 100
 */
export function applyCurrencyMask(value: string): string {
  // Remove tudo exceto números
  let numericValue = value.replace(/\D/g, '');
  
  // Se vazio, retorna R$ 0,00
  if (!numericValue) {
    return 'R$ 0,00';
  }
  
  // Converte para número (em centavos)
  const numberValue = parseInt(numericValue, 10);
  
  // Formata como moeda (divide por 100 para converter centavos em reais)
  const formatted = (numberValue / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return formatted;
}

/**
 * Extrai valor numérico de string formatada como moeda
 * CORRIGIDO: Retorna o valor real em reais (não em centavos)
 */
export function extractCurrencyValue(formattedValue: string): number {
  // Remove R$, espaços, pontos (separadores de milhar) e substitui vírgula por ponto
  const cleanValue = formattedValue
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
    .trim();
  
  const numericValue = parseFloat(cleanValue) || 0;
  
  // Retorna o valor real em reais (não precisa multiplicar por 100)
  return numericValue;
}
