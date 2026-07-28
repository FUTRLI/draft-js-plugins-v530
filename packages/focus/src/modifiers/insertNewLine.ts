import { List, merge } from 'immutable';
import {
  ContentBlock,
  EditorState,
  BlockMapBuilder,
  genKey as generateRandomKey,
  ContentState,
  SelectionState,
} from 'draft-js';

// Draft.js ContentBlock remains constructible at runtime, but its legacy type
// definition loses the constructor signature when paired with Immutable 4.
const ContentBlockRecord = ContentBlock as unknown as new (
  properties: Record<string, unknown>
) => ContentBlock;

const insertBlockAfterSelection = (
  contentState: ContentState,
  selectionState: SelectionState,
  newBlock: ContentBlock
): ContentState => {
  const targetKey = selectionState.getStartKey();
  const array: ContentBlock[] = [];
  contentState.getBlockMap().forEach((block, blockKey) => {
    array.push(block!);
    if (blockKey !== targetKey) return;
    array.push(newBlock);
  });
  return merge(contentState, {
    blockMap: BlockMapBuilder.createFromArray(array),
    selectionBefore: selectionState,
    selectionAfter: selectionState.merge({
      anchorKey: newBlock.getKey(),
      anchorOffset: newBlock.getLength(),
      focusKey: newBlock.getKey(),
      focusOffset: newBlock.getLength(),
      isBackward: false,
    }),
  });
};

export default function insertNewLine(editorState: EditorState): EditorState {
  const contentState = editorState.getCurrentContent();
  const selectionState = editorState.getSelection();
  const newLineBlock = new ContentBlockRecord({
    key: generateRandomKey(),
    type: 'unstyled',
    text: '',
    characterList: List(),
  });
  const withNewLine = insertBlockAfterSelection(
    contentState,
    selectionState,
    newLineBlock
  );
  const newContent = merge(withNewLine, {
    selectionAfter: withNewLine.getSelectionAfter().merge({ hasFocus: true }),
  });
  return EditorState.push(editorState, newContent, 'insert-fragment');
}
