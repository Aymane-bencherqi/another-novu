import { onCleanup, onMount } from 'solid-js';
import type { EventHandler, Events, SocketEventNames } from '../../event-emitter';
import { useNovu } from '../context';
import { requestLock } from './browser';
import { useBrowserTabsChannel } from './useBrowserTabsChannel';

export const useWebSocketEvent = <E extends SocketEventNames>({
  event: webSocketEvent,
  eventHandler: onMessage,
}: {
  event: E;
  eventHandler: (args: Events[E]) => void;
}) => {
  const novu = useNovu();
  const channelName = `nv_ws_connection:a=${novu.applicationIdentifier}:s=${novu.subscriberId}:e=${webSocketEvent}`;

  const { postMessage } = useBrowserTabsChannel({ channelName, onMessage });

  const updateReadCount: EventHandler<Events[E]> = (data) => {
    onMessage(data);
    postMessage(data);
  };

  onMount(() => {
    let cleanup: () => void;
    const resolveLock = requestLock(channelName, () => {
      cleanup = novu.on(webSocketEvent, updateReadCount);
    });

    onCleanup(() => {
      if (cleanup) {
        cleanup();
      }
      resolveLock();
    });
  });
};
