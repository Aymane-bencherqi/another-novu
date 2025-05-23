import { Skeleton } from '@mantine/core';
import { Title, type WithLoadingSkeleton, type LocalizedMessage } from '@novu/novui';
import { css, cx } from '@novu/novui/css';
import { hstack } from '@novu/novui/patterns';
import { token } from '@novu/novui/tokens';
import { FC, MouseEventHandler } from 'react';
import { truncatedFlexTextCss } from '../../../utils/shared.styles';

interface IStepNodeProps {
  icon: React.ReactNode;
  title: LocalizedMessage;
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

export const StepNode: WithLoadingSkeleton<FC<IStepNodeProps>> = ({ icon, title, onClick }) => {
  return (
    <button
      className={cx(
        css({
          w: '250',
          cursor: 'pointer',
          '&:not(:last-of-type):after': {
            content: '""',
            position: 'relative',
            borderLeft: 'dashed',
            borderColor: '{colors.workflow.node.connector}',
            height: '{spacing.workflow.nodes.gap}',
            display: 'block',
            left: '50%',
          },
        })
      )}
      onClick={onClick}
    >
      <span
        className={hstack({
          ...truncatedFlexTextCss,
          gap: '100',
          p: '150',
          shadow: 'medium',
          bg: '{colors.workflow.node.surface}',
          borderRadius: '150',
          _hover: {
            opacity: 'hover',
          },
        })}
      >
        {icon}
        <Title variant="subsection">{title}</Title>
      </span>
    </button>
  );
};

StepNode.LoadingDisplay = StepNodeSkeleton;

function StepNodeSkeleton() {
  return (
    <div
      className={cx(
        css({
          w: '250',
          cursor: 'pointer',
          '&:not(:last-of-type):after': {
            content: '""',
            position: 'relative',
            borderLeft: 'dashed',
            borderColor: '{colors.workflow.node.connector}',
            height: '{spacing.workflow.nodes.gap}',
            display: 'block',
            left: '50%',
          },
        })
      )}
    >
      <span
        className={hstack({
          gap: '100',
          p: '150',
          shadow: 'medium',
          bg: '{colors.workflow.node.surface}',
          borderRadius: '150',
          _hover: {
            opacity: 'hover',
          },
        })}
      >
        <Skeleton height={token('lineHeights.200')} width={token('lineHeights.200')} radius={8} />
        <Skeleton height={token('lineHeights.100')} width={'70%'} radius="md" />
      </span>
    </div>
  );
}
