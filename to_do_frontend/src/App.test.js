import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header and add form', () => {
  render(<App />);
  expect(screen.getByText(/Simple To‑Do/i)).toBeInTheDocument();
  expect(screen.getByText(/Add a new task/i)).toBeInTheDocument();
});
