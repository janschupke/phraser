import { Link } from 'react-router';
import { PageTitle } from '../components/ui/PageTitle';
import { Card } from '../components/ui/Card';

function NotFound() {
  return (
    <div className="w-full max-w-2xl mx-auto text-center page-transition-enter">
      <PageTitle>Page not found</PageTitle>
      <Card className="p-8 sm:p-12">
        <p className="text-neutral-600 text-lg sm:text-xl mb-6">That page does not exist.</p>
        <Link
          to="/"
          className="text-primary-600 hover:text-primary-700 font-medium underline rounded-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Go to Add Translation
        </Link>
      </Card>
    </div>
  );
}

export default NotFound;
