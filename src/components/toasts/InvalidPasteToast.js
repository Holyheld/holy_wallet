import React from 'react';
import Toast from './Toast';
import { useInvalidPaste } from '@holyheld-com/hooks';

export default function InvalidPasteToast(props) {
  const { isInvalidPaste } = useInvalidPaste();

  return (
    <Toast
      isVisible={isInvalidPaste}
      text="􀉾 You can't paste that here"
      {...props}
    />
  );
}
