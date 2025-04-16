'use client';

import { Toaster } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return <Toaster position="bottom-right" richColors />;
}
