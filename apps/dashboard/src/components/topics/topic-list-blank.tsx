import { Button } from '@/components/primitives/button';
import { LinkButton } from '@/components/primitives/button-link';
import { RiAddCircleLine, RiBookMarkedLine } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import { EmptyTopicsIllustration } from './empty-topics-illustration';
import { useTopicsNavigate } from './hooks/use-topics-navigate';

export const TopicListBlank = () => {
  const { navigateToCreateTopicPage } = useTopicsNavigate();

  return (
    <div className="mt-[100px] flex h-full w-full flex-col items-center justify-center gap-6">
      <EmptyTopicsIllustration />
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-text-sub text-label-md block font-medium">No topics created yet</span>
        <p className="text-text-soft text-paragraph-sm max-w-[60ch]">
          Topics allow you to organize your subscribers and send notifications to groups of subscribers at once. Create
          topics and add subscribers to them via the UI or API.
        </p>
      </div>

      <div className="flex items-center justify-center gap-6">
        <Link to="https://docs.novu.co/platform/concepts/topics" target="_blank">
          <LinkButton variant="gray" trailingIcon={RiBookMarkedLine}>
            View Docs
          </LinkButton>
        </Link>

        <Button
          variant="primary"
          mode="gradient"
          leadingIcon={RiAddCircleLine}
          onClick={navigateToCreateTopicPage}
          className="gap-2"
        >
          Create topic
        </Button>
      </div>
    </div>
  );
};
