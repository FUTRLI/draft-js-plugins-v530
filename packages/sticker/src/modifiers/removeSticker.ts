/**
 * Removes a sticker from the editor state
 */

import { EditorState, Modifier, SelectionState } from 'draft-js';

export default (editorState: EditorState, blockKey: string): EditorState => {
  let content = editorState.getCurrentContent();
  const newSelection = SelectionState.createEmpty(blockKey);

  const afterKey = content.getKeyAfter(blockKey);
  const afterBlock = content.getBlockForKey(afterKey);
  let targetRange;

  // Only if the following block the last with no text then the whole block
  // should be removed. Otherwise the block should be reduced to an unstyled block
  // without any characters.
  if (
    afterBlock &&
    afterBlock.getType() === 'unstyled' &&
    afterBlock.getLength() === 0 &&
    afterBlock === content.getBlockMap().last()
  ) {
    targetRange = SelectionState.createEmpty(blockKey).merge({
      focusKey: afterKey,
    });
  } else {
    targetRange = SelectionState.createEmpty(blockKey).merge({
      focusOffset: 1,
    });
  }

  // change the blocktype and remove the characterList entry with the sticker
  content = Modifier.setBlockType(content, targetRange, 'unstyled');
  content = Modifier.removeRange(content, targetRange, 'backward');

  // force to new selection
  const newState = EditorState.push(editorState, content, 'remove-range');
  return EditorState.forceSelection(newState, newSelection);
};
