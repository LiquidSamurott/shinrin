<script setup lang="ts">
import { ref, computed } from "vue";
import type { Editor } from "@tiptap/vue-3";
import { 
  X, 
  Copy,
  Check
} from "@lucide/vue";

const props = defineProps<{
  open: boolean;
  editor: Editor;
}>();

const emit = defineEmits<{
  "update:open": [boolean];
}>();

const latex = ref("");
const selectedCategory = ref<string | null>(null);
const searchQuery = ref("");
const copiedEquation = ref<string | null>(null);

// Equation Packs (same as before)
const equationPacks = {
  "Algebra": {
    icon: "∑",
    equations: [
      { label: "Quadratic Formula", latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}" },
      { label: "Linear Equation", latex: "y = mx + b" },
      { label: "Point-Slope Form", latex: "y - y_1 = m(x - x_1)" },
      { label: "Slope Formula", latex: "m = \\frac{y_2 - y_1}{x_2 - x_1}" },
      { label: "Distance Formula", latex: "d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}" },
      { label: "Midpoint Formula", latex: "M = \\left(\\frac{x_1 + x_2}{2}, \\frac{y_1 + y_2}{2}\\right)" },
      { label: "Arithmetic Series", latex: "S_n = \\frac{n}{2}(a_1 + a_n)" },
      { label: "Geometric Series", latex: "S_n = a \\frac{1 - r^n}{1 - r}" },
      { label: "Binomial Theorem", latex: "(x + y)^n = \\sum_{k=0}^{n} \\binom{n}{k} x^{n-k} y^k" }
    ]
  },
  "Calculus": {
    icon: "∫",
    equations: [
      { label: "Derivative", latex: "f'(x) = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" },
      { label: "Power Rule", latex: "\\frac{d}{dx} x^n = nx^{n-1}" },
      { label: "Product Rule", latex: "\\frac{d}{dx}(uv) = u\\frac{dv}{dx} + v\\frac{du}{dx}" },
      { label: "Quotient Rule", latex: "\\frac{d}{dx}\\left(\\frac{u}{v}\\right) = \\frac{v\\frac{du}{dx} - u\\frac{dv}{dx}}{v^2}" },
      { label: "Chain Rule", latex: "\\frac{dy}{dx} = \\frac{dy}{du} \\cdot \\frac{du}{dx}" },
      { label: "Definite Integral", latex: "\\int_{a}^{b} f(x) dx" },
      { label: "Indefinite Integral", latex: "\\int f(x) dx = F(x) + C" },
      { label: "Integration by Parts", latex: "\\int u \\ dv = uv - \\int v \\ du" },
      { label: "Fundamental Theorem", latex: "\\frac{d}{dx} \\int_{a}^{x} f(t) dt = f(x)" },
      { label: "Taylor Series", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(a)}{n!}(x-a)^n" },
      { label: "Maclaurin Series", latex: "f(x) = \\sum_{n=0}^{\\infty} \\frac{f^{(n)}(0)}{n!} x^n" }
    ]
  },
  "Trigonometry": {
    icon: "θ",
    equations: [
      { label: "Pythagorean Identity", latex: "\\sin^2\\theta + \\cos^2\\theta = 1" },
      { label: "Double Angle", latex: "\\sin(2\\theta) = 2\\sin\\theta\\cos\\theta" },
      { label: "Double Angle Cos", latex: "\\cos(2\\theta) = \\cos^2\\theta - \\sin^2\\theta" },
      { label: "Half Angle", latex: "\\sin\\left(\\frac{\\theta}{2}\\right) = \\pm\\sqrt{\\frac{1 - \\cos\\theta}{2}}" },
      { label: "Law of Sines", latex: "\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}" },
      { label: "Law of Cosines", latex: "c^2 = a^2 + b^2 - 2ab\\cos C" },
      { label: "Area of Triangle", latex: "A = \\frac{1}{2}ab\\sin C" },
      { label: "Sum of Angles", latex: "\\sin(A + B) = \\sin A\\cos B + \\cos A\\sin B" }
    ]
  },
  "Statistics": {
    icon: "μ",
    equations: [
      { label: "Mean", latex: "\\bar{x} = \\frac{1}{n}\\sum_{i=1}^{n} x_i" },
      { label: "Variance", latex: "\\sigma^2 = \\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2" },
      { label: "Standard Deviation", latex: "\\sigma = \\sqrt{\\frac{1}{n}\\sum_{i=1}^{n} (x_i - \\bar{x})^2}" },
      { label: "Z-Score", latex: "Z = \\frac{X - \\mu}{\\sigma}" },
      { label: "Correlation", latex: "r = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sqrt{\\sum(x_i - \\bar{x})^2\\sum(y_i - \\bar{y})^2}}" },
      { label: "Linear Regression", latex: "\\hat{y} = a + bx" },
      { label: "Slope in Regression", latex: "b = \\frac{\\sum(x_i - \\bar{x})(y_i - \\bar{y})}{\\sum(x_i - \\bar{x})^2}" },
      { label: "Intercept", latex: "a = \\bar{y} - b\\bar{x}" }
    ]
  },
  "Physics": {
    icon: "⚛",
    equations: [
      { label: "Newton's Second Law", latex: "F = ma" },
      { label: "Kinematics", latex: "v = u + at" },
      { label: "Kinematics 2", latex: "s = ut + \\frac{1}{2}at^2" },
      { label: "Velocity Squared", latex: "v^2 = u^2 + 2as" },
      { label: "Work", latex: "W = Fd\\cos\\theta" },
      { label: "Kinetic Energy", latex: "K = \\frac{1}{2}mv^2" },
      { label: "Potential Energy", latex: "U = mgh" },
      { label: "Momentum", latex: "p = mv" },
      { label: "Impulse", latex: "J = F\\Delta t = \\Delta p" },
      { label: "Gravitational Force", latex: "F = G\\frac{m_1m_2}{r^2}" },
      { label: "Coulomb's Law", latex: "F = k\\frac{q_1q_2}{r^2}" },
      { label: "Ohm's Law", latex: "V = IR" }
    ]
  },
  "Geometry": {
    icon: "△",
    equations: [
      { label: "Circle Area", latex: "A = \\pi r^2" },
      { label: "Circle Circumference", latex: "C = 2\\pi r" },
      { label: "Circle Equation", latex: "(x - h)^2 + (y - k)^2 = r^2" },
      { label: "Triangle Area", latex: "A = \\frac{1}{2}bh" },
      { label: "Pythagorean Theorem", latex: "a^2 + b^2 = c^2" },
      { label: "Trapezoid Area", latex: "A = \\frac{1}{2}(a + b)h" },
      { label: "Volume of Sphere", latex: "V = \\frac{4}{3}\\pi r^3" },
      { label: "Surface Area of Sphere", latex: "A = 4\\pi r^2" },
      { label: "Volume of Cylinder", latex: "V = \\pi r^2h" },
      { label: "Volume of Cone", latex: "V = \\frac{1}{3}\\pi r^2h" }
    ]
  },
  "Matrices": {
    icon: "⎡",
    equations: [
      { label: "2x2 Matrix", latex: "\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}" },
      { label: "3x3 Matrix", latex: "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}" },
      { label: "Matrix Determinant", latex: "\\det(A) = ad - bc" },
      { label: "Identity Matrix", latex: "I = \\begin{pmatrix} 1 & 0 & 0 \\\\ 0 & 1 & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}" },
      { label: "Matrix Addition", latex: "A + B = \\begin{pmatrix} a+c & b+d \\\\ e+g & f+h \\end{pmatrix}" },
      { label: "Matrix Multiplication", latex: "AB = \\begin{pmatrix} a e + b g & a f + b h \\\\ c e + d g & c f + d h \\end{pmatrix}" }
    ]
  },
  "Chemistry": {
    icon: "🧪",
    equations: [
      { label: "Ideal Gas Law", latex: "PV = nRT" },
      { label: "Boyle's Law", latex: "P_1V_1 = P_2V_2" },
      { label: "Charles's Law", latex: "\\frac{V_1}{T_1} = \\frac{V_2}{T_2}" },
      { label: "Combined Gas Law", latex: "\\frac{P_1V_1}{T_1} = \\frac{P_2V_2}{T_2}" },
      { label: "pH Equation", latex: "pH = -\\log[H^+]" },
      { label: "pOH Equation", latex: "pOH = -\\log[OH^-]" },
      { label: "Acid Dissociation", latex: "K_a = \\frac{[H^+][A^-]}{[HA]}" },
      { label: "Base Dissociation", latex: "K_b = \\frac{[OH^-][HA]}{[A^-]}" },
      { label: "Molarity", latex: "M = \\frac{moles}{liters}" }
    ]
  },
  "Probability": {
    icon: "P",
    equations: [
      { label: "Union", latex: "P(A \\cup B) = P(A) + P(B) - P(A \\cap B)" },
      { label: "Conditional", latex: "P(A|B) = \\frac{P(A \\cap B)}{P(B)}" },
      { label: "Bayes' Theorem", latex: "P(A|B) = \\frac{P(B|A)P(A)}{P(B)}" },
      { label: "Binomial Distribution", latex: "P(X=k) = \\binom{n}{k} p^k (1-p)^{n-k}" },
      { label: "Normal Distribution", latex: "f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}} e^{-\\frac{(x-\\mu)^2}{2\\sigma^2}}" },
      { label: "Expected Value", latex: "E(X) = \\sum_{i=1}^{n} x_i P(X=x_i)" },
      { label: "Variance", latex: "Var(X) = E(X^2) - [E(X)]^2" },
      { label: "Poisson Distribution", latex: "P(X=k) = \\frac{e^{-\\lambda}\\lambda^k}{k!}" }
    ]
  }
};

