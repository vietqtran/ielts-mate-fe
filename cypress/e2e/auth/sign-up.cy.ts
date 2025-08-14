// E2E tests for /sign-up

describe('Sign Up Page', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/sign-up');
    cy.get('[data-cy="sign-up-page"]').should('exist');
  });

  it('sets current page session storage key on mount', () => {
    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('currentPage')).to.eq('sign-up');
    });
  });

  it('renders form and link to sign in', () => {
    cy.get('[data-cy="sign-up-form"]').should('exist');
    cy.get('[data-cy="first-name-input"]').should('exist');
    cy.get('[data-cy="last-name-input"]').should('exist');
    cy.get('[data-cy="email-input"]').should('exist');
    cy.get('[data-cy="password-input"]').should('exist');
    cy.get('[data-cy="confirm-password-input"]').should('exist');
    cy.get('[data-cy="sign-up-submit"]').contains('Sign up');
    cy.get('[data-cy="go-to-sign-in"]').should('have.attr', 'href', '/sign-in');
  });

  it('navigates to sign-in page via link', () => {
    cy.get('[data-cy="go-to-sign-in"]').click();
    cy.location('pathname').should('eq', '/sign-in');
  });

  it('does not submit when invalid inputs are present', () => {
    cy.intercept('POST', '**/identity/auth/sign-up').as('signUpBlock');
    cy.get('[data-cy="email-input"]').type('bad-email');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('Please enter a valid email address');
    cy.wait(500);
    cy.get('@signUpBlock.all').should('have.length', 0);
  });

  it('prevents duplicate requests on double-click', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', (req) => {
      req.reply({ delay: 500, statusCode: 200, body: { status: 'error', message: 'x' } });
    }).as('signUpOnce');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').dblclick();
    cy.wait('@signUpOnce');
    cy.get('@signUpOnce.all').should('have.length', 1);
  });

  it('shows validation errors for names and email after submit', () => {
    cy.get('[data-cy="first-name-input"]').clear().type('J');
    cy.get('[data-cy="last-name-input"]').clear().type('D');
    cy.get('[data-cy="email-input"]').clear().type('x');
    cy.get('[data-cy="password-input"]').clear().type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').clear().type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('First name must be at least 2 characters');
    cy.contains('Last name must be at least 2 characters');
    cy.contains('Please enter a valid email address');
  });

  it('shows password validation after submit', () => {
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('1');
    cy.get('[data-cy="confirm-password-input"]').type('1');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('Password must be at least 8 characters');
  });

  it('shows loading state on submit and restores after API error', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', (req) => {
      req.reply({ delay: 500, statusCode: 200, body: { status: 'error', message: 'x' } });
    }).as('signUpDelay');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.get('[data-cy="sign-up-submit"]').should('not.contain', 'Sign up');
    cy.wait('@signUpDelay');
    cy.get('[data-cy="sign-up-submit"]').should('contain.text', 'Sign up');
  });

  it('does not redirect on API error', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: { status: 'error', message: 'x' },
    }).as('signUpErrNoRedirect');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpErrNoRedirect');
    cy.location('pathname').should('eq', '/sign-up');
  });

  it('field errors clear when typing in names after submit', () => {
    cy.get('[data-cy="first-name-input"]').clear().type('J');
    cy.get('[data-cy="last-name-input"]').clear().type('D');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('First name must be at least 2 characters');
    cy.contains('Last name must be at least 2 characters');
    cy.get('[data-cy="first-name-input"]').clear().type('Jo');
    cy.contains('First name must be at least 2 characters').should('not.exist');
    cy.get('[data-cy="last-name-input"]').clear().type('Do');
    cy.contains('Last name must be at least 2 characters').should('not.exist');
  });

  it('Enter key submits when inputs valid and redirects to verify', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: { status: 'success', data: { ok: true } },
    }).as('signUpEnter');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!{enter}');
    cy.wait('@signUpEnter');
    cy.location('pathname', { timeout: 6000 }).should('eq', '/otp/verify');
  });

  it('does not submit on Enter when confirm password mismatched', () => {
    cy.intercept('POST', '**/identity/auth/sign-up').as('signUpBlockEnter');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Different1!{enter}');
    cy.wait(500);
    cy.get('@signUpBlockEnter.all').should('have.length', 0);
    cy.contains('Passwords do not match');
  });

  it('accepts uppercase emails and calls API', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: { status: 'error', message: 'x' },
    }).as('signUpUpper');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('USER@EXAMPLE.COM');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpUpper');
  });

  it('email with plus is allowed and encoded in redirect', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: { status: 'success', data: { ok: true } },
    }).as('signUpPlus');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john+test@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpPlus');
    cy.location('pathname', { timeout: 6000 }).should('eq', '/otp/verify');
    cy.location('search').should('contain', 'email=john%2Btest%40example.com');
  });

  it('password without special character shows validation message', () => {
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1');
    cy.get('[data-cy="confirm-password-input"]').type('Password1');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('Password must contain at least one number and one special character');
  });

  it('password without number shows validation message', () => {
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password!');
    cy.get('[data-cy="confirm-password-input"]').type('Password!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('Password must contain at least one number and one special character');
  });

  it('general error dismisses when typing any field', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: { status: 'error', message: 'Email already exists' },
    }).as('signUpErrDismiss');
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpErrDismiss');
    cy.get('[data-cy="general-error"]').should('be.visible');
    cy.get('[data-cy="email-input"]').type('x');
    cy.get('[data-cy="general-error"]').should('not.exist');
  });

  it('Google button visible', () => {
    cy.contains('Continue with Google').should('be.visible');
  });

  it('first name input is autofocus on load', () => {
    cy.get('[data-cy="first-name-input"]').should('be.focused');
  });

  it('does not restore persisted values when currentPage key does not match', () => {
    cy.get('[data-cy="first-name-input"]').type('Alex');
    cy.window().then((win) => {
      win.sessionStorage.setItem('currentPage', 'other-page');
    });
    cy.reload();
    cy.get('[data-cy="first-name-input"]').should('have.value', '');
  });

  it('shows default error text when backend returns no message', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 400,
      body: {
        error_code: 'UNKNOWN_ERROR',
      },
    }).as('signUpNoMsg');

    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpNoMsg');
    cy.get('[data-cy="general-error"]').should('exist');
  });

  it('shows validation errors for empty/invalid fields', () => {
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('First name must be at least 2 characters');
    cy.contains('Last name must be at least 2 characters');
    cy.contains('Please enter a valid email address');
    cy.contains('Password must be at least 8 characters');
  });

  it('validates mismatched confirm password', () => {
    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Different1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.contains('Passwords do not match');
  });

  it('signs up successfully and redirects to /otp/verify with email param', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: {
        status: 'success',
        data: { ok: true },
      },
    }).as('signUp');

    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();

    cy.wait('@signUp');
    cy.location('pathname', { timeout: 6000 }).should('eq', '/otp/verify');
    cy.location('search').should('contain', 'email=john%40example.com');
  });

  it('shows general error when API returns error payload (non-throwing)', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 200,
      body: {
        status: 'error',
        message: 'Email already exists',
      },
    }).as('signUpErr');

    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();
    cy.wait('@signUpErr');
    cy.get('[data-cy="general-error"]').should('be.visible').and('contain.text', 'Email already exists');
  });

  it('shows axios error when API throws', () => {
    cy.intercept('POST', '**/identity/auth/sign-up', {
      statusCode: 400,
      body: {
        message: 'Weak password',
        error_code: 'UNKNOWN_ERROR',
      },
    }).as('signUp400');

    cy.get('[data-cy="first-name-input"]').type('John');
    cy.get('[data-cy="last-name-input"]').type('Doe');
    cy.get('[data-cy="email-input"]').type('john@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');
    cy.get('[data-cy="sign-up-submit"]').click();

    cy.wait('@signUp400');
    cy.get('[data-cy="general-error"]').should('be.visible').then(($el) => {
      const txt = $el.text();
      expect(/Weak password|An unexpected error occurred/i.test(txt)).to.eq(true);
    });
  });

  it('persists form values via redux on reload and restores when returning to sign-up', () => {
    cy.get('[data-cy="first-name-input"]').type('Jane');
    cy.get('[data-cy="last-name-input"]').type('Roe');
    cy.get('[data-cy="email-input"]').type('jane@example.com');
    cy.get('[data-cy="password-input"]').type('Password1!');
    cy.get('[data-cy="confirm-password-input"]').type('Password1!');

    cy.reload();

    cy.window().then((win) => {
      expect(win.sessionStorage.getItem('currentPage')).to.eq('sign-up');
    });

    cy.get('[data-cy="first-name-input"]').should('have.value', 'Jane');
    cy.get('[data-cy="last-name-input"]').should('have.value', 'Roe');
    cy.get('[data-cy="email-input"]').should('have.value', 'jane@example.com');
    cy.get('[data-cy="password-input"]').should('have.value', 'Password1!');
    cy.get('[data-cy="confirm-password-input"]').should('have.value', 'Password1!');
  });
});

