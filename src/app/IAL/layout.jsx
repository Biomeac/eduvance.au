export const metadata = {
  title: "Subjects - IAL"
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<><Home showExtra/> {children}</>)
}