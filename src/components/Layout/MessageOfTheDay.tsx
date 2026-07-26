import Modal from '@app/components/Common/Modal';
import { Transition } from '@headlessui/react';
import { MegaphoneIcon } from '@heroicons/react/24/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';

export interface MotdSettings {
  motdEnabled: boolean;
  motdTitle: string;
  motdMessage: string;
  motdUpdatedAt: number;
}

const MessageOfTheDay = () => {
  const router = useRouter();
  const { data } = useSWR<MotdSettings>('/api/v1/suggestion/motd');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!data?.motdEnabled || !data.motdMessage || !data.motdUpdatedAt) return;
    const key = `seerr-motd-${data.motdUpdatedAt}`;
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, 'shown');
      setShow(true);
    }
  }, [data]);

  return (
    <Transition show={show}>
      <Modal
        title={data?.motdTitle || 'Welcome!'}
        okText="Got it!"
        onOk={() => setShow(false)}
        secondaryText="Share an Idea"
        secondaryButtonType="primary"
        onSecondary={() => {
          setShow(false);
          router.push('/suggestions');
        }}
        backgroundClickable={false}
        dialogClass="border-2 border-purple-500 shadow-2xl shadow-purple-500/30"
      >
        <div className="flex gap-4">
          <div className="rounded-full bg-purple-600/30 p-3">
            <MegaphoneIcon className="h-8 w-8 text-purple-300" />
          </div>
          <p className="whitespace-pre-wrap text-base leading-7 text-gray-100">
            {data?.motdMessage}
          </p>
        </div>
        <p className="mt-4 rounded-lg border border-pink-500/30 bg-pink-500/10 px-4 py-3 text-sm leading-6 text-pink-100">
          Have an idea for the layout, a feature you would like added, or
          something that is not working correctly? Tap{' '}
          <strong>Share an Idea</strong> below. Your input helps make this site
          better for everyone.
        </p>
      </Modal>
    </Transition>
  );
};

export default MessageOfTheDay;
