import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Visualize action', () => {
  render(<App />);
  const visualize = screen.getByText(/Visualize!/i);
  expect(visualize).toBeInTheDocument();
});
