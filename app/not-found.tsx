import Link from 'next/link';

export default function NotFound() {
  return <main className="error-page"><span className="micro">KRISH / 404</span><h1>Lost in the<br/><span>interface.</span></h1><Link href="/">Return home ↗</Link></main>;
}
