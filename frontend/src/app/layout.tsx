import './globals.css';
import ToastProvider from '@/components/ToastProvider';

export const metadata = {
  title: 'Job Scheduler',
  description: 'Create and manage scheduled jobs',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
