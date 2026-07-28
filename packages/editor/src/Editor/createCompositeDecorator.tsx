/**
 * Creates a composite decorator based on the provided plugins
 */

import { CompositeDecorator, DraftDecorator, EditorState } from 'draft-js';
import { List } from 'immutable';
import React, { ReactElement } from 'react';

export default function createCompositeDecorator(
  decorators: List<DraftDecorator>,
  getEditorState: () => EditorState,
  setEditorState: (state: EditorState) => void
): CompositeDecorator {
  const convertedDecorators = List<DraftDecorator>(decorators)
    .map((decorator): DraftDecorator => {
      const Component = decorator.component;
      const DecoratedComponent = (
        props: Record<string, unknown>
      ): ReactElement => (
        <Component
          {...props}
          getEditorState={getEditorState}
          setEditorState={setEditorState}
        />
      );
      return {
        ...decorator,
        component: DecoratedComponent,
      };
    })
    .toArray();

  return new CompositeDecorator(convertedDecorators);
}
