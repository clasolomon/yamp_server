import setupDatabase from './setupDatabase';
import usersDatabase from './usersDatabase';
import meetingsDatabase from './meetingsDatabase';
import invitationsDatabase from './invitationsDatabase';
import nonMemberInvitationsDatabase from './nonMemberInvitationsDatabase';
import nonMemberMeetingsDatabase from './nonMemberMeetingsDatabase';

export default {
  ...setupDatabase,
  ...usersDatabase,
  ...meetingsDatabase,
  ...invitationsDatabase,
  ...nonMemberInvitationsDatabase,
  ...nonMemberMeetingsDatabase,
};

