import type { ComponentProps } from 'react';

export interface Translation {
  id: string;
  mandarin: string;
  translation: string;
  pinyin?: string;
  correctCount?: number;
  incorrectCount?: number;
}

/**
 * Handler type for a <form> onSubmit.
 *
 * @types/react 19 deprecates both FormEvent and FormEventHandler ("FormEvent
 * doesn't actually exist"), yet they remain the types the JSX onSubmit prop is
 * declared with. Deriving the handler from the prop gets the same type without
 * naming a deprecated alias.
 */
export type FormSubmitHandler = NonNullable<ComponentProps<'form'>['onSubmit']>;
