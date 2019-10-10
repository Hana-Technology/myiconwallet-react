import React from 'react';
import { render } from '@testing-library/react';
import Header from './Header';

it('renders the logo', () => {
  const { getByText } = render(<Header />);
  expect(getByText(/my.*wallet/)).toMatchSnapshot();
});

it('renders the nav links', () => {
  const { getByText } = render(<Header />);
  const createLink = getByText('Create Wallet');
  expect(createLink).toBeInTheDocument();
  expect(createLink).toHaveAttribute('href', '/create');
  const updateLink = getByText('Unlock');
  expect(updateLink).toBeInTheDocument();
  expect(updateLink).toHaveAttribute('href', '/unlock');
});
