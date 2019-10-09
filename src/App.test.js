import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

const CURRENT_YEAR = new Date().getFullYear();

it('renders the header and footer', () => {
  const { getByText } = render(<App />);
  expect(getByText(/my.*wallet/)).toMatchSnapshot();
  expect(getByText(`© ${CURRENT_YEAR}`)).toHaveTextContent(`© ${CURRENT_YEAR} ReliantNode`);
});
