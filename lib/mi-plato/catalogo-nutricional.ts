import { calcularNutrientes, type AlimentoConfirmado, type Nutrientes100g } from "./calcular-nutrientes";

/**
 * Adaptador independiente de proveedor. No contiene ni descarga datos BEDCA:
 * su reutilización comercial requiere autorización expresa.
 * Cada ficha debe incluir identificador de origen, estado crudo/cocinado y unidades.
 */
export type FichaNutricional = {
  id: string;
  nombre: string;
  estado: "crudo" | "cocinado" | "otro";
  fuente: string;
  por100g: Nutrientes100g;
};
export type CatalogoNutricional = {
  buscar(nombre: string): Promise<FichaNutricional[]>;
};
export function normalizarNombre(nombre: string): string {
  return nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("es");
}
export async function buscarFichas(catalogo: CatalogoNutricional, nombre: string): Promise<FichaNutricional[]> {
  if (!nombre.trim()) return [];
  const resultados = await catalogo.buscar(nombre.trim());
  return resultados.filter(f => Boolean(f.id && f.fuente && f.nombre) &&
    ["crudo", "cocinado", "otro"].includes(f.estado) &&
    Object.values(f.por100g).every(v => typeof v === "number" && Number.isFinite(v) && v >= 0));
}
export function calcularConFichas(
  seleccion: { ficha: FichaNutricional; gramos: number }[]
) {
  const confirmados: AlimentoConfirmado[] = seleccion.map(({ ficha, gramos }) => ({
    nombre: ficha.nombre,
    gramos,
    referencia: `${ficha.fuente}:${ficha.id}:${ficha.estado}`,
    nutrientes100g: ficha.por100g
  }));
  return calcularNutrientes(confirmados);
}
