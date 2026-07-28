import { ContentState } from 'draft-js';
import { Seq } from 'immutable';

export default (
  contentState: ContentState,
  startKey: string,
  endKey: string
): Seq.Indexed<string> => {
  const blockMapKeys = contentState.getBlockMap().keySeq();
  return blockMapKeys
    .skipUntil((key) => key === startKey)
    .takeUntil((key) => key === endKey)
    .concat([endKey]);
};
