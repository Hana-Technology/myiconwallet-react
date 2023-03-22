import React from 'react';
import { render } from '@testing-library/react';
import Header from './Header';

it('renders the logo', () => {
  const { getByText } = render(<Header />);
  expect(getByText(/my.*wallet/)).toMatchSnapshot();
});

it('renders the nav links', () => {
  const { getByText } = render(<Header />);
  const unlockLink = getByText('Unlock');
  expect(unlockLink).toBeInTheDocument();
  expect(unlockLink).toHaveAttribute('href', '/unlock');
});
