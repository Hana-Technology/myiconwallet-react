import React from 'react';
import { render } from '@testing-library/react';
import Logo from './Logo';

function renderLogo(props = {}) {
  const { getByTestId } = render(<Logo {...props} />);
  return {
    logo: getByTestId('logo'),
    icon: getByTestId('logo-icon'),
    text: getByTestId('logo-text'),
  };
}

it('renders with no props passed', () => {
  const { logo } = renderLogo();
  expect(logo).toMatchSnapshot();
});

it('applies classes to the svg element', () => {
  const { logo, icon, text } = renderLogo({ className: 'text-white' });
  expect(logo).toHaveClass('text-white');
  expect(icon).not.toHaveAttribute('class');
  expect(text).not.toHaveAttribute('class');
});

it('applies classes to the icon and text g elements', () => {
  const { logo, icon, text } = renderLogo({
    iconClassName: 'text-cyan',
    textClassName: 'text-white',
  });
  expect(icon).toHaveClass('text-cyan');
  expect(text).toHaveClass('text-white');
  expect(logo).toHaveClass('fill-current inline align-middle');
});
