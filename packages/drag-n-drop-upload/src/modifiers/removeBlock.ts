import { Modifier, EditorState, SelectionState } from 'draft-js';

export default function removeBlock(
  editorState: EditorState,
  blockKey: string
): EditorState {
  const content = editorState.getCurrentContent();
  const block = content.getBlockForKey(blockKey);

  const targetRange = SelectionState.createEmpty(blockKey).merge({
    focusOffset: block.getLength(),
  });

  const withoutBlock = Modifier.removeRange(content, targetRange, 'backward');
  const resetBlock = Modifier.setBlockType(
    withoutBlock,
    withoutBlock.getSelectionAfter(),
    'unstyled'
  );

  const newState = EditorState.push(editorState, resetBlock, 'remove-range');
  const newStateWithoutBlock = EditorState.forceSelection(
    newState,
    resetBlock.getSelectionAfter()
  );

  return newStateWithoutBlock;
}
