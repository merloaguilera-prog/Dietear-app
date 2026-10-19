export const metadata = {
  title: "Privacidad · DIETEAR",
  description: "Política de privacidad y tratamiento de datos de DIETEAR.",
};

const section = { marginTop: 28 };

export default function PrivacyPage() {
  return (
    <main style={{ maxWidth: 880, margin: "0 auto", padding: "32px 20px 64px", color: "#163d31", lineHeight: 1.65 }}>
      <a href="/" style={{ color: "#147a4f", fontWeight: 800 }}>← Volver a DIETEAR</a>
      <p style={{ marginTop: 30, color: "#477064", fontWeight: 800 }}>DIETEAR · TODO SUMA</p>
      <h1 style={{ fontSize: "clamp(32px,6vw,52px)", lineHeight: 1.05 }}>Política de privacidad</h1>
      <p><strong>Última actualización:</strong> 19 de octubre de 2026.</p>
      <p>Esta política explica de forma clara qué datos utiliza DIETEAR, para qué los utiliza y qué control conserva la persona usuaria.</p>

      <section style={section}>
        <h2>1. Qué es DIETEAR</h2>
        <p>DIETEAR es una herramienta de bienestar, alimentación, planificación y seguimiento personal. Su información es orientativa y no sustituye el diagnóstico, tratamiento ni seguimiento de profesionales sanitarios.</p>
      </section>

      <section style={section}>
        <h2>2. Datos que puedes introducir</h2>
        <p>De forma voluntaria puedes registrar datos de perfil, objetivos, alimentación, actividad, peso y medidas, hábitos, alergias, preferencias, medicación o información de salud. También puedes escribir consultas y usar la cámara para leer el código de barras de un producto.</p>
      </section>

      <section style={section}>
        <h2>3. Dónde se guardan</h2>
        <p>En la versión actual, los registros personales se guardan principalmente en el almacenamiento local del navegador o dispositivo. DIETEAR no afirma disponer todavía de sincronización automática entre dispositivos. Borrar los datos del navegador o desinstalar la aplicación puede eliminar esos registros.</p>
        <p>Los objetivos diarios y su historial se guardan en una clave local independiente; puedes borrarlos desde ese módulo. Los horarios y la percepción de descanso se guardan en tu historial personal y pueden eliminarse individualmente. Las fechas, cantidades y registros de aprovechamiento de alimentos también permanecen en este dispositivo. Estos módulos no transmiten por sí mismos dichos datos a servicios externos ni leen Health Connect.</p>
      </section>

      <section style={section}>
        <h2>4. Funciones que usan servicios externos</h2>
        <ul>
          <li><strong>DIETEAR IA:</strong> la consulta y el contexto que decidas incluir se envían al proveedor de inteligencia artificial configurado para generar la respuesta.</li>
          <li><strong>Análisis de alimentos:</strong> el texto que escribas y el contexto que autorices pueden enviarse al proveedor de IA para realizar el análisis solicitado.</li>
          <li><strong>Consulta de productos:</strong> un código de barras puede consultarse en servicios públicos de información alimentaria para localizar la ficha del producto.</li>
          <li><strong>Alojamiento:</strong> la aplicación se sirve mediante infraestructura web que puede tratar datos técnicos necesarios, como registros de seguridad, dirección IP aproximada y tipo de navegador.</li>
        </ul>
        <p>No utilizamos los datos de salud para personalizar publicidad ni declaramos vender datos personales.</p>
      </section>

      <section style={section}>
        <h2>5. Cámara y permisos</h2>
        <p>La cámara solo se solicita cuando activas el escáner de códigos. La lectura se realiza en el dispositivo y DIETEAR envía el código detectado, no la imagen de la cámara, al servicio de información alimentaria. Puedes denegar o retirar el permiso desde los ajustes del dispositivo o navegador y escribir el código manualmente.</p>
      </section>

      <section style={section}>
        <h2>6. Conservación y eliminación</h2>
        <p>Puedes eliminar registros desde los controles disponibles en la aplicación o borrar los datos locales del sitio desde el dispositivo. Las consultas procesadas por servicios externos pueden quedar sujetas a los periodos de seguridad y conservación de esos proveedores.</p>
      </section>

      <section style={section}>
        <h2>7. Menores</h2>
        <p>DIETEAR no está diseñada para que menores introduzcan por sí solos información médica sensible. Cuando se utilice para organizar la alimentación familiar, la persona adulta responsable debe revisar los datos y las recomendaciones. Las necesidades pediátricas deben confirmarse con profesionales sanitarios.</p>
      </section>

      <section style={section}>
        <h2>8. Seguridad y límites</h2>
        <p>Aplicamos medidas técnicas razonables y procuramos reducir los datos enviados, pero ningún sistema conectado puede garantizar un riesgo cero. Evita introducir identificadores oficiales, contraseñas, datos bancarios o información que no sea necesaria para la función solicitada.</p>
      </section>

      <section style={section}>
        <h2>9. Tus derechos y contacto</h2>
        <p>Puedes solicitar información, corrección o eliminación cuando exista tratamiento bajo nuestro control. El canal actualizado de soporte y privacidad se mostrará en la ficha oficial de DIETEAR en Google Play y en <a href="https://dietear.app">dietear.app</a>.</p>
      </section>

      <section style={section}>
        <h2>10. Cambios en esta política</h2>
        <p>Actualizaremos esta página cuando cambien las funciones, proveedores o formas de tratamiento. La fecha superior permitirá identificar la versión vigente.</p>
      </section>
    </main>
  );
}
