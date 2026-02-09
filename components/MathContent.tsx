
import React, { useEffect, useRef, useCallback } from 'react';

interface MathContentProps {
  html: string;
  tagName?: string;
  className?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  readOnly?: boolean;
}

export const MathContent: React.FC<MathContentProps> = ({ html, tagName = 'div', className, onChange, placeholder, readOnly = false }) => {
  const contentEditableRef = useRef<HTMLElement>(null);
  const isLocked = useRef(false); // Lock to prevent cursor jumping during typing

  // Sync DOM with prop changes from external sources (e.g. undo/redo or initial load)
  useEffect(() => {
    const el = contentEditableRef.current;
    if (el) {
      // Only update if the content is truly different and we aren't currently typing (locked)
      if (el.innerHTML !== html && !isLocked.current) {
        el.innerHTML = html;
        // Trigger MathJax re-render on external update
        const w = window as any;
        if (w.MathJax) {
           w.MathJax.typesetPromise([el]).catch((err: any) => console.debug(err));
        }
      }
    }
  }, [html]);

  const handleInput = useCallback((e: React.FormEvent<HTMLElement>) => {
    if (onChange && !readOnly) {
      isLocked.current = true; // Lock external updates while typing
      onChange(e.currentTarget.innerHTML);
      
      // Unlock after a short delay to allow external updates (like save confirmation) eventually
      // but prevent immediate React render loop from resetting cursor
      setTimeout(() => { isLocked.current = false; }, 50);
    }
  }, [onChange, readOnly]);

  const handleBlur = useCallback(() => {
    isLocked.current = false;
    // Trigger MathJax only on blur to avoid heavy rendering while typing
    const w = window as any;
    if (w.MathJax && contentEditableRef.current) {
      w.MathJax.typesetPromise([contentEditableRef.current]).catch((err: any) => console.debug(err));
    }
  }, []);

  const Tag = tagName as React.ElementType;

  return (
    <Tag
      ref={contentEditableRef}
      className={`math-content outline-none min-h-[1.5em] ${!readOnly ? 'empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400/50 cursor-text' : ''} ${className}`}
      contentEditable={!readOnly}
      onInput={handleInput}
      onBlur={handleBlur}
      data-placeholder={placeholder}
      spellCheck={false}
      suppressContentEditableWarning={true}
    />
  );
};
