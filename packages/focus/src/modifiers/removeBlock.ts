import { Modifier, EditorState, SelectionState } from 'draft-js';

/* NOT USED at the moment, but might be valuable if we want to fix atomic block behaviour */

export default function removeBlock(
  editorState: EditorState,
  blockKey: string
): EditorState {
  let content = editorState.getCurrentContent();

  const beforeKey = content.getKeyBefore(blockKey);
  const beforeBlock = content.getBlockForKey(beforeKey);

  // Note: if the focused block is the first block then it is reduced to an
  // unstyled block with no character
  if (beforeBlock === undefined) {
    const targetRange = SelectionState.createEmpty(blockKey).merge({
      focusOffset: 1,
    });
    // change the blocktype and remove the characterList entry with the sticker
    content = Modifier.removeRange(content, targetRange, 'backward');
    content = Modifier.setBlockType(content, targetRange, 'unstyled');
    const newState = EditorState.push(editorState, content, 'remove-range');

    // force to new selection
    const newSelection = SelectionState.createEmpty(blockKey);
    return EditorState.forceSelection(newState, newSelection);
  }

  const targetRange = SelectionState.createEmpty(beforeKey).merge({
    anchorOffset: beforeBlock.getLength(),
    focusKey: blockKey,
    focusOffset: 1,
  });

  content = Modifier.removeRange(content, targetRange, 'backward');
  const newState = EditorState.push(editorState, content, 'remove-range');

  // force to new selection
  const newSelection = SelectionState.createEmpty(beforeKey).merge({
    anchorOffset: beforeBlock.getLength(),
    focusOffset: beforeBlock.getLength(),
  });
  return EditorState.forceSelection(newState, newSelection);
}
