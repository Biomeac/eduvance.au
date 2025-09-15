import { Home } from '@/components/homenav';
import PopupManager from '@/components/ui/PopupNotification';

export default function Layout({ children }) { 
  return (
    <PopupManager>
      <Home showExtra dontShowload/>
      {children}
    </PopupManager>
  );
}