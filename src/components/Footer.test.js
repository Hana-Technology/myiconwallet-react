import React from 'react';
import { render } from '@testing-library/react';
import Footer from './Footer';

const CURRENT_YEAR = new Date().getFullYear();

it('renders the copyright link', () => {
  const { getByText } = render(<Footer />);
  expect(getByText(`© ${CURRENT_YEAR}`)).toHaveTextContent(`© ${CURRENT_YEAR} ReliantNode`);
});
