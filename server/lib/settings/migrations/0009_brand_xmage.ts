import type { AllSettings } from '@server/lib/settings';

const brandXmage = (settings: AllSettings): AllSettings => {
  if (settings.migrations?.includes('0009_brand_xmage')) {
    return settings;
  }

  if (
    !settings.main.applicationTitle ||
    settings.main.applicationTitle === 'Seerr'
  ) {
    settings.main.applicationTitle = '}{maGe';
  }

  settings.migrations ??= [];
  settings.migrations.push('0009_brand_xmage');

  return settings;
};

export default brandXmage;
