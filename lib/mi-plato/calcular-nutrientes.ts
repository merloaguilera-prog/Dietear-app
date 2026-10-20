/**
 * Motor nutricional independiente de la interfaz.
 * Las cifras por 100 g deben proceder de una base nutricional contrastada
 * (p. ej. BEDCA) y especificar si corresponden al alimento crudo o cocinado.
 */
export type Nutrientes100g = {
  kcal: number;
  proteinas: number;
  hidratos: number;
  grasas: number;
};
export type AlimentoConfirmado = {
  nombre: string;
  gramos: number;
  referencia: string;
  nutrientes100g: Nutrientes100g;
};
export type Totales = Nutrientes100g;

const CAMPOS: (keyof Nutrientes100g)[] = ["kcal", "proteinas", "hidratos", "grasas"];

export function calcularNutrientes(alimentos: AlimentoConfirmado[]): Totales {
  if (!Array.isArray(alimentos) || alimentos.length === 0) {
    throw new Error("No hay alimentos confirmados");
  }
  const total: Totales = { kcal: 0, proteinas: 0, hidratos: 0, grasas: 0 };
  for (const alimento of alimentos) {
    if (!alimento.nombre.trim() || !alimento.referencia.trim() ||
        !Number.isFinite(alimento.gramos) || alimento.gramos <= 0 || alimento.gramos > 5000) {
      throw new Error("Alimento, referencia o cantidad inválidos");
    }
    for (const campo of CAMPOS) {
      const valor = alimento.nutrientes100g[campo];
      if (!Number.isFinite(valor) || valor < 0) {
        throw new Error("Valores nutricionales inválidos");
      }
      total[campo] += (valor * alimento.gramos) / 100;
    }
  }
  return {
    kcal: Math.round(total.kcal),
    proteinas: Math.round(total.proteinas * 10) / 10,
    hidratos: Math.round(total.hidratos * 10) / 10,
    grasas: Math.round(total.grasas * 10) / 10
  };
}
