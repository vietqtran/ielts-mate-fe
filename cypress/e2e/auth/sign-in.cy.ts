// Comprehensive E2E tests for /sign-in

describe('Sign In Page', () => {
  const validEmail = 'creatortest123@gmail.com';
  const validPassword = '123456aA@';

  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-in');
    cy.get('[data-cy="sign-in-page"]').should('exist');
  });

  it('sets current page session storage key on mount', () => {
    cy.window().then((win) => {
      const key = 'currentPage';
      expect(win.sessionStorage.getItem(key)).to.eq('sign-in');
    });
  });

  it('renders form and links', () => {
    cy.get('[data-cy="sign-in-form"]').should('exist');
    cy.get('[data-cy="email-input"]').should('exist');
    cy.get('[data-cy="password-input"]').should('exist');
    cy.get('[data-cy="sign-in-submit"]').contains('Sign in');
    cy.get('[data-cy="forgot-link"]').should('have.attr', 'href', '/forgot');
    cy.get('[data-cy="go-to-sign-up"]').should('have.attr', 'href', '/sign-up');
  });

  it('navigates to sign-up page via link', () => {
    cy.get('[data-cy="go-to-sign-up"]').click();
    cy.location('pathname').should('eq', '/sign-up');
  });

  it('navigates to forgot password page via link', () => {
    cy.visit('/sign-in');
    cy.get('[data-cy="forgot-link"]').click();
    cy.location('pathname').should('eq', '/forgot');
  });

  it('submits with Enter key and redirects on success', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { user: { id: 'u1', email: 'e@e.com', roles: ['USER'] } },
      },
    }).as('signInEnter');
    cy.intercept('GET', '**/identity/auth/me', {
      statusCode: 200,
      body: { status: 'success', data: { id: 'u1', email: 'e@e.com', roles: ['USER'] } },
    }).as('me');

    cy.get('[data-cy="email-input"]').type('e@e.com');
    cy.get('[data-cy="password-input"]').type('12345678{enter}');
    cy.wait('@signInEnter');
    cy.location('pathname', { timeout: 6000 }).should('eq', '/');
  });

  it('does not submit when pressing Enter if invalid', () => {
    cy.intercept('POST', '**/identity/auth/sign-in').as('signInEnterInvalid');
    cy.get('[data-cy="email-input"]').type('bad-email{enter}');
    cy.contains('Please enter a valid email address');
    cy.wait(500);
    cy.get('@signInEnterInvalid.all').should('have.length', 0);
  });

  it('prevents duplicate requests on fast double-click', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', (req) => {
      req.on('response', () => {});
      req.reply({ delay: 500, statusCode: 200, body: { status: 'error', message: 'x' } });
    }).as('signInSlow');
    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.get('[data-cy="sign-in-submit"]').dblclick();
    cy.wait('@signInSlow');
    cy.get('@signInSlow.all').should('have.length', 1);
  });

  it('email input is autofocus on load', () => {
    cy.get('[data-cy="email-input"]').should('be.focused');
  });

  it('shows validation error for invalid email after submit', () => {
    cy.get('[data-cy=\"email-input\"]').clear().type('x');
    cy.get('[data-cy=\"password-input\"]').clear().type('12345678');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.contains('Please enter a valid email address');
  });

  it('shows validation error for short password after submit', () => {
    cy.get('[data-cy=\"email-input\"]').clear().type('user@example.com');
    cy.get('[data-cy=\"password-input\"]').clear().type('1');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.contains('Password must be at least 8 characters');
  });

  it('uppercase emails are accepted', () => {
    cy.get('[data-cy="email-input"]').clear().type('USER@EXAMPLE.COM');
    cy.get('[data-cy="password-input"]').clear().type('12345678');
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: { status: 'error', message: 'bad' },
    }).as('signInUpper');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signInUpper');
    cy.get('[data-cy="general-error"]').should('exist');
  });

  it('leading/trailing spaces in email cause validation error', () => {
    cy.get('[data-cy="email-input"]').clear().type(' user@example.com ');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.contains('Please enter a valid email address');
  });

  it('field errors clear when typing in email after submit', () => {
    cy.get('[data-cy=\"email-input\"]').clear().type('x');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.contains('Please enter a valid email address');
    cy.get('[data-cy=\"email-input\"]').clear().type('user@example.com');
    cy.contains('Please enter a valid email address').should('not.exist');
  });

  it('field errors clear when typing in password after submit', () => {
    cy.get('[data-cy=\"email-input\"]').clear().type('user@example.com');
    cy.get('[data-cy=\"password-input\"]').clear().type('1');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.contains('Password must be at least 8 characters');
    cy.get('[data-cy=\"password-input\"]').clear().type('12345678');
    cy.contains('Password must be at least 8 characters').should('not.exist');
  });

  it('shows loading state on submit and restores after error', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', (req) => {
      req.reply({ delay: 500, statusCode: 200, body: { status: 'error', message: 'Invalid' } });
    }).as('signInDelay');
    cy.get('[data-cy=\"email-input\"]').type('user@example.com');
    cy.get('[data-cy=\"password-input\"]').type('12345678');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.get('[data-cy=\"sign-in-submit\"]').should('not.contain', 'Sign in');
    cy.wait('@signInDelay');
    cy.get('[data-cy=\"sign-in-submit\"]').should('contain.text', 'Sign in');
  });

  it('email input regains focus after non-axios error path', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: { status: 'error', message: 'Invalid credentials' },
    }).as('signInErr');
    cy.get('[data-cy=\"email-input\"]').type('user@example.com');
    cy.get('[data-cy=\"password-input\"]').type('12345678');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.wait('@signInErr');
    cy.get('[data-cy=\"email-input\"]').should('be.focused');
  });

  it('does not redirect on API error', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: { status: 'error', message: 'Invalid' },
    }).as('signInErrNoRedirect');
    cy.get('[data-cy=\"email-input\"]').type('user@example.com');
    cy.get('[data-cy=\"password-input\"]').type('12345678');
    cy.get('[data-cy=\"sign-in-submit\"]').click();
    cy.wait('@signInErrNoRedirect');
    cy.location('pathname').should('eq', '/sign-in');
  });

  it('does not restore persisted values when currentPage key does not match', () => {
    cy.get('[data-cy="email-input"]').type('persist@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.window().then((win) => {
      win.sessionStorage.setItem('currentPage', 'other-page');
    });
    cy.reload();
    cy.get('[data-cy="email-input"]').should('have.value', '');
    cy.get('[data-cy="password-input"]').should('have.value', '');
  });

  it('social login button is visible', () => {
    cy.contains('Continue with Google').should('be.visible');
  });

  it('shows default error text when backend returns no message', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 400,
      body: {
        error_code: 'UNKNOWN_ERROR',
      },
    }).as('signInNoMsg');
    cy.get('[data-cy="email-input"]').clear().type('user@example.com');
    cy.get('[data-cy="password-input"]').clear().type('12345678');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signInNoMsg');
    cy.get('[data-cy="general-error"]').should('exist');
  });

  it('shows validation errors for empty fields', () => {
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.contains('Please enter a valid email address');
    cy.contains('Password must be at least 8 characters');
  });

  it('shows validation error for invalid email format and short password', () => {
    cy.get('[data-cy="email-input"]').type('invalid-email');
    cy.get('[data-cy="password-input"]').type('short');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.contains('Please enter a valid email address');
    cy.contains('Password must be at least 8 characters');
  });

  it('submits successfully and redirects to / when server returns success', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: {
        status: 'success',
        data: {
          user: { id: 'u1', email: validEmail, roles: ['USER'] },
        },
      },
    }).as('signIn');

    // Optional: stub me endpoint if landing page fetches user again
    cy.intercept('GET', '**/identity/auth/me', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { id: 'u1', email: validEmail, roles: ['USER'] },
      },
    }).as('me');

    cy.get('[data-cy="email-input"]').type(validEmail);
    cy.get('[data-cy="password-input"]').type(validPassword);
    cy.get('[data-cy="sign-in-submit"]').click();

    cy.wait('@signIn');
    // Wait for cookie setup delay and redirect
    cy.location('pathname', { timeout: 6000 }).should('eq', '/');
  });

  it('shows general error when API returns error payload (non-throwing)', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 200,
      body: {
        status: 'error',
        message: 'Invalid credentials',
      },
    }).as('signInError');

    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signInError');
    cy.get('[data-cy="general-error"]').should('be.visible').then(($el) => {
      const txt = $el.text();
      expect(/Invalid credentials|An unexpected error occurred/i.test(txt)).to.eq(true);
    });
    cy.get('[data-cy="sign-in-submit"]').should('contain.text', 'Sign in');
  });

  it('handles EMAIL_UNVERIFIED and redirects to /otp/verify with email param', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 400,
      body: {
        message: 'Email not verified',
        error_code: '00028',
      },
    }).as('signInUnverified');

    cy.get('[data-cy="email-input"]').type('unverified@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signInUnverified');
    cy.location('pathname').should('eq', '/otp/verify');
    cy.location('search').should('contain', 'email=unverified%40example.com');
  });

  it('shows extracted axios error and focuses email input on error', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 400,
      body: {
        message: 'Something went wrong',
        error_code: 'UNKNOWN_ERROR',
      },
    }).as('signIn400');

    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signIn400');
    cy.get('[data-cy="general-error"]').contains('Something went wrong');
    // Ensure email input is focused
    cy.get('[data-cy="email-input"]').should('be.focused');
  });

  it('clears general error message when user starts typing again', () => {
    cy.intercept('POST', '**/identity/auth/sign-in', {
      statusCode: 400,
      body: {
        message: 'Bad credentials',
        error_code: 'UNKNOWN_ERROR',
      },
    }).as('signInBad');

    cy.get('[data-cy="email-input"]').type('user@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    cy.get('[data-cy="sign-in-submit"]').click();
    cy.wait('@signInBad');
    cy.get('[data-cy="general-error"]').contains('Bad credentials');

    // Type to clear error
    cy.get('[data-cy="password-input"]').type('9');
    cy.get('[data-cy="general-error"]').should('not.exist');
  });

  it('persists form values via redux on unload and restores when returning to the page', () => {
    // type, navigate away, and come back
    cy.get('[data-cy="email-input"]').type('persist@example.com');
    cy.get('[data-cy="password-input"]').type('12345678');
    // trigger beforeunload by reloading the page
    cy.reload();
    // current page key is set by the page effect
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('currentPage')).to.eq('sign-in');
    });
    // the values should be restored
    cy.get('[data-cy="email-input"]').should('have.value', 'persist@example.com');
    cy.get('[data-cy="password-input"]').should('have.value', '12345678');
  });
});

describe('Logout flow from /dashboard via header', () => {
  it('can logout using the header menu', () => {
    // Assume user is logged in; stub me to simulate logged-in state
    cy.intercept('GET', '**/identity/auth/me', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { id: 'u1', email: 'logged@in.com', roles: ['USER'], firstName: 'L', lastName: 'I' },
      },
    }).as('me');

    // Open a protected page
    cy.visit('/dashboard');

    // Open user menu and logout
    cy.get('[data-cy="avatar-button"]').click({ force: true });
    cy.get('[data-cy="logout-button"]').click({ force: true });

    // After signOut, app typically redirects; allow some time
    cy.location('pathname', { timeout: 5000 }).should('eq', '/');
  });
});