const categories = Object.keys(equationPacks);
const selectedEquations = computed(() => {
  let equations: { label: string; latex: string }[] = [];
  
  if (selectedCategory.value) {
    equations = equationPacks[selectedCategory.value as keyof typeof equationPacks]?.equations || [];
  } else {
    for (const pack of Object.values(equationPacks)) {
      equations = equations.concat(pack.equations);
    }
  }
  
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    equations = equations.filter(e => 
      e.label.toLowerCase().includes(query) || 
      e.latex.toLowerCase().includes(query)
    );
  }
  
  return equations;
});

function insertEquation(latexString: string) {
  latex.value = latexString;
}

function insertAndClose() {
  if (!latex.value.trim()) return;
  
  // Use insertInlineMath for inline equations
  props.editor
    .chain()
    .focus()
    .insertInlineMath({
      latex: latex.value
    })
    .run();
  
  latex.value = "";
  selectedCategory.value = null;
  searchQuery.value = "";
  emit("update:open", false);
}

function copyEquation(latexString: string) {
  navigator.clipboard.writeText(latexString);
  copiedEquation.value = latexString;
  setTimeout(() => {
    copiedEquation.value = null;
  }, 2000);
}

function toggleCategory(category: string) {
  if (selectedCategory.value === category) {
    selectedCategory.value = null;
  } else {
    selectedCategory.value = category;
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
      @click.self="emit('update:open', false)"
    >
      <div class="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 class="text-lg font-semibold text-white">Insert Inline Equation</h2>
          <button
            @click="emit('update:open', false)"
            class="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
          <!-- Sidebar: Categories -->
          <div class="w-48 border-r border-white/10 bg-white/5 p-4 overflow-y-auto">
            <div class="mb-3">
              <button
                @click="selectedCategory = null"
                class="w-full rounded-lg px-3 py-2 text-left text-sm transition"
                :class="selectedCategory === null ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
              >
                All Equations
              </button>
            </div>
            <div class="space-y-1">
              <button
                v-for="category in categories"
                :key="category"
                @click="toggleCategory(category)"
                class="w-full rounded-lg px-3 py-2 text-left text-sm transition"
                :class="selectedCategory === category ? 'bg-fuchsia-500/20 text-fuchsia-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'"
              >
                <span class="mr-2">{{ equationPacks[category as keyof typeof equationPacks].icon }}</span>
                {{ category }}
              </button>
            </div>
          </div>

          <!-- Main Content -->
          <div class="flex-1 flex flex-col overflow-hidden">
            <!-- Search -->
            <div class="border-b border-white/10 px-4 py-3">
              <input
                v-model="searchQuery"
                type="text"
                placeholder="Search equations..."
                class="w-full rounded-lg border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white outline-none focus:border-fuchsia-500/40"
              />
            </div>

            <!-- Equation List -->
            <div class="flex-1 overflow-y-auto p-4">
              <div v-if="selectedEquations.length === 0" class="flex h-full items-center justify-center text-slate-500">
                No equations found
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                <button
                  v-for="eq in selectedEquations"
                  :key="eq.latex"
                  @click="insertEquation(eq.latex)"
                  class="group relative rounded-lg border border-white/10 bg-white/5 p-3 text-left transition hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5"
                >
                  <div class="flex items-start justify-between">
                    <div class="flex-1 min-w-0">
                      <p class="text-xs font-medium text-slate-400">{{ eq.label }}</p>
                      <p class="mt-1 font-mono text-sm text-white truncate">{{ eq.latex }}</p>
                    </div>
                    <button
                      @click.stop="copyEquation(eq.latex)"
                      class="ml-2 rounded-lg p-1.5 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
                      title="Copy equation"
                    >
                      <Check v-if="copiedEquation === eq.latex" class="h-3.5 w-3.5 text-emerald-400" />
                      <Copy v-else class="h-3.5 w-3.5" />
                    </button>
                  </div>
                </button>
              </div>
            </div>

            <!-- Editor Area -->
            <div class="border-t border-white/10 p-4 bg-white/5">
              <div class="flex items-end gap-3">
                <div class="flex-1">
                  <label class="text-xs text-slate-400">LaTeX</label>
                  <textarea
                    v-model="latex"
                    rows="2"
                    class="mt-1 w-full rounded-lg border border-white/10 bg-slate-800 p-3 font-mono text-sm text-white outline-none focus:border-fuchsia-500/40"
                    placeholder="Type or select an equation..."
                  />
                </div>
                <div class="flex gap-2">
                  <button
                    @click="emit('update:open', false)"
                    class="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-400 transition hover:bg-white/10 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    @click="insertAndClose"
                    :disabled="!latex.trim()"
                    class="rounded-lg bg-fuchsia-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-fuchsia-400 disabled:opacity-40"
                  >
                    Insert Inline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>