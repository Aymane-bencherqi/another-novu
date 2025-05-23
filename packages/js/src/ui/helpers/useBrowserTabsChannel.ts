import { createSignal, onCleanup, onMount } from 'solid-js';

export const useBrowserTabsChannel = <T = unknown>({
  channelName,
  onMessage,
}: {
  channelName: string;
  onMessage: (args: T) => void;
}) => {
  const [tabsChannel] = createSignal(new BroadcastChannel(channelName));

  const postMessage = (args: T) => {
    const channel = tabsChannel();
    channel.postMessage(args);
  };

  onMount(() => {
    const listener = (event: MessageEvent<T>) => {
      onMessage(event.data);
    };

    const channel = tabsChannel();
    channel.addEventListener('message', listener);

    onCleanup(() => {
      channel.removeEventListener('message', listener);
    });
  });

  return { postMessage };
};
