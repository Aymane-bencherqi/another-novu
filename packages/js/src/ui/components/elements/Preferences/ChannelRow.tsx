import { JSX } from 'solid-js';
import { ChannelPreference, ChannelType } from '../../../../types';
import { useStyle } from '../../../helpers';
import {
  Chat as DefaultChat,
  Email as DefaultEmail,
  InApp as DefaultInApp,
  Push as DefaultPush,
  Sms as DefaultSms,
} from '../../../icons';
import { AppearanceKey, IconKey } from '../../../types';
import { Switch, SwitchState } from '../../primitives/Switch';
import { IconRendererWrapper } from '../../shared/IconRendererWrapper';

type ChannelRowProps = {
  channel: { channel: ChannelType; state: SwitchState };
  channelIcon?: () => JSX.Element;
  workflowId?: string;
  onChange: (channels: ChannelPreference) => void;
};

export const ChannelRow = (props: ChannelRowProps) => {
  const style = useStyle();

  const updatePreference = async (enabled: boolean) => {
    props.onChange({ [props.channel.channel]: enabled });
  };

  const onChange = async (checked: boolean) => {
    await updatePreference(checked);
  };

  const state = () => props.channel.state;
  const channel = () => props.channel.channel;

  return (
    <div
      class={style(
        'channelContainer',
        'nt-flex nt-justify-between nt-items-center nt-gap-2 data-[disabled=true]:nt-text-foreground-alpha-600'
      )}
    >
      <div class={style('channelLabelContainer', 'nt-flex nt-items-center nt-gap-2 nt-text-foreground')}>
        <div
          class={style(
            'channelIconContainer',
            'nt-p-1 nt-rounded-md nt-bg-neutral-alpha-25 nt-text-foreground-alpha-300'
          )}
        >
          <ChannelIcon appearanceKey="channel__icon" channel={channel()} class="nt-size-3" />
        </div>
        <span class={style('channelLabel', 'nt-text-sm nt-font-semibold')}>{getLabel(channel())}</span>
      </div>
      <div class={style('channelSwitchContainer', 'nt-flex nt-items-center')}>
        <Switch state={state()} onChange={(newState) => onChange(newState === 'enabled')} />
      </div>
    </div>
  );
};

type ChannelIconProps = JSX.IntrinsicElements['svg'] & {
  appearanceKey: AppearanceKey;
  channel: ChannelType;
};
const ChannelIcon = (props: ChannelIconProps) => {
  const style = useStyle();

  const iconMap: Record<ChannelType, { key: IconKey; component: JSX.Element }> = {
    [ChannelType.IN_APP]: {
      key: 'inApp',
      component: (
        <DefaultInApp
          class={style(props.appearanceKey, props.class, {
            iconKey: 'inApp',
          })}
        />
      ),
    },
    [ChannelType.EMAIL]: {
      key: 'email',
      component: <DefaultEmail class={style(props.appearanceKey, props.class, { iconKey: 'email' })} />,
    },
    [ChannelType.PUSH]: {
      key: 'push',
      component: <DefaultPush class={style(props.appearanceKey, props.class, { iconKey: 'push' })} />,
    },
    [ChannelType.SMS]: {
      key: 'sms',
      component: <DefaultSms class={style(props.appearanceKey, props.class, { iconKey: 'sms' })} />,
    },
    [ChannelType.CHAT]: {
      key: 'chat',
      component: <DefaultChat class={style(props.appearanceKey, props.class, { iconKey: 'chat' })} />,
    },
  };

  const iconData = iconMap[props.channel];

  if (!iconData) {
    return null;
  }

  return (
    <IconRendererWrapper
      iconKey={iconData.key}
      fallback={iconData.component}
      class={style(props.appearanceKey, props.class, {
        iconKey: iconData.key,
      })}
    />
  );
};

export const getLabel = (channel: ChannelType) => {
  switch (channel) {
    case ChannelType.IN_APP:
      return 'In-App';
    case ChannelType.EMAIL:
      return 'Email';
    case ChannelType.PUSH:
      return 'Push';
    case ChannelType.SMS:
      return 'SMS';
    case ChannelType.CHAT:
      return 'Chat';
    default:
      return '';
  }
};
