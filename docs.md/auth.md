Auth.js is a library with tools for authentication. Placed in the src file, auth.ts is used to create a module to configure those tools. One of those tools is the NextAuth function. NextAuth receives a configuration object and returns authentication tools. The auth.ts module uses destructuring to extract and export those authentication tools.

route.js is a file found inside the app and serves as the receiver for http requests from the client. [...nextauth] is NEXTJS’s catch all segment that servers as a single path for the URL’s to be matched and translated to do their appropriate duties.

page.tsx is the server component that serves as the homepage for our game app. The browser holds on to a cookie given by the handlers to be read by auth() for how the server component is rendered at a given time.

Environmental Variables:

Client ID’s are the username of your application. Client Secrets are the password to let providers know that your backend can be trusted. Auth secret serves as a way to validate authentication data. Registered redirects serve as an approved callback to another URL after the authentication has been completed.

Document login and logout behavior:

Login flow =>

HomePage renders, user clicks Login button, signIn() starts login,browser goes to provider, a temporary authorization code is given to the callback route, auth.js receives the request, handlers exchange that request with a provider token, auth.js creates the session and sends the cookie to the browser => Browser asks for Homepage again => Auth() checks the cookies to render the condition of the HomePage.

Logout flow =>
User clicks Logout button => cookies get invalidated => browser asks for homepage => auth() returns null => Homepage with login button is mounted.

Current Session Shape:

auth() returns null when logged out, or a session object containing a user object with the name or email properties with respective values supplied by the provider metadata when logged in.

“Developer” is not session data; it is a generic default used in place of null or undefined.

Known Gaps:
The /game route is currently not protected from unauthenticated users. Its public.
The current setup does not automatically link provider accounts based on email addresses. Users have to log in via their original provider they signed up with.

High level next steps for player data:

Authenticate user -> save post run progress and post run equipped upgrades -> Load them in on next login
