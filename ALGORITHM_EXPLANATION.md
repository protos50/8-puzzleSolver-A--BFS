# Cómo Funcionan los Algoritmos

## BFS (Breadth-First Search) - Búsqueda Ciega 🤖

**NO es al azar. Es sistemático pero sin dirección:**

1. Empieza desde el estado inicial
2. Genera TODOS los movimientos posibles (arriba, abajo, izq, der)
3. Explora cada uno de esos estados
4. Para cada nuevo estado, vuelve a generar TODOS los movimientos posibles
5. Continúa nivel por nivel hasta encontrar la solución

**Ejemplo paso a paso:**
```
Estado Inicial: [1,2,3,4,5,6,7,0,8]

Nivel 1 (todos los estados a 1 movimiento):
- Mueve 7 → [1,2,3,4,5,6,0,7,8]
- Mueve 8 → [1,2,3,4,5,6,7,8,0]

Nivel 2 (todos los estados a 2 movimientos desde nivel 1):
- Desde [1,2,3,4,5,6,0,7,8]:
  - Mueve 4 → [1,2,3,0,5,6,4,7,8]
  - Mueve 6 → [1,2,3,4,5,0,6,7,8]
  - Mueve 7 → [1,2,3,4,5,6,7,0,8] (ya visto, lo ignora)
- Desde [1,2,3,4,5,6,7,8,0]:
  - Mueve 6 → [1,2,3,4,5,0,7,8,6]
  - Mueve 8 → [1,2,3,4,5,6,7,0,8] (ya visto, lo ignora)

... y así sucesivamente
```

**Características:**
- ✅ Garantiza encontrar la solución MÁS CORTA
- ❌ Explora MUCHÍSIMOS estados innecesarios
- ❌ Es "ciego" - no sabe si va bien o mal
- ❌ Puede explorar 20,000+ nodos para problemas difíciles

---

## A* (A-Star) - Búsqueda Informada 🎯

**Usa inteligencia para decidir qué explorar primero:**

### Heurística: Distancia Manhattan

Para cada estado, calcula:
```
Para cada ficha (1-8):
  - ¿Dónde está ahora?
  - ¿Dónde debería estar?
  - Suma la distancia horizontal + vertical

Ejemplo:
Ficha 5 está en posición (2,1) 
Debería estar en posición (1,1)
Distancia = |2-1| + |1-1| = 1

Total del tablero = suma de todas las fichas
```

### Función de Evaluación: f(n) = g(n) + h(n)

- **g(n)** = Movimientos realizados hasta ahora
- **h(n)** = Distancia Manhattan (estimación de cuánto falta)
- **f(n)** = Costo total estimado

**Ejemplo paso a paso:**
```
Estado: [1,2,3,4,0,6,7,5,8]
g = 5 (5 movimientos hasta aquí)
h = 2 (Manhattan: ficha 5 está a 1 casilla, todo lo demás ok)
f = 5 + 2 = 7 → PRIORIDAD BAJA (sigue este camino)

Estado: [1,2,3,4,6,0,7,5,8]  
g = 5
h = 4 (Manhattan: ficha 5 y 6 mal posicionadas)
f = 5 + 4 = 9 → PRIORIDAD ALTA (ignora este camino)
```

**Características:**
- ✅ Explora MUCHO MENOS (cientos vs miles de nodos)
- ✅ Es "inteligente" - sabe si va bien
- ✅ Encuentra solución rápidamente
- ✅ Para 8-Puzzle, garantiza solución óptima con Manhattan

---

## Comparación Visual

**BFS:** Explora como un círculo que crece en todas direcciones
```
        o o o
      o o O o o      O = inicio
    o o o o o o o    o = explorado
      o o o o o
        o o o
```

**A*:** Explora como una flecha hacia el objetivo
```
        o              O = inicio
      o O →            → = dirección hacia meta
    o → → →            o = explorado solo cerca del camino
```

---

## En el Tablero de Exploración

Lo que ves NO son "los pasos de la solución", sino **todos los tableros que el algoritmo consideró** mientras buscaba.

- **BFS**: Verás el tablero cambiar caóticamente, volviendo atrás, probando todo
- **A***: Verás cambios más directos, enfocados hacia la solución
