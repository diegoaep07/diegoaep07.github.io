<script setup lang="ts">
import { nanoid } from "nanoid";
import { onMounted, ref, computed } from "vue";

export type ReactionType = "like" | "love" | "laugh" | "wow" | "sad" | "angry";

interface ReactionCount {
  count: number;
}

interface ReactionsData {
  [key: string]: ReactionCount;
}

interface UserReactions {
  [key: string]: boolean;
}

interface ApiResponse {
  success: boolean;
  error?: string;
  reactions?: ReactionsData;
  count?: number;
  hasReacted?: boolean;
  operation?: 'add' | 'remove' | 'change';
  totalReactions?: number;
}

interface ReactionConfig {
  emoji: string;
  label: string;
}

const REACTIONS_CONFIG: Record<ReactionType, ReactionConfig> = {
  like: { emoji: "👍", label: "Like" },
  love: { emoji: "❤️", label: "Love" },
  laugh: { emoji: "😄", label: "Laugh" },
  wow: { emoji: "😲", label: "Wow" },
  sad: { emoji: "😢", label: "Sad" },
  angry: { emoji: "😠", label: "Angry" },
};

interface Props {
  slug: string;
  apiUrl?: string;
  showLabels?: boolean;
  showTotal?: boolean;
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  apiUrl: "https://reactions-production.danidev.workers.dev",
  size: "md",
  theme: "light",
  showTotal: true,
  showLabels: true,
});

const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const reactions = ref<ReactionsData>({});
const userId = ref<string>("");
const totalReactions = ref<number>(0);
const processingType = ref<ReactionType | null>(null);
const userReactions = ref<UserReactions>({});

const errorMessages = computed(() => error.value || "Error desconocido");

const getOrCreateUserId = (): void => {
  const storedUserId = localStorage.getItem("reactions_user_id");
  if (storedUserId) {
    userId.value = storedUserId;
  } else {
    userId.value = nanoid();
    localStorage.setItem("reactions_user_id", userId.value);
  }
};

const init = async (): Promise<void> => {
  await loadReactions();
};

const loadReactions = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const response = await fetch(`${props.apiUrl}/posts/${props.slug}`);

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Error desconocido");
    }

    reactions.value = data.reactions || {};
    totalReactions.value = data.totalReactions || 0;

    await checkUserReactions();
  } catch (err: any) {
    console.error("Error loading reactions:", err);
    error.value = err.message || "Error al cargar reacciones";
  } finally {
    loading.value = false;
  }
};

const checkUserReactions = async (): Promise<void> => {
  if (!userId.value) return;

  const userReactionsKey = `user_reactions_${props.slug}_${userId.value}`;
  const stored = localStorage.getItem(userReactionsKey);
  userReactions.value = stored ? JSON.parse(stored) : {};
};

