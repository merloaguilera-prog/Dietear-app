"use client";

import { useState } from "react";
import CorregirAlimentos, { type AlimentoEditable } from "./CorregirAlimentos";
import BuscadorNutricional from "./BuscadorNutricional";

/**
 * Bridge between AI recognition corrections and USDA nutritional selection.
 * Does not enable the API or persist data: the server remains feature-flagged.
 */
export default function FlujoCorreccionNutricional({ detectados }: { detectados: AlimentoEditable[] }) {
  const [confirmados, setConfirmados] = useState<{ nombre: string; gramos: number }[] | null>(null);
  return <div>
    {confirmados === null ? (
      <CorregirAlimentos alimentos={detectados} onConfirmar={alimentos => setConfirmados(alimentos)} />
    ) : (
      <>
        <button type="button" onClick={() => setConfirmados(null)}>← Volver a corregir alimentos</button>
        <BuscadorNutricional key={JSON.stringify(confirmados)} iniciales={confirmados} />
      </>
    )}
  </div>;
}
