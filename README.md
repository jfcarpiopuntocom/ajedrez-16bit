# Los Dos Reinos - ElMultiversoDelAjedrez.com

Ajedrez HTML5 con arte pixel propio. Juegas con el ejército **Azul** contra una IA con 8 niveles de dificultad, desde *Distraído* hasta el simulador **Bobby Fischer**. También se juega con un amigo en persona u online (1 vs 1).

## Jugar
Abre `index.html` en cualquier navegador moderno, o visita la versión publicada en GitHub Pages.

## Cómo está hecho
- **Reglas:** [chess.js](https://github.com/jhlywa/chess.js) (movimientos legales, jaque, mate, enroque, al paso, coronación).
- **Motor / IA:** [Stockfish](https://stockfishchess.org) corriendo 100% en el navegador (sin API, sin servidor, sin claves). Si el motor no carga, hay una IA local de respaldo.
- **Arte:** tablero, título y las 12 piezas extraídas pixel-a-pixel de la lámina original *El Reino de JuanFerland*.

## Niveles
| Nivel | Fuerza aprox. |
|---|---|
| Distraído | ~200 Elo |
| Casual | ~333 Elo |
| Novato | ~600 Elo |
| Medio | ~1200 Elo |
| Alto calibre | ~1600 Elo |
| Chess Master | ~2100 Elo |
| Grandmaster | ~2600 Elo |
| Bobby Fischer | fuerza máxima |

## Controles
- Arrastra una pieza hasta su destino (no hay «tocar para mover»: decisión de diseño).
- **Nueva partida**, **Deshacer**, **Rehacer**, **Tablas**, **Rendirse** y **Guardar**; el código de partida permite continuarla en otro dispositivo (Función Multiverso).
