import { RiQuestionFill } from 'react-icons/ri';
import { HeaderButton } from './header-button';
import { usePlainChat } from '@/hooks/use-plain-chat';
import { useBootIntercom } from '@/hooks/use-boot-intercom';
import { IS_SELF_HOSTED } from '../../config';
import { openInNewTab } from '../../utils/url';

export const CustomerSupportButton = () => {
  const { showPlainLiveChat } = usePlainChat();
  useBootIntercom();

  function handleClick() {
    if (IS_SELF_HOSTED) {
      openInNewTab('https://go.novu.co/hosted-upgrade?utm_campaign=help-icon');
    } else {
      showPlainLiveChat();
    }
  }

  return (
    <button tabIndex={-1} className="flex items-center justify-center" onClick={handleClick}>
      <HeaderButton label="Help">
        <RiQuestionFill className="text-foreground-600 size-4" />
      </HeaderButton>
    </button>
  );
};
