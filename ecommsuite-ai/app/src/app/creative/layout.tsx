import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function CreativeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-dark-50">
      <Sidebar />
      <Header />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
