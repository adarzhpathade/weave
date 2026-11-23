export type NotifyPrefs = { deadline: boolean; newAssignment: boolean; status: boolean };

export type ProfileData = {
  fullName: string;
  email: string;
  enrollmentNo: string;
  programCode: string;
  divisionCode: string;
  semester: number;
  phone: string | null;
  notify: NotifyPrefs;
};

export type ProfileActions = {
  updateNotify: (
    input: NotifyPrefs,
  ) => Promise<{ ok: true; data: null } | { ok: false; error: { code: string; message: string } }>;
  signOut: () => Promise<void>;
};
