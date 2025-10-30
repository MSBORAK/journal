import { useLanguage } from '../contexts/LanguageContext';

export type GuidedQuestionId =
  | 'happiness'
  | 'lesson'
  | 'communication'
  | 'challenge'
  | 'gratitude'
  | 'accomplishment'
  | 'energy'
  | 'growth'
  | 'emotion'
  | 'tomorrow';

export const QUESTION_ORDER: GuidedQuestionId[] = [
  'happiness',
  'lesson',
  'communication',
  'challenge',
  'gratitude',
  'accomplishment',
  'energy',
  'growth',
  'emotion',
  'tomorrow',
];

export interface GuidedQuestion {
  id: GuidedQuestionId;
  title: string;
  placeholder: string;
  emoji: string;
}

// Hook to get localized guided questions
export function useGuidedQuestions(): GuidedQuestion[] {
  const { t } = useLanguage();
  const emojis: Record<GuidedQuestionId, string> = {
    happiness: '✨',
    lesson: '💎',
    communication: '💝',
    challenge: '💪',
    gratitude: '🌟',
    accomplishment: '🎉',
    energy: '⚡',
    growth: '🌱',
    emotion: '🎨',
    tomorrow: '🚀',
  };

  return QUESTION_ORDER.map((id) => ({
    id,
    title: `${emojis[id]} ${t(`diary.guidedQuestions.${id}.title`)}`,
    placeholder: t(`diary.guidedQuestions.${id}.placeholder`),
    emoji: emojis[id],
  }));
}


