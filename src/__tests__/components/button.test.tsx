import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Test Button</Button>);
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>);
    const button = screen.getByText('Delete');
    expect(button).toHaveClass('bg-destructive');
  });

  it('applies size classes correctly', () => {
    render(<Button size="sm">Small Button</Button>);
    const button = screen.getByText('Small Button');
    expect(button).toHaveClass('h-9');
  });

  it('handles disabled state', () => {
    render(<Button disabled>Disabled Button</Button>);
    const button = screen.getByText('Disabled Button');
    expect(button).toBeDisabled();
  });
});
