import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export function Premium() {
  return (
    <Card className='gap-2 py-4 shadow-none'>
      <CardHeader className='px-4'>
        <CardTitle className='text-sm'>Upgrade to Compose Plus</CardTitle>
        <CardDescription>
          Upgrade to Premium to unlock more features.
        </CardDescription>
      </CardHeader>
      <CardContent className='px-4'>
        <form>
          <div className='grid gap-2.5'>
            <Button
              className='bg-sidebar-primary text-sidebar-primary-foreground w-full shadow-none'
              size='sm'
            >
              Upgrade to Plus
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
