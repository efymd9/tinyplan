// ── AI Adapter Interface & Stub ─────────────────────────────────────────────

import type { TagProfile } from '@/lib/quiz/tags';

// ── Interface ───────────────────────────────────────────────────────────────

export interface AIAdapter {
  /**
   * Reword an activity's title, steps, and parent script to match a
   * specific tone and age context.
   */
  rewordActivity(
    activity: {
      title: string;
      steps: string[];
      parent_script: string;
    },
    context: {
      tone: string;
      child_age: string;
    },
  ): Promise<{
    title: string;
    steps: string[];
    parent_script: string;
  }>;

  /**
   * Generate an insight message based on the user's profile and their
   * progress so far (completed days, feedback).
   */
  generateInsight(
    profile: TagProfile,
    weekData: {
      completedDays: number;
      feedback: string[];
    },
  ): Promise<string>;
}

// ── Stub Implementation ─────────────────────────────────────────────────────

export class StubAIAdapter implements AIAdapter {
  async rewordActivity(
    activity: {
      title: string;
      steps: string[];
      parent_script: string;
    },
  ): Promise<{
    title: string;
    steps: string[];
    parent_script: string;
  }> {
    // Return input unchanged — no AI processing in stub mode
    return {
      title: activity.title,
      steps: [...activity.steps],
      parent_script: activity.parent_script,
    };
  }

  async generateInsight(
    _profile: TagProfile,
    weekData: {
      completedDays: number;
      feedback: string[];
    },
  ): Promise<string> {
    // Return a generic insight based on progress
    if (weekData.completedDays === 0) {
      return 'You\'re just getting started — every small moment counts.';
    }
    if (weekData.completedDays <= 3) {
      return `You've completed ${weekData.completedDays} days so far. Keep going — consistency builds confidence.`;
    }
    if (weekData.completedDays <= 6) {
      return `Great progress — ${weekData.completedDays} days done! You're building a real routine.`;
    }
    return 'Amazing — you completed the full week! Your child is benefiting from your effort.';
  }
}

// ── Factory ─────────────────────────────────────────────────────────────────

export function getAIAdapter(): AIAdapter {
  const provider = process.env.AI_PROVIDER;

  switch (provider) {
    // Future implementations:
    // case 'openai':
    //   return new OpenAIAdapter();
    // case 'anthropic':
    //   return new AnthropicAdapter();
    default:
      return new StubAIAdapter();
  }
}
