# 8-Puzzle Solver con Comparación de Algoritmos

Este proyecto implementa un resolutor del 8-Puzzle utilizando dos algoritmos de búsqueda: **A* (Informada)** y **BFS (Ciega)**. Permite comparar el rendimiento de ambos en tiempo real.

## Cambios Realizados

### Backend (`backend/`)

**`solver.py`**:

- Se agregó la implementación del algoritmo **BFS**.
- Se añadió recolección de estadísticas: **Nodos Explorados** y **Tiempo de Ejecución**.
- Se refactorizó `solve_puzzle` para aceptar el parámetro `algorithm`.

**`app.py`**:

- Se actualizó el endpoint `/solve` para recibir el algoritmo seleccionado y devolver las estadísticas.

### Frontend (`frontend/`)

**`index.html`**:

- Se agregó un selector para elegir entre "A*" y "BFS".
- Se añadió un panel para mostrar las estadísticas (Nodos, Tiempo, Pasos).

**`script.js`**:

- Lógica para enviar el algoritmo seleccionado al backend.
- Visualización de las estadísticas recibidas.

**`style.css`**:

- Estilos para el selector y el panel de estadísticas.

### Documentación

**`filmina.md`**:

- Se agregó una sección comparativa entre A* y BFS.
# 8-Puzzle Solver con Comparación de Algoritmos

Este proyecto implementa un resolutor del 8-Puzzle utilizando dos algoritmos de búsqueda: **A* (Informada)** y **BFS (Ciega)**. Permite comparar el rendimiento de ambos en tiempo real.

## Cambios Realizados

### Backend (`backend/`)

**`solver.py`**:

- Se agregó la implementación del algoritmo **BFS**.
- Se añadió recolección de estadísticas: **Nodos Explorados** y **Tiempo de Ejecución**.
- Se refactorizó `solve_puzzle` para aceptar el parámetro `algorithm`.

**`app.py`**:

- Se actualizó el endpoint `/solve` para recibir el algoritmo seleccionado y devolver las estadísticas.

### Frontend (`frontend/`)

**`index.html`**:

- Se agregó un selector para elegir entre "A*" y "BFS".
- Se añadió un panel para mostrar las estadísticas (Nodos, Tiempo, Pasos).

**`script.js`**:

- Lógica para enviar el algoritmo seleccionado al backend.
- Visualización de las estadísticas recibidas.

**`style.css`**:

- Estilos para el selector y el panel de estadísticas.

### Documentación

**`filmina.md`**:

- Se agregó una sección comparativa entre A* y BFS.
- Se incluyeron referencias bibliográficas en formato IEEE.

## Cómo Ejecutar

### Prerrequisitos

Necesitas tener Python instalado y las librerías `flask` y `flask-cors`.

## Verificación Realizada

Se realizaron pruebas automáticas de navegador para validar:
1.  **Funcionalidad del Solver**: Se corrigió un error interno (500) restaurando las funciones del backend. Ahora ambos algoritmos resuelven correctamente.
2.  **Visualización de Exploración**:
    *   Se ralentizó la animación a 50ms para que sea perceptible al ojo humano.
    *   Se añadió un **contador de frames** en el título ("Exploration History (Frame: X/Y)") para dar feedback visual claro del progreso.
    *   Se unificaron los estilos de ambos tableros para consistencia visual.
3.  **A* vs BFS**:
    *   **A***: Muestra una exploración rápida y directa (pocas actualizaciones en el tablero derecho).
    *   **BFS**: Muestra una exploración exhaustiva (el contador sube rápidamente y el tablero cambia constantemente) antes de encontrar la solución.
4.  **Interfaz**: El diseño de doble tablero se mantiene estable y los botones responden correctamente.
