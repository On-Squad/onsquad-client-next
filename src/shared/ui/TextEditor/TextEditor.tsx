'use client';

import React, { useEffect, useState } from 'react';

import { EditorState } from 'draft-js';
// useEffect 추가
import dynamic from 'next/dynamic';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

const TextEditor = () => {
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onEditorStateChange = (newEditorState: EditorState) => {
    if (isMounted) {
      setEditorState(newEditorState);
    }
  };

  return (
    <Editor
      editorState={editorState}
      onEditorStateChange={onEditorStateChange}
      wrapperClassName="wrapper-class"
      editorClassName="editor-class"
      toolbarClassName="toolbar-class"
    />
  );
};

export default TextEditor;
