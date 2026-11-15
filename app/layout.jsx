import './globals.css';

export const metadata = {
  title: 'COiN Lab | Computational Intelligence Lab',
  description: 'A research community advancing responsible computational intelligence at Southeast University.'
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
