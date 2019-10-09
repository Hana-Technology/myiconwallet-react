import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

const CURRENT_YEAR = new Date().getFullYear();

it('renders the copyright link', () => {
  const { getByText } = render(<App />);
  expect(getByText(`© ${CURRENT_YEAR}`)).toHaveTextContent(`© ${CURRENT_YEAR} ReliantNode`);
});
