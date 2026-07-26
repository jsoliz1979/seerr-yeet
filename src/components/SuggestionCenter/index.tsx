import Button from '@app/components/Common/Button';
import Header from '@app/components/Common/Header';
import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import type { MotdSettings } from '@app/components/Layout/MessageOfTheDay';
import useToasts from '@app/hooks/useToasts';
import { Permission, useUser } from '@app/hooks/useUser';
import defineMessages from '@app/utils/defineMessages';
import {
  SuggestionCategory,
  SuggestionStatus,
} from '@server/constants/suggestion';
import type { SuggestionResultsResponse } from '@server/interfaces/api/suggestionInterfaces';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages('components.SuggestionCenter', {
  title: 'Suggestions',
  subtitle:
    'Have an idea or notice something confusing? Send it directly to the Seerr administrators.',
  category: 'What is this about?',
  suggestion: 'Suggestion',
  problem: 'Something is confusing or broken',
  other: 'Other',
  details: 'Tell us what you would like to see',
  placeholder:
    'Describe your idea or problem. The more detail you include, the easier it is for us to help.',
  page: 'Page or screen (optional)',
  pagePlaceholder: 'Example: Movies page or Request Movie window',
  submit: 'Send Suggestion',
  sent: 'Thank you! Your suggestion was sent to the administrators.',
  sendFailed: 'Something went wrong while sending your suggestion.',
  adminInbox: 'Administrator Inbox',
  adminSubtitle: 'Suggestions submitted by Seerr users are stored here.',
  all: 'All',
  new: 'New',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
  submittedBy: 'Submitted by {name} on {date}',
  noSuggestions: 'No suggestions match this filter.',
  delete: 'Delete',
  deleteConfirm: 'Permanently delete this suggestion?',
  updateFailed: 'Could not update the suggestion.',
  motdTitle: 'Message of the Day',
  motdSubtitle:
    'Write a welcome message that users will see when they begin a new Seerr session.',
  popupTitle: 'Popup title',
  popupMessage: 'Message',
  motdEnabled: 'Show this message to users',
  saveMotd: 'Save Message',
  motdSaved: 'Message of the Day saved.',
});

const categoryLabels = {
  [SuggestionCategory.SUGGESTION]: messages.suggestion,
  [SuggestionCategory.PROBLEM]: messages.problem,
  [SuggestionCategory.OTHER]: messages.other,
};

const statusLabels = {
  [SuggestionStatus.NEW]: messages.new,
  [SuggestionStatus.REVIEWED]: messages.reviewed,
  [SuggestionStatus.RESOLVED]: messages.resolved,
};

