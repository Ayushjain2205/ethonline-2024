import TopBar from "./functional/TopBar";
import BottomBar from "./functional/BottomBar";

interface LayoutProps {
  children: React.ReactNode;
  usdcBalance: string | null;
}

const Layout = ({ children, usdcBalance }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopBar usdcBalance={usdcBalance} />
      <main className="flex-grow container mx-auto px-4 py-6 mt-16 mb-16">
        {children}
      </main>
      <BottomBar />
    </div>
  );
};

export default Layout;
