"use client";
export default function StorageNotice({status,onRetry}) {
  if (!status || status === "saved") return null;
  const messages = {
    recovered: "Hemos recuperado los datos que se podían leer y conservado una copia del contenido original en este dispositivo.",
    unavailable: "No se han podido guardar los últimos cambios. Mantén DIETEAR abierta y revisa el espacio o los permisos de almacenamiento del navegador.",
    protected: "Los datos guardados pertenecen a otra versión o han cambiado en otra pestaña. No se han sobrescrito. Vuelve a abrir DIETEAR para revisarlos.",
    "recovery-blocked": "Algunos datos guardados no se podían leer. La copia original se conserva: no se sobrescribirá hasta poder guardar una copia de seguridad. Mantén DIETEAR abierta y revisa el espacio de almacenamiento.",
  };
  return <div role={status === "recovered" ? "status" : "alert"} className="gentleResult" style={{margin:16}}>
    <span>{messages[status]}</span>
    {["unavailable","recovery-blocked"].includes(status) && <button type="button" onClick={onRetry}>Reintentar guardado</button>}
  </div>;
}
