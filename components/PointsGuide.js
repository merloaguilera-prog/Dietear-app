export default function PointsGuide({ daily, onConfigure }) {
  return <div className="pointsGuide">
    <div className="pointsSectionHead"><span className="pointsEyebrow">APRENDE ANTES DE CONTAR</span><h3>Una guía para hacerlo con sentido</h3><p>Los puntos ayudan a llevar un registro. La variedad, las cantidades y tus necesidades siguen siendo lo primero.</p></div>
    <div className="pointsGuideIntro"><div><span>01 / EL MÉTODO</span><h4>Un cálculo que puedes comprobar</h4><p>DIETEAR usa una referencia propia: <strong>1 punto = 50 kcal</strong>. Calcula la energía de la cantidad que vas a comer y divide entre 50. Se muestra un decimal.</p><p>La puntuación organiza la energía; por sí sola no mide la calidad nutricional. Cada programa por puntos tiene reglas diferentes.</p></div><div className="pointsFormula"><small>POR EJEMPLO</small><b>250 kcal ÷ 50</b><strong>5 puntos</strong><span>para esa cantidad de comida</span></div></div>
    <div className="pointsGuideSteps">{[
      ["1", "Define tu referencia", "Ajusta los puntos diarios de acuerdo con tu plan. No hay un máximo universal ni una tabla válida para todas las personas basada solo en el peso."],
      ["2", "Elige y mide la ración", "Busca el alimento y revisa los gramos y su preparación. 100 g de arroz seco y 100 g de arroz cocido tienen puntuaciones distintas."],
      ["3", "Cuenta el plato completo", "Incluye cada ingrediente, el aceite, las salsas, el pan y las bebidas que tomes. Suma su energía antes de redondear."],
      ["4", "Divide entre las raciones", "Si cocinas para cuatro y el total suma 24 puntos, cada ración igual aporta 6. Si comes una ración y media, registra 9."],
      ["5", "Registra y revisa", "Añade lo que realmente has comido al momento del día correspondiente. Revisa tu semana como información, sin castigarte por una comida."],
    ].map(([number, title, text]) => <article key={number}><span>{number}</span><div><h4>{title}</h4><p>{text}</p></div></article>)}</div>
    <div className="pointsWeekExplanation"><span>02 / EL DÍA Y LA SEMANA</span><h4>¿Cuántos puntos puedo utilizar?</h4><p>La referencia actual es <strong>{daily} puntos al día</strong>. Su equivalente de siete días es <strong>{daily * 7} puntos</strong>. Es una referencia editable, no una recomendación personalizada.</p><p>La semana va de lunes a domingo. El total semanal usa la referencia diaria actual multiplicada por siete. No añade extras ni traslada sobrantes a otra semana; no propone ahorrar comida un día para compensar otro.</p><button type="button" onClick={onConfigure}>Revisar mi referencia diaria →</button></div>
    <div className="pointsRecommendations"><span className="pointsEyebrow">03 / CUIDA LO QUE COMES</span><h4>Recomendaciones para el día a día</h4><div>{[
      ["🥦", "Variedad en el plato", "Combina verduras, fruta, legumbres, cereales preferentemente integrales y fuentes variadas de proteína según tus necesidades."],
      ["🫒", "También cuentan los añadidos", "Mide el aceite y los aliños. Inclúyelos en la receta; que un alimento sea saludable no significa que no aporte energía."],
      ["💧", "Agua como bebida habitual", "Registra por separado el azúcar, la leche o los siropes que añadas a otras bebidas."],
      ["🍽️", "Come para nutrirte", "Mantén comidas suficientes y atiende al hambre y la saciedad. El objetivo no es consumir el menor número de puntos posible."],
      ["🏷️", "Etiqueta y preparación", "La marca, la grasa y la forma de cocinar cambian el resultado. Para productos concretos utiliza su etiqueta en la calculadora."],
      ["🌿", "Una rutina sostenible", "Organiza compras y comidas, disfruta al comer y acompaña la alimentación con descanso y movimiento adaptado a ti."],
    ].map(([icon, title, text]) => <article key={title}><span aria-hidden="true">{icon}</span><h5>{title}</h5><p>{text}</p></article>)}</div><p className="pointsHelpNote">Si necesitas una dieta terapéutica, tienes medicación ligada a las comidas, estás embarazada o en lactancia, eres menor o contar puntos te provoca ansiedad, el plan debe adaptarse con un profesional sanitario.</p></div>
    <div className="pointsFaq"><h4>Dudas habituales</h4>
      <details><summary>¿Se usa solo el ingrediente con más puntos?</summary><p>Se cuenta el conjunto del plato y las cantidades que lleva. Un ingrediente con menos puntos también aporta al total. En la calculadora puedes ver el desglose y las raciones.</p></details>
      <details><summary>¿La fruta y la verdura son de consumo libre?</summary><p>En este método energético también se cuentan. Otros programas pueden asignarles cero con reglas propias. Una cantidad pequeña puede redondearse a 0 puntos; esto no significa que sea ilimitada ni que carezca de nutrientes.</p></details>
      <details><summary>¿Por qué no coinciden exactamente las sumas redondeadas?</summary><p>DIETEAR suma primero la energía de los ingredientes sin redondear y calcula después los puntos del total o de la ración. El desglose de cada ingrediente se muestra con un decimal.</p></details>
      <details><summary>¿Qué pasa si supero mi referencia?</summary><p>Queda registrado como información. Revisa las cantidades y el contexto; continúa con una alimentación suficiente. No compenses saltándote comidas.</p></details>
      <details><summary>¿Esto equivale a los puntos oficiales de WW?</summary><p>DIETEAR usa una equivalencia energética propia, no la fórmula ni los presupuestos oficiales de WW u otra marca. Sus tablas, alimentos de cero puntos y extras semanales no son intercambiables con este método.</p></details>
      <details><summary>¿Dónde se guardan mis registros?</summary><p>Se conservan en este navegador y dispositivo. No se sincronizan automáticamente con otros móviles u ordenadores.</p></details>
    </div>
    <p className="pointsHelpNote">Lecturas: <a href="https://www.aesan.gob.es/actualidad/actualidad-noticias/recomendaciones_dieteticas" target="_blank" rel="noreferrer">recomendaciones dietéticas de AESAN</a> · <a href="https://fdc.nal.usda.gov/data-documentation/" target="_blank" rel="noreferrer">documentación nutricional USDA</a>. La equivalencia de puntos es un criterio propio de DIETEAR.</p>
  </div>;
}
