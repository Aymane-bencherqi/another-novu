/* eslint-disable import/extensions */
import { dark } from '@novu/nextjs/themes';
import { useState, useEffect } from 'react';
import { Inbox } from '@novu/nextjs';
import Title from '@/components/Title';
import { novuConfig } from '@/utils/config';

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark');
  }, [isDark]);

  return (
    <>
      <Title title="Default Inbox" />
      <button onClick={() => setIsDark((prev) => !prev)}>Toggle Dark Theme</button>
      <Inbox
        {...novuConfig}
        localization={{
          'notifications.newNotifications': ({ notificationCount }) => `${notificationCount} new notifications`,
          dynamic: {
            '6697c185607852e9104daf33': 'My workflow in other language', // key is workflow id
          },
        }}
        appearance={{
          baseTheme: isDark ? dark : undefined,
        }}
        tabs={[
          {
            label: 'Notifications',
          },
          {
            label: 'More tabs1',
          },
          {
            label: 'More tabs2',
          },
          {
            label: 'More tabs3',
          },
          {
            label: 'More tabs4',
          },
          {
            label: 'More tabs5',
          },
        ]}
        placement="left-start"
        placementOffset={25}
      />
    </>
  );
}
