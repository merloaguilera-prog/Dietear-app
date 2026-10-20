# Configurar USDA FoodData Central para Mi plato inteligente

## 1. Obtener la clave
Solicitar una API key en https://fdc.nal.usda.gov/api-key-signup/
No escribir la clave en GitHub, en el chat, en el navegador ni en variables que empiecen por NEXT_PUBLIC_.

## 2. Desarrollo local
En un archivo local `.env.local` que no se suba al repositorio:

```env
USDA_API_KEY=TU_CLAVE_PRIVADA
MI_PLATO_NUTRITION_ENABLED=false
```

Activar `MI_PLATO_NUTRITION_ENABLED=true` **solo** en un entorno de pruebas con autenticación, limitación de solicitudes y comprobación de permisos ya implementadas. El endpoint actual `/api/mi-plato/alimentos` NO valida todavía la sesión: por eso debe permanecer desactivado en despliegues accesibles al público.

## 3. Vercel (solo entorno de pruebas)
En Settings → Environment Variables del proyecto de pruebas, crear `USDA_API_KEY` como secreto de servidor y mantener `MI_PLATO_NUTRITION_ENABLED=false` hasta completar los controles. No cambiar variables de Production ni desplegar desde `main` mientras Google Play revisa la versión actual.

## 4. Verificaciones antes de activar
- Implementar autenticación y autorización por usuario en el endpoint de búsqueda.
- Implementar límites de peticiones y control de gasto/abuso.
- Comprobar que no se imprime la clave en logs ni llega al cliente.
- Validar respuesta de USDA, unidades por 100 g y tratamiento de valores faltantes.
- Probar crudo/cocinado, nombres en español (USDA devuelve principalmente descripciones en inglés), alimentos no encontrados, errores 429 y fallos de red.
- Conectar el catálogo con la pantalla y los perfiles reales; realizar pruebas de integración y Android.

## Estado
Adaptador USDA y pantalla de búsqueda añadidos a la rama `feature/mi-plato-inteligente`. Clave sin configurar; funcionalidad desactivada; pruebas reales pendientes.
