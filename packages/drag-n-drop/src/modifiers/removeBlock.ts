import { ContentState, Modifier, SelectionState } from 'draft-js';

export default function removeBlock(
  contentState: ContentState,
  blockKey: string
): ContentState {
  const afterKey = contentState.getKeyAfter(blockKey);
  const afterBlock = contentState.getBlockForKey(afterKey);
  let targetRange;

  // Only if the following block the last with no text then the whole block
  // should be removed. Otherwise the block should be reduced to an unstyled block
  // without any characters.
  if (
    afterBlock &&
    afterBlock.getType() === 'unstyled' &&
    afterBlock.getLength() === 0 &&
    afterBlock === contentState.getBlockMap().last()
  ) {
    targetRange = SelectionState.createEmpty(blockKey).merge({
      focusKey: afterKey,
    });
  } else {
    targetRange = SelectionState.createEmpty(blockKey).merge({
      focusOffset: 1,
    });
  }

  // change the blocktype and remove the characterList entry with the block
  const newContentState = Modifier.setBlockType(
    contentState,
    targetRange,
    'unstyled'
  );
  return Modifier.removeRange(newContentState, targetRange, 'backward');
}
