# Dirección visual ESENCIA
Mezcla solicitada de DESIGN (1).md (Dala) y DESIGN.md (Max Yinger).
El contexto maestro y las preferencias confirmadas prevalecen sobre las referencias.

- Dala: espacio negro, títulos grandes de peso regular, composiciones asimétricas y constelación de partículas.
- Yinger: objeto central con profundidad, monocromo plata, anotaciones pequeñas y controles en los bordes.
- ESENCIA: los dos logos originales, origen Alicante, archivo real, comunidad negra y próximo evento después de 01.
- No se copian los textos, cerebro, cubos, paleta violeta, fuentes comerciales ni identidad de las referencias.
- Las imágenes reales futuras del archivo y comunidad siguen teniendo prioridad.

## Ajustes
css/art-direction.css es la capa visual compartida, cargada al final.
js/logo-sculpture.js contiene CONFIG: densidad de puntos, profundidad y límite de resolución.
El volumen se construye leyendo píxeles oscuros de los dos assets originales y proyectando tres capas en Canvas 2D. Es una escultura de partículas con coordenadas 3D, no un modelo sólido exportable ni una geometría WebGL.
No requiere paquetes ni build. Los assets no se modifican ni se duplican.

## Comportamiento
Bomba única en el inicio, con giro 360° cada 12 segundos sobre eje inclinado 23,4°. Wordmark en el pie, con onda en profundidad y balanceo distinto. Pausa compartida, sin selectores de forma. Reacción al ratón sin interceptar scroll táctil.
El movimiento se detiene fuera del viewport y al ocultar la pestaña.
prefers-reduced-motion y ahorro de datos activan vista estática. Reduced motion bloquea la reproducción; si cambia durante la visita se pausa.
Si falla la lectura de imágenes/Canvas, permanece el símbolo original.
Probar con servidor local HTTP; algunos navegadores bloquean leer píxeles en file://.