const react = async (type: ReactionType): Promise<void> => {
  if (!userId.value) {
    error.value = "Se requiere ID de usuario para reaccionar";
    return;
  }

  if (processingType.value) return;

  processingType.value = type;
  const previousReactions = { ...userReactions.value };

  try {
    const wasActive = userReactions.value[type];
    const currentCount = reactions.value[type]?.count || 0;

    if (wasActive) {
      delete userReactions.value[type];
      reactions.value[type] = { count: Math.max(0, currentCount - 1) };
      totalReactions.value = Math.max(0, totalReactions.value - 1);
    } else {
      Object.keys(userReactions.value).forEach(otherType => {
        if (reactions.value[otherType]) {
          reactions.value[otherType].count = Math.max(0, reactions.value[otherType].count - 1);
          totalReactions.value = Math.max(0, totalReactions.value - 1);
        }
      });
      userReactions.value = { [type]: true };
      reactions.value[type] = { count: currentCount + 1 };
      totalReactions.value += 1;
    }

    const userReactionsKey = `user_reactions_${props.slug}_${userId.value}`;
    localStorage.setItem(userReactionsKey, JSON.stringify(userReactions.value));

    const response = await fetch(
      `${props.apiUrl}/posts/${props.slug}/react/${type}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userId.value }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Error desconocido");
    }

    if (data.count !== undefined) {
      reactions.value[type] = { count: data.count };
    }
    
    if (data.totalReactions !== undefined) {
      totalReactions.value = data.totalReactions;
    }

    if (data.hasReacted !== undefined) {
      if (data.hasReacted) {
        userReactions.value[type] = true;
      } else {
        delete userReactions.value[type];
      }
    }

    localStorage.setItem(userReactionsKey, JSON.stringify(userReactions.value));

  } catch (err: any) {
    console.error("Error reacting:", err);
    
    userReactions.value = previousReactions;
    error.value = err.message || "Error al procesar reacción";
    
    await loadReactions();
    
    setTimeout(() => {
      error.value = null;
    }, 5000);
  } finally {
    processingType.value = null;
  }
};

onMounted(() => {
  getOrCreateUserId();
  init();
});
</script>


<template>
  <div :class="['reactions-widget', theme, size]">
    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner" />
      <span>Cargando reacciones...</span>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-state">
      <span>{{ error }}</span>
      <button @click="init()" class="retry-btn">Reintentar</button>
    </div>

    <!-- Reactions -->
    <div v-else class="reactions-container">
      <!-- Total reactions counter -->
      <div v-if="showTotal && totalReactions > 0" class="total-counter">
        <span class="total-icon">✨</span>
        <span class="total-text"
          >{{ totalReactions }}
          {{ totalReactions === 1 ? "reacción" : "reacciones" }}</span
        >
      </div>

      <!-- Reaction buttons -->
      <div class="reactions-grid">
        <button
          v-for="(config, type) in REACTIONS_CONFIG"
          :key="type"
          class="reaction-btn"
          :class="{
            active: userReactions[type as ReactionType],
            processing: processingType === type,
          }"
          @click="react(type as ReactionType)"
          :disabled="processingType !== null"
          :title="config.label"
        >
          <span class="reaction-emoji">{{ config.emoji }}</span>
          <span
            v-if="reactions[type as ReactionType] && reactions[type as ReactionType]?.count > 0"
            class="reaction-count"
          >
            {{ reactions[type as ReactionType]?.count || 0 }}
          </span>
          <span v-if="showLabels" class="reaction-label">
            {{ config.label }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>


<style scoped>
.reactions-widget {
  font-family: system-ui, -apple-system, sans-serif;
  border-radius: 12px;
  padding: 1rem;
  background: var(--bg-color);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-color);
  transition: all 0.3s ease;
}

/* Themes */
.reactions-widget.light {
  --bg-color: #ffffff;
  --border-color: #e5e7eb;
  --text-color: #374151;
  --text-muted: #6b7280;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --btn-bg: #f9fafb;
  --btn-hover: #f3f4f6;
  --btn-active: #dbeafe;
  --btn-active-border: #3b82f6;
}

.reactions-widget.dark {
  --bg-color: #1f2937;
  --border-color: #374151;
  --text-color: #f9fafb;
  --text-muted: #9ca3af;
  --shadow-color: rgba(0, 0, 0, 0.3);
  --btn-bg: #374151;
  --btn-hover: #4b5563;
  --btn-active: #1e40af;
  --btn-active-border: #60a5fa;
}

/* Sizes */
.reactions-widget.sm {
  --emoji-size: 1.2rem;
  --font-size: 0.75rem;
  --spacing: 0.5rem;
  --btn-padding: 0.5rem;
}

.reactions-widget.md {
  --emoji-size: 1.5rem;
  --font-size: 0.875rem;
  --spacing: 0.75rem;
  --btn-padding: 0.75rem;
}

.reactions-widget.lg {
  --emoji-size: 2rem;
  --font-size: 1rem;
  --spacing: 1rem;
  --btn-padding: 1rem;
}

/* Loading state */
.loading-state {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  color: var(--text-muted);
  font-size: var(--font-size);
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--border-color);
  border-top: 2px solid var(--text-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Error state */
.error-state {
  display: flex;
  align-items: center;
  gap: var(--spacing);
  color: #ef4444;
  font-size: var(--font-size);
}

.retry-btn {
  padding: 0.25rem 0.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.retry-btn:hover {
  background: #dc2626;
}

/* Total counter */
.total-counter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: var(--spacing);
  color: var(--text-muted);
  font-size: var(--font-size);
  font-weight: 500;
}

.total-icon {
  font-size: var(--emoji-size);
}

/* Reactions grid */
.reactions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing);
  margin-bottom: var(--spacing);
}

.reaction-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: var(--btn-padding);
  background: var(--btn-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: var(--font-size);
  color: var(--text-color);
  position: relative;
  overflow: hidden;
}

.reaction-btn:hover:not(:disabled) {
  background: var(--btn-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--shadow-color);
}

.reaction-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reaction-btn.active {
  background: var(--btn-active);
  border-color: var(--btn-active-border);
  transform: scale(1.02);
}

.reaction-btn.processing {
  pointer-events: none;
}

.reaction-btn.processing::after {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

.reaction-emoji {
  font-size: var(--emoji-size);
  line-height: 1;
}

.reaction-count {
  background: var(--btn-active-border);
  color: white;
  padding: 0.1rem 0.3rem;
  border-radius: 10px;
  font-size: calc(var(--font-size) * 0.8);
  font-weight: 600;
  min-width: 1.2rem;
  text-align: center;
}

.reaction-label {
  font-weight: 500;
  white-space: nowrap;
}

/* Responsive */
@media (max-width: 640px) {
  .reactions-grid {
    justify-content: center;
  }

  .reaction-label {
    display: none;
  }
}
</style>