const SuggestionCenter = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const { hasPermission } = useUser();
  const isAdmin = hasPermission(Permission.ADMIN);
  const [category, setCategory] = useState(SuggestionCategory.SUGGESTION);
  const [message, setMessage] = useState('');
  const [pageUrl, setPageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<number>(0);
  const suggestionUrl = isAdmin
    ? `/api/v1/suggestion?take=100${
        statusFilter ? `&status=${statusFilter}` : ''
      }`
    : null;
  const { data, mutate } = useSWR<SuggestionResultsResponse>(suggestionUrl);
  const { data: motd, mutate: mutateMotd } = useSWR<MotdSettings>(
    isAdmin ? '/api/v1/suggestion/motd' : null
  );
  const [motdTitle, setMotdTitle] = useState('');
  const [motdMessage, setMotdMessage] = useState('');
  const [motdEnabled, setMotdEnabled] = useState(false);

  useEffect(() => {
    if (motd) {
      setMotdTitle(motd.motdTitle);
      setMotdMessage(motd.motdMessage);
      setMotdEnabled(motd.motdEnabled);
    }
  }, [motd]);

  const saveMotd = async () => {
    try {
      await axios.put('/api/v1/suggestion/motd', {
        motdTitle,
        motdMessage,
        motdEnabled,
      });
      await mutateMotd();
      addToast(intl.formatMessage(messages.motdSaved), {
        appearance: 'success',
      });
    } catch (error) {
      const serverMessage =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data.message;
      addToast(serverMessage || intl.formatMessage(messages.updateFailed), {
        appearance: 'error',
      });
    }
  };

  const submitSuggestion = async () => {
    setSubmitting(true);
    try {
      await axios.post('/api/v1/suggestion', { category, message, pageUrl });
      setMessage('');
      setPageUrl('');
      addToast(intl.formatMessage(messages.sent), { appearance: 'success' });
      await mutate();
    } catch (error) {
      const serverMessage =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data.message;
      addToast(serverMessage || intl.formatMessage(messages.sendFailed), {
        appearance: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: number, status: number) => {
    try {
      await axios.put(`/api/v1/suggestion/${id}`, { status });
      await mutate();
    } catch (error) {
      const serverMessage =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data.message;
      addToast(serverMessage || intl.formatMessage(messages.updateFailed), {
        appearance: 'error',
      });
    }
  };

  const deleteSuggestion = async (id: number) => {
    if (!window.confirm(intl.formatMessage(messages.deleteConfirm))) return;
    try {
      await axios.delete(`/api/v1/suggestion/${id}`);
      await mutate();
    } catch (error) {
      const serverMessage =
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data.message;
      addToast(serverMessage || intl.formatMessage(messages.updateFailed), {
        appearance: 'error',
      });
    }
  };

  return (
    <div className="mb-16">
      <PageTitle title={intl.formatMessage(messages.title)} />
      <Header subtext={intl.formatMessage(messages.subtitle)}>
        {intl.formatMessage(messages.title)}
      </Header>

      <div className="mt-8 rounded-lg border border-indigo-500/40 bg-gray-800 p-5 shadow-lg">
        <div className="grid gap-5">
          <label className="text-sm font-medium text-gray-200">
            {intl.formatMessage(messages.category)}
            <select
              className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              value={category}
              onChange={(event) => setCategory(Number(event.target.value))}
            >
              {Object.entries(categoryLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {intl.formatMessage(label)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium text-gray-200">
            {intl.formatMessage(messages.details)}
            <textarea
              className="mt-2 block min-h-32 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              maxLength={2000}
              value={message}
              placeholder={intl.formatMessage(messages.placeholder)}
              onChange={(event) => setMessage(event.target.value)}
            />
          </label>
          <label className="text-sm font-medium text-gray-200">
            {intl.formatMessage(messages.page)}
            <input
              className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
              maxLength={500}
              value={pageUrl}
              placeholder={intl.formatMessage(messages.pagePlaceholder)}
              onChange={(event) => setPageUrl(event.target.value)}
            />
          </label>
          <div>
            <Button
              buttonType="primary"
              disabled={submitting || message.trim().length < 10}
              onClick={() => submitSuggestion()}
            >
              {intl.formatMessage(messages.submit)}
            </Button>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-10">
          <Header subtext={intl.formatMessage(messages.motdSubtitle)}>
            {intl.formatMessage(messages.motdTitle)}
          </Header>
          <div className="my-5 grid gap-4 rounded-lg border border-purple-500/40 bg-gray-800 p-5">
            <label className="text-sm font-medium text-gray-200">
              {intl.formatMessage(messages.popupTitle)}
              <input
                className="mt-2 block w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                maxLength={100}
                value={motdTitle}
                onChange={(event) => setMotdTitle(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-gray-200">
              {intl.formatMessage(messages.popupMessage)}
              <textarea
                className="mt-2 block min-h-28 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white"
                maxLength={2000}
                value={motdMessage}
                onChange={(event) => setMotdMessage(event.target.value)}
              />
            </label>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-200">
              <input
                type="checkbox"
                checked={motdEnabled}
                onChange={(event) => setMotdEnabled(event.target.checked)}
              />
              {intl.formatMessage(messages.motdEnabled)}
            </label>
            <div>
              <Button
                buttonType="primary"
                disabled={!motdMessage.trim()}
                onClick={() => saveMotd()}
              >
                {intl.formatMessage(messages.saveMotd)}
              </Button>
            </div>
          </div>

          <Header subtext={intl.formatMessage(messages.adminSubtitle)}>
            {intl.formatMessage(messages.adminInbox)}
          </Header>
          <div className="my-5 flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((status) => (
              <Button
                key={status}
                buttonType={statusFilter === status ? 'primary' : 'default'}
                buttonSize="sm"
                onClick={() => setStatusFilter(status)}
              >
                {intl.formatMessage(
                  status === 0
                    ? messages.all
                    : statusLabels[status as SuggestionStatus]
                )}
              </Button>
            ))}
          </div>
          {!data ? (
            <LoadingSpinner />
          ) : data.results.length === 0 ? (
            <div className="rounded-lg bg-gray-800 p-8 text-center text-gray-400">
              {intl.formatMessage(messages.noSuggestions)}
            </div>
          ) : (
            <div className="space-y-4">
              {data.results.map((item) => (
                <div key={item.id} className="rounded-lg bg-gray-800 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div>
                      <div className="font-semibold text-indigo-300">
                        {intl.formatMessage(categoryLabels[item.category])}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        {intl.formatMessage(messages.submittedBy, {
                          name: item.createdBy?.displayName ?? 'Deleted user',
                          date: intl.formatDate(new Date(item.createdAt), {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          }),
                        })}
                      </div>
                    </div>
                    <select
                      className="rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                      value={item.status}
                      onChange={(event) =>
                        updateStatus(item.id, Number(event.target.value))
                      }
                    >
                      {[1, 2, 3].map((status) => (
                        <option key={status} value={status}>
                          {intl.formatMessage(
                            statusLabels[status as SuggestionStatus]
                          )}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap text-gray-100">
                    {item.message}
                  </p>
                  {item.pageUrl && (
                    <p className="mt-3 text-sm text-gray-400">{item.pageUrl}</p>
                  )}
                  <div className="mt-4">
                    <Button
                      buttonType="danger"
                      buttonSize="sm"
                      onClick={() => deleteSuggestion(item.id)}
                    >
                      {intl.formatMessage(messages.delete)}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuggestionCenter;
