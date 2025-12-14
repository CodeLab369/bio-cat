/**
 * Formatea un número al formato de moneda boliviana (Bs.)
 * Separador de miles: punto (.)
 * Separador de decimales: coma (,)
 * Ejemplo: 1500.50 -> 1.500,50 Bs.
 */
export const formatBoliviano = (amount: number): string => {
  return `Bs. ${amount.toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Convierte un string en formato boliviano a número
 * Ejemplo: "1.500,50" -> 1500.50
 */
export const parseBoliviano = (value: string): number => {
  const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
};

/**
 * Formatea un input mientras el usuario escribe
 * Mantiene el formato boliviano en tiempo real
 */
export const formatInputBoliviano = (value: string): string => {
  // Remover todo excepto dígitos y coma
  let cleaned = value.replace(/[^\d,]/g, '');
  
  // Asegurar solo una coma
  const parts = cleaned.split(',');
  if (parts.length > 2) {
    cleaned = parts[0] + ',' + parts.slice(1).join('');
  }
  
  // Limitar decimales a 2
  if (parts[1] && parts[1].length > 2) {
    parts[1] = parts[1].substring(0, 2);
    cleaned = parts.join(',');
  }
  
  return cleaned;
};
