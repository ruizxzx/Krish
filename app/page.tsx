import { Portfolio } from '@/components/Portfolio';
import { getPortfolioContent } from '@/lib/cms';

export const revalidate = 60;

export default async function Page() {
  const content = await getPortfolioContent();
  return <Portfolio content={content} />;
}
