export const metadata = {
  title: "Subjects - IGCSE"
};

import {Home} from '@/components/homenav'
export default function RootLayout({ children }) {
  return (<><Home showExtra/> {children}</>)
}