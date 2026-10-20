# Mi plato inteligente — captura de comidas

## Diseño aprobado
Segunda propuesta visual: naturaleza, fotografías reales, verde intenso y marcos verde neón. Referencia de diseño, no implica que los recursos gráficos estén integrados.

## Flujo funcional
1. Desde «Mi plato inteligente», pulsar «Fotografiar comida».
2. Solicitar permiso de cámara solo al usarla; permitir seleccionar imagen de galería como alternativa.
3. Mostrar vista previa y permitir repetir, recortar o confirmar la foto.
4. Comprimir/redimensionar la imagen sin perder calidad útil; indicar progreso y gestionar errores de conexión.
5. Enviar a análisis solo tras confirmación, con consentimiento claro si la imagen sale del dispositivo.
6. Mostrar alimentos reconocidos como estimaciones, nunca certezas; permitir corregir ingredientes y gramos manualmente.
7. Calcular nutrientes aproximados tras la corrección, mostrando unidades y advertencia de variabilidad.
8. Permitir guardar la comida en el registro de la persona seleccionada o descartarla.
9. Sugerir menús adaptados a preferencias, alergias y objetivos declarados; no inferir alergias a partir de la foto.

## Privacidad y seguridad
No almacenar fotos por defecto sin elección informada; evitar incluir caras u otros datos personales. Perfiles familiares aislados. No ofrecer diagnóstico médico.

## Pruebas de aceptación pendientes
- Android: permisos concedidos/denegados; cámara y galería.
- Foto válida, borrosa, sin comida y múltiples platos.
- Sin conexión y reintentos sin duplicar registros.
- Edición manual de ingredientes y cantidades.
- Guardado y recuperación en el perfil correcto.
- Accesibilidad y pantallas pequeñas.

## Publicación
Desarrollar y probar solo en `feature/mi-plato-inteligente`. No fusionar a `main`, no desplegar producción y no modificar el envío de Google Play en revisión.
