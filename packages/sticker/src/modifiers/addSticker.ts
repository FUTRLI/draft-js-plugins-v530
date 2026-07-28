/**
 * Adds a sticker to an editor state
 */

import {
  BlockMapBuilder,
  CharacterMetadata,
  ContentBlock,
  EditorState,
  genKey,
  Modifier,
} from 'draft-js';
import { List, Repeat } from 'immutable';

// Draft.js ContentBlock remains constructible at runtime, but its legacy type
// definition loses the constructor signature when paired with Immutable 4.
const ContentBlockRecord = ContentBlock as unknown as new (
  properties: Record<string, unknown>
) => ContentBlock;

export default (editorState: EditorState, stickerId: string): EditorState => {
  const currentContentState = editorState.getCurrentContent();
  const currentSelectionState = editorState.getSelection();

  // in case text is selected it is removed and then the sticker is appended
  const afterRemovalContentState = Modifier.removeRange(
    currentContentState,
    currentSelectionState,
    'backward'
  );

  // deciding on the postion to split the text
  const targetSelection = afterRemovalContentState.getSelectionAfter();
  const blockKeyForTarget = targetSelection.getFocusKey();
  const block = currentContentState.getBlockForKey(blockKeyForTarget);
  let insertionTargetSelection;
  let insertionTargetBlock;

  // In case there are no characters or entity or the selection is at the start it
  // is safe to insert the sticker in the current block.
  // Otherwise a new block is created (the sticker is always its own block)
  const isEmptyBlock = block.getLength() === 0 && block.getEntityAt(0) === null;
  const selectedFromStart = currentSelectionState.getStartOffset() === 0;
  if (isEmptyBlock || selectedFromStart) {
    insertionTargetSelection = targetSelection;
    insertionTargetBlock = afterRemovalContentState;
  } else {
    // the only way to insert a new seems to be by splitting an existing in to two
    insertionTargetBlock = Modifier.splitBlock(
      afterRemovalContentState,
      targetSelection
    );

    // the position to insert our blocks
    insertionTargetSelection = insertionTargetBlock.getSelectionAfter();
  }

  // TODO not sure why we need it …
  const newContentStateAfterSplit = Modifier.setBlockType(
    insertionTargetBlock,
    insertionTargetSelection,
    'sticker'
  );

  // creating a new ContentBlock including the entity with data
  const contentStateWithEntity = newContentStateAfterSplit.createEntity(
    'sticker',
    'IMMUTABLE',
    { id: stickerId }
  );
  const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
  const charDataOfSticker = CharacterMetadata.create({ entity: entityKey });

  const fragmentArray = [
    new ContentBlockRecord({
      key: genKey(),
      type: 'sticker',
      text: ' ',
      characterList: List(Repeat(charDataOfSticker, 1)), // eslint-disable-line new-cap
    }),

    // new contentblock so we can continue wrting right away after inserting the sticker
    new ContentBlockRecord({
      key: genKey(),
      type: 'unstyled',
      text: '',
      characterList: List(), // eslint-disable-line new-cap
    }),
  ];

  // create fragment containing the two content blocks
  const fragment = BlockMapBuilder.createFromArray(fragmentArray);

  // replace the contentblock we reserved for our insert
  const contentStateWithSticker = Modifier.replaceWithFragment(
    newContentStateAfterSplit,
    insertionTargetSelection,
    fragment
  );

  // update editor state with our new state including the sticker
  const newState = EditorState.push(
    editorState,
    contentStateWithSticker,
    'insert-fragment'
  );
  return EditorState.forceSelection(
    newState,
    contentStateWithSticker.getSelectionAfter()
  );
};
