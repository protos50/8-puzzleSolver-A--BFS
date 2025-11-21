# Trabajo Práctico 1: Fundamentos y Tecnologías de la IA
## Solución de 8-Puzzle con Búsqueda A*

### Problema
El **8-Puzzle** consiste en un tablero de 3x3 con 8 fichas numeradas y un espacio vacío. El objetivo es ordenar las fichas del 1 al 8 moviéndolas al espacio vacío.
- **Espacio de Estados**: Todas las posibles configuraciones del tablero (9! / 2 = 181,440 estados alcanzables).
- **Estado Inicial**: Configuración desordenada.
- **Estado Meta**: Fichas ordenadas (1, 2, 3, ..., 8, vacío).

### Algoritmo Seleccionado: A* (A-Star)
A* es un algoritmo de búsqueda informada que encuentra el camino más corto a la meta combinando el costo real y una estimación heurística.
- **Función de Evaluación**: $f(n) = g(n) + h(n)$
  - $g(n)$: Costo del camino desde el inicio hasta el nodo $n$ (número de movimientos).
  - $h(n)$: Estimación del costo desde $n$ hasta la meta (heurística).

### Heurística: Distancia Manhattan
Para este problema, utilizamos la **Distancia Manhattan** como heurística admisible (nunca sobreestima el costo).
- Se calcula como la suma de las distancias verticales y horizontales de cada ficha a su posición correcta.
- $h(n) = \sum_{i=1}^{8} (|x_i - x_{meta}| + |y_i - y_{meta}|)$

### Implementación
- **Lenguaje**: Python (Backend) + HTML/JS (Frontend).
- **Estructura**:
  - `solver.py`: Implementa la lógica A* y BFS.
  - `app.py`: API Flask para conectar con la interfaz web.

### Comparación de Algoritmos
# Trabajo Práctico 1: Fundamentos y Tecnologías de la IA
## Solución de 8-Puzzle con Búsqueda A*

### Problema
El **8-Puzzle** consiste en un tablero de 3x3 con 8 fichas numeradas y un espacio vacío. El objetivo es ordenar las fichas del 1 al 8 moviéndolas al espacio vacío.
- **Espacio de Estados**: Todas las posibles configuraciones del tablero (9! / 2 = 181,440 estados alcanzables).
- **Estado Inicial**: Configuración desordenada.
- **Estado Meta**: Fichas ordenadas (1, 2, 3, ..., 8, vacío).

### Algoritmo Seleccionado: A* (A-Star)
A* es un algoritmo de búsqueda informada que encuentra el camino más corto a la meta combinando el costo real y una estimación heurística.
- **Función de Evaluación**: $f(n) = g(n) + h(n)$
  - $g(n)$: Costo del camino desde el inicio hasta el nodo $n$ (número de movimientos).
  - $h(n)$: Estimación del costo desde $n$ hasta la meta (heurística).

### Heurística: Distancia Manhattan
Para este problema, utilizamos la **Distancia Manhattan** como heurística admisible (nunca sobreestima el costo).
- Se calcula como la suma de las distancias verticales y horizontales de cada ficha a su posición correcta.
- $h(n) = \sum_{i=1}^{8} (|x_i - x_{meta}| + |y_i - y_{meta}|)$

### Implementación
- **Lenguaje**: Python (Backend) + HTML/JS (Frontend).
- **Estructura**:
  - `solver.py`: Implementa la lógica A* y BFS.
  - `app.py`: API Flask para conectar con la interfaz web.

# 8-Puzzle Solver: Comparación de Algoritmos de Búsqueda

## Introducción

El problema del 8-Puzzle consiste en un tablero de 3x3 con 8 fichas numeradas y un espacio vacío. El objetivo es llegar a un estado meta moviendo las fichas.

Este proyecto compara dos enfoques para resolverlo:
- **Búsqueda Informada (A*)**
- **Búsqueda Ciega (BFS)**

## Algoritmos Implementados

### 1. A* (A-Star)
- **Tipo**: Búsqueda Informada.
- **Heurística**: Distancia Manhattan (suma de las distancias de cada ficha a su posición objetivo).
- **Funcionamiento**: Evalúa nodos basándose en $f(n) = g(n) + h(n)$, donde $g(n)$ es el costo real y $h(n)$ la heurística.

### 2. BFS (Breadth-First Search)
- **Tipo**: Búsqueda Ciega (No Informada).
- **Funcionamiento**: Explora todos los nodos vecinos del nivel actual antes de pasar al siguiente nivel. Garantiza la solución más corta (en número de pasos), pero a un costo computacional alto.

## Comparación de Algoritmos

| Característica | A* (Informada) | BFS (Ciega) |
| :--- | :--- | :--- |
| **Conocimiento** | Usa heurística (Manhattan) | No usa conocimiento del dominio |
| **Exploración** | Dirigida hacia la meta | Exhaustiva (nivel por nivel) |
| **Eficiencia** | Alta (pocos nodos explorados) | Baja (muchos nodos explorados) |
| **Optimidad** | Sí (si la heurística es admisible) | Sí (garantiza el camino más corto) |

### Resultados Observados

En las pruebas realizadas con el prototipo:

- **Nodos Explorados**: BFS explora exponencialmente más nodos que A*. Para soluciones de profundidad media (ej. 15-20 pasos), BFS puede explorar decenas de miles de nodos, mientras que A* explora unos pocos cientos.
- **Tiempo de Ejecución**: A* es casi instantáneo. BFS puede tardar segundos o minutos, o incluso agotar la memoria/límite de nodos en estados complejos.
- **Longitud del Camino**: Ambos encuentran la solución óptima (mismo número de pasos), pero A* lo hace mucho más rápido.

### Limitaciones y Casos de Falla (Demo)

Durante la demostración en vivo se observó claramente la diferencia:
1.  **Caso Exitoso (A*)**: Resolvió un puzzle complejo en **23 movimientos** explorando solo **1,585 nodos**.
2.  **Caso de Falla (BFS)**: Al intentar resolver un puzzle de complejidad similar, BFS **falló** al alcanzar el límite de seguridad (50,000 nodos) sin encontrar la meta.

**Conclusión Clave**: BFS es viable solo para problemas "fáciles" (poca profundidad). Se "ahoga" exponencialmente cuando la complejidad aumenta. A* es necesario para problemas reales debido a su capacidad de ir "directo al grano" usando la heurística.

## Referencias

1.  S. Russell and P. Norvig, *Artificial Intelligence: A Modern Approach*, 4th ed. Pearson, 2020.
2.  R. E. Korf, "Depth-first iterative-deepening: An optimal admissible tree search," *Artificial Intelligence*, vol. 27, no. 1, pp. 97-109, 1985.
3.  P. E. Hart, N. J. Nilsson, and B. Raphael, "A Formal Basis for the Heuristic Determination of Minimum Cost Paths," *IEEE Transactions on Systems Science and Cybernetics*, vol. 4, no. 2, pp. 100-107, 1968.
