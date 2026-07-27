import Badge from '@app/components/Common/Badge';
import { menuMessages } from '@app/components/Layout/Sidebar';
import useClickOutside from '@app/hooks/useClickOutside';
import useReadyRequestCount from '@app/hooks/useReadyRequestCount';
import { Permission, useUser } from '@app/hooks/useUser';
import { Transition } from '@headlessui/react';
import {
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CogIcon,
  EllipsisHorizontalIcon,
  ExclamationTriangleIcon,
  EyeSlashIcon,
  FilmIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  TvIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import {
  AdjustmentsHorizontalIcon as FilledAdjustmentsHorizontalIcon,
  ClockIcon as FilledClockIcon,
  CogIcon as FilledCogIcon,
  ExclamationTriangleIcon as FilledExclamationTriangleIcon,
  EyeSlashIcon as FilledEyeSlashIcon,
  FilmIcon as FilledFilmIcon,
  LightBulbIcon as FilledLightBulbIcon,
  QuestionMarkCircleIcon as FilledQuestionMarkCircleIcon,
  SparklesIcon as FilledSparklesIcon,
  TvIcon as FilledTvIcon,
  UsersIcon as FilledUsersIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { cloneElement, useEffect, useRef, useState, type JSX } from 'react';
import { useIntl } from 'react-intl';

interface MobileMenuProps {
  pendingRequestsCount: number;
  openIssuesCount: number;
  revalidateIssueCount: () => void;
  revalidateRequestsCount: () => void;
}

interface MenuLink {
  href: string;
  svgIcon: JSX.Element;
  svgIconSelected: JSX.Element;
  content: React.ReactNode;
  activeRegExp: RegExp;
  as?: string;
  requiredPermission?: Permission | Permission[];
  permissionType?: 'and' | 'or';
  dataTestId?: string;
}

const MobileMenu = ({
  pendingRequestsCount,
  openIssuesCount,
  revalidateIssueCount,
  revalidateRequestsCount,
}: MobileMenuProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);
  const intl = useIntl();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const { hasPermission } = useUser();
  const readyRequestCount = useReadyRequestCount();
  const router = useRouter();
  useClickOutside(ref, () => {
    setTimeout(() => {
      if (isOpen) {
        setIsOpen(false);
      }
    }, 150);
  });

  const toggle = () => setIsOpen(!isOpen);

  const menuLinks: MenuLink[] = [
    {
      href: '/',
      content: intl.formatMessage(menuMessages.dashboard),
      svgIcon: <SparklesIcon className="h-6 w-6" />,
      svgIconSelected: <FilledSparklesIcon className="h-6 w-6" />,
      activeRegExp: /^\/(discover\/?)?$/,
    },
    {
      href: '/discover/movies',
      content: intl.formatMessage(menuMessages.browsemovies),
      svgIcon: <FilmIcon className="h-6 w-6" />,
      svgIconSelected: <FilledFilmIcon className="h-6 w-6" />,
      activeRegExp: /^\/discover\/movies$/,
    },
    {
      href: '/discover/tv',
      content: intl.formatMessage(menuMessages.browsetv),
      svgIcon: <TvIcon className="h-6 w-6" />,
      svgIconSelected: <FilledTvIcon className="h-6 w-6" />,
      activeRegExp: /^\/discover\/tv$/,
    },
    {
      href: '/discover/choose',
      content: intl.formatMessage(menuMessages.choose),
      svgIcon: <QuestionMarkCircleIcon className="h-6 w-6" />,
      svgIconSelected: <FilledQuestionMarkCircleIcon className="h-6 w-6" />,
      activeRegExp: /^\/discover\/choose$/,
    },
    {
      href: '/requests',
      content: intl.formatMessage(menuMessages.requests),
      svgIcon: <ClockIcon className="h-6 w-6" />,
      svgIconSelected: <FilledClockIcon className="h-6 w-6" />,
      activeRegExp: /^\/requests/,
    },
    {
      href: '/blocklist',
      content: intl.formatMessage(menuMessages.blocklist),
      svgIcon: <EyeSlashIcon className="h-6 w-6" />,
      svgIconSelected: <FilledEyeSlashIcon className="h-6 w-6" />,
      activeRegExp: /^\/blocklist/,
      requiredPermission: [
        Permission.MANAGE_BLOCKLIST,
        Permission.VIEW_BLOCKLIST,
      ],
      permissionType: 'or',
    },
    {
      href: '/issues',
      content: intl.formatMessage(menuMessages.issues),
      svgIcon: <ExclamationTriangleIcon className="h-6 w-6" />,
      svgIconSelected: <FilledExclamationTriangleIcon className="h-6 w-6" />,
      activeRegExp: /^\/issues/,
      requiredPermission: [
        Permission.MANAGE_ISSUES,
        Permission.CREATE_ISSUES,
        Permission.VIEW_ISSUES,
      ],
      permissionType: 'or',
    },
    {
      href: '/suggestions',
      content: (
        <span className="flex items-center gap-1">
          {intl.formatMessage(menuMessages.suggestions)}
          <span className="animate-pulse rounded-full bg-pink-500 px-1.5 text-[9px] font-bold text-white">
            NEW
          </span>
        </span>
      ),
      svgIcon: <LightBulbIcon className="h-6 w-6" />,
      svgIconSelected: <FilledLightBulbIcon className="h-6 w-6" />,
      activeRegExp: /^\/suggestions/,
    },
    {
      href: '/preferences',
      content: intl.formatMessage(menuMessages.preferences),
      svgIcon: <AdjustmentsHorizontalIcon className="h-6 w-6" />,
      svgIconSelected: <FilledAdjustmentsHorizontalIcon className="h-6 w-6" />,
      activeRegExp: /^\/preferences/,
    },
    {
      href: '/help',
      content: intl.formatMessage(menuMessages.help),
      svgIcon: <QuestionMarkCircleIcon className="h-6 w-6" />,
      svgIconSelected: <FilledQuestionMarkCircleIcon className="h-6 w-6" />,
      activeRegExp: /^\/help/,
    },
    {
      href: '/users',
      content: intl.formatMessage(menuMessages.users),
      svgIcon: <UsersIcon className="mr-3 h-6 w-6" />,
      svgIconSelected: <FilledUsersIcon className="mr-3 h-6 w-6" />,
      activeRegExp: /^\/users/,
      requiredPermission: Permission.MANAGE_USERS,
      dataTestId: 'sidebar-menu-users',
    },
    {
      href: '/settings',
      content: intl.formatMessage(menuMessages.settings),
      svgIcon: <CogIcon className="mr-3 h-6 w-6" />,
      svgIconSelected: <FilledCogIcon className="mr-3 h-6 w-6" />,
      activeRegExp: /^\/settings/,
      requiredPermission: Permission.ADMIN,
      dataTestId: 'sidebar-menu-settings',
    },
  ];

  const filteredLinks = menuLinks.filter(
    (link) =>
      !link.requiredPermission ||
      hasPermission(link.requiredPermission, {
        type: link.permissionType ?? 'and',
      })
  );

  useEffect(() => {
    if (openIssuesCount) {
      revalidateIssueCount();
    }

    if (pendingRequestsCount) {
      revalidateRequestsCount();
    }
  }, [
    revalidateIssueCount,
    revalidateRequestsCount,
    pendingRequestsCount,
    openIssuesCount,
  ]);

  useEffect(() => {
    const updateVisibility = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const difference = currentScrollY - lastScrollY.current;

      if (isOpen || currentScrollY < 80) {
        setIsVisible(true);
      } else if (difference > 8) {
        setIsVisible(false);
      } else if (difference < -8) {
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    lastScrollY.current = Math.max(0, window.scrollY);
    window.addEventListener('scroll', updateVisibility, { passive: true });

    return () => window.removeEventListener('scroll', updateVisibility);
  }, [isOpen]);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 transform-gpu transition-transform duration-300 ease-out ${
        isVisible || isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      <Transition
        show={isOpen}
        as="div"
        ref={ref}
        enter="transition duration-500"
        enterFrom="opacity-0 translate-y-0"
        enterTo="opacity-100 -translate-y-full"
        leave="transition duration-500"
        leaveFrom="opacity-100 -translate-y-full"
        leaveTo="opacity-0 translate-y-0"
        className="absolute left-0 right-0 top-0 flex w-full -translate-y-full flex-col space-y-6 border-t border-gray-600 bg-gray-900/90 px-6 py-6 font-semibold text-gray-100 backdrop-blur"
      >
        {filteredLinks.map((link) => {
          const isActive = router.pathname.match(link.activeRegExp);
          return (
            <Link
              key={`mobile-menu-link-${link.href}`}
              href={link.href}
              className={`flex items-center ${
                isActive ? 'text-indigo-500' : ''
              }`}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setIsOpen(false);
                }
              }}
              onClick={() => setIsOpen(false)}
              role="button"
              tabIndex={0}
            >
              {cloneElement(isActive ? link.svgIconSelected : link.svgIcon, {
                className: 'h-5 w-5',
              })}
              <span className="ml-2">{link.content}</span>
              {link.href === '/requests' &&
                ((pendingRequestsCount > 0 &&
                  hasPermission(Permission.MANAGE_REQUESTS)) ||
                  readyRequestCount > 0) && (
                  <div className="ml-auto flex">
                    <Badge
                      className={`rounded-md ${
                        readyRequestCount > 0
                          ? 'border-green-400 bg-green-600'
                          : 'border-indigo-500 bg-gradient-to-br from-indigo-600 to-purple-600'
                      }`}
                    >
                      {readyRequestCount > 0
                        ? `${readyRequestCount} READY`
                        : pendingRequestsCount}
                    </Badge>
                  </div>
                )}
              {link.href === '/issues' &&
                openIssuesCount > 0 &&
                hasPermission(Permission.MANAGE_ISSUES) && (
                  <div className="ml-auto flex">
                    <Badge className="rounded-md border-indigo-500 bg-gradient-to-br from-indigo-600 to-purple-600">
                      {openIssuesCount}
                    </Badge>
                  </div>
                )}
            </Link>
          );
        })}
      </Transition>
      <div className="padding-bottom-safe border-t border-gray-600 bg-gray-800/90 backdrop-blur">
        <div className="flex h-full items-center justify-between px-6 py-4 text-gray-100">
          {filteredLinks
            .slice(0, filteredLinks.length === 5 ? 5 : 4)
            .map((link) => {
              const isActive =
                router.pathname.match(link.activeRegExp) && !isOpen;
              return (
                <Link
                  key={`mobile-menu-link-${link.href}`}
                  href={link.href}
                  className={`relative flex flex-col items-center space-y-1 ${
                    isActive ? 'text-indigo-500' : ''
                  }`}
                >
                  {cloneElement(
                    isActive ? link.svgIconSelected : link.svgIcon,
                    {
                      className: 'h-6 w-6',
                    }
                  )}
                  {link.href === '/requests' &&
                    pendingRequestsCount > 0 &&
                    hasPermission(Permission.MANAGE_REQUESTS) && (
                      <div className="absolute bottom-3 left-3">
                        <Badge
                          className={`bg-gradient-to-br ${
                            router.pathname.match(link.activeRegExp)
                              ? 'border-indigo-600 from-indigo-700 to-purple-700'
                              : 'border-indigo-500 from-indigo-600 to-purple-600'
                          } flex ${
                            pendingRequestsCount > 99 ? 'w-6' : 'w-4'
                          } h-4 items-center justify-center !px-[5px] !py-[7px] text-[8px]`}
                        >
                          {pendingRequestsCount > 99
                            ? '99+'
                            : pendingRequestsCount}
                        </Badge>
                      </div>
                    )}
                </Link>
              );
            })}
          {filteredLinks.length > 4 && filteredLinks.length !== 5 && (
            <button
              className={`flex flex-col items-center space-y-1 ${
                isOpen ? 'text-indigo-500' : ''
              }`}
              onClick={() => toggle()}
            >
              {isOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <EllipsisHorizontalIcon className="h-6 w-6" />
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
