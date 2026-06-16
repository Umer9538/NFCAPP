/**
 * Profile Setup entry point.
 *
 * Shown by RootNavigator whenever `user.profileComplete === false` (i.e. the
 * Google-mobile-complete response set `requiresProfileSetup: true`). All wizard
 * logic lives under ./profileBuilder; this file just re-exports the container
 * as the default export so the existing navigator import keeps working.
 */

import ProfileBuilderContainer from './profileBuilder/ProfileBuilderContainer';

export default ProfileBuilderContainer;
