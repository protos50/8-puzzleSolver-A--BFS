# 8-Puzzle Solver: Introduction to AI via Search

This project is an educational prototype designed to visualize and understand how search algorithms work in the context of Artificial Intelligence. It demonstrates how fundamental algorithms can automatically solve complex combinatorial problems.

> **🤖 Note on Development:** This project was designed and programmed with the assistance of Artificial Intelligence. It serves as a dual example: on one hand, it teaches the fundamentals of classical AI (search), and on the other, it demonstrates how modern generative AI can accelerate and enhance software development.

## 🎯 The Idea: From Simple to Complex

We often think of AI as complex neural networks or black magic. However, the foundations of AI are built on **state space search**.

This program uses the classic "8-Puzzle" to demonstrate that:

1. A complex problem can be modeled as a state graph.
2. Simple algorithms can navigate this graph to find solutions that would take a human a long time to deduce.
3. The difference between "blind" and "informed" search is abysmal in terms of efficiency.

## ✨ Key Features

* **Real-Time Comparison:**
  * **BFS (Breadth-First Search):** "Blind" algorithm. Explores all possibilities level by level. Guarantees the shortest solution but explores thousands of unnecessary nodes.
  * **A* (A-Star):** "Informed" algorithm. Uses a heuristic (Manhattan Distance) to "intuit" which path is more promising, solving the problem by exploring a fraction of the nodes BFS needs.

* **Deep Visualization:**
  * **Dual Boards:** Watch the solution executing on the left, while on the right you observe the algorithm "thinking" and testing paths.
  * **Interactive Search Tree:** A dynamic graph that draws the search structure. You can zoom in and see how decisions branch out.
  * **Frontier (Priority Queue):** Visualize which states are waiting to be explored and how the algorithm prioritizes them (color-coded).
  * **Level Histogram:** Shows node distribution by depth with logarithmic scaling for better visibility.

* **Smart Controls:**
  * **Easy Shuffle:** Generates simpler puzzles (8-12 moves) ideal for BFS demonstrations.
  * **Difficulty Estimator:** Real-time hint showing puzzle complexity before solving.
  * **Adjustable BFS Limit:** Choose between 5K, 10K, 20K, or 50K nodes to balance performance vs. completeness.
  * **Solution Playback:** Step-by-step navigation with play/pause controls.

## 🚀 Execution Instructions

### Prerequisites

* Python 3.12+ installed.

### Steps

1. **Clone the repository:**

   ```bash
   git clone https://github.com/protos50/8-puzzleSolver-A--BFS.git
   cd tp1_prototipo
   ```

2. **Create and activate virtual environment:**

   ```bash
   # Create virtual environment
   python -m venv .venv

   # Activate (Windows)
   .venv\Scripts\activate

   # Activate (Linux/Mac)
   source .venv/bin/activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Start the application:**

   ```bash
   python backend/app.py
   ```

5. **Use:**
   Open your web browser and go to: **`http://127.0.0.1:5000`**

## 📂 Project Structure

The project follows a simple but effective architecture:

* **`backend/` (Python + Flask):** The "brain".
  * `solver.py`: Contains the pure logic of A* and BFS algorithms.
  * `app.py`: API connecting the algorithms with the web interface.
* **`frontend/` (HTML/CSS/JS):** The "face".
  * Interactive visualization using D3.js for the search tree.
  * Animation logic and state control on the client side.
  * Modular architecture: separate CSS and JS files for each component.
* **`requirements.txt`:** Python dependencies (Flask, flask-cors).
* **`.venv/`:** Virtual environment (not tracked in Git).

## 📦 Dependencies Management

All Python dependencies are listed in `requirements.txt`:

* Flask 3.1.2 (web framework)
* flask-cors 6.0.1 (CORS support)
* And their sub-dependencies

The virtual environment (`.venv`) is **not pushed to Git** thanks to `.gitignore`. Each developer creates their own local environment.

## 🧠 Educational Value

This software seeks to answer: *How can a machine solve a problem?*
The answer is not magic, it is **systematic search**. By seeing how A* ignores irrelevant paths and goes straight to the goal, one understands the power of heuristics in Artificial Intelligence.

---
*Project developed for the Artificial Intelligence course - Systems Engineering Degree (UNNE).*
