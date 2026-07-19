import { redirect } from 'next/navigation';

/*{
    Function Name: Home
    Purpose: Redirects the user to the dashboard
    Parameters: None
}*/
export default function Home() {
  redirect('/dashboard');
}
