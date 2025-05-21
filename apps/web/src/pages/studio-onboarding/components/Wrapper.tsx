import { css, cx } from '@novu/novui/css';
import { ReactNode, useEffect } from 'react';

export const Wrapper = ({ children, className }: { children: ReactNode; className?: string }) => {
  useEffect(() => {
    document.body.setAttribute('style', 'overflow: auto');
  }, []);

  return (
    <div
      className={cx(
        css({
          width: 'full',
          minHeight: 'full',
          colorPalette: 'mode.cloud',
          paddingBottom: '400',
          bg: 'surface.panel',
        }),
        className
      )}
    >
      {children}
    </div>
  );
};
