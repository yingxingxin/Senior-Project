# Auth Route Group

This folder hosts the unauthenticated routes: the login and signup experiences that sit outside the main application shell.

- Layout (`layout.tsx`): wraps the group with the two-panel hero treatment and ensures both pages share the same look and feel.
- Pages (`login/page_old.tsx`, `signup/page_old.tsx`): server components responsible for structure, copy, and metadata.
- Forms (`components/auth/LoginForm.tsx`, `components/auth/SignupForm.tsx`): client components that handle interactivity, validation, and talking to the auth API routes.

Authentication flow notes:

- These pages should only be reachable when users are **not** signed in.
- TODO: add middleware or a server action to redirect authenticated users to their home route.
- `LoginForm` / `SignupForm` call the `/api/auth/*` endpoints and rely on cookies for session state.
- Once a session exists, navigating back to `/login` or `/signup` should redirect users away.
