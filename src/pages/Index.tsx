import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Star, Shield } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import TopRightControls from "@/components/TopRightControls";
import { ServiceHistory } from "@/components/ServiceHistory";
import { EquipmentScanner } from "@/components/EquipmentScanner";
import { TroubleshootingWizard } from "@/components/TroubleshootingWizard";
import { PhotoDiagnosis } from "@/components/PhotoDiagnosis";
import { CostEstimator } from "@/components/CostEstimator";
import { Tooltip } from "@/components/Tooltip";
import { getAllDevices, subscribeToDevices, generateRouteSlug, type DeviceWithBrand } from "@/lib/deviceManager";

const Index = () => {
  const { isAdmin } = useUserRole();
  const [devices, setDevices] = useState<DeviceWithBrand[]>([]);

  useEffect(() => {
    getAllDevices().then(setDevices);
    const unsubscribe = subscribeToDevices((newDevices) => setDevices(newDevices));
    return unsubscribe;
  }, []);

  return (
    <div className="page-container">
      <TopRightControls />

      <main>
        <h1 className="header">JR Heat Pumps</h1>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          <Tooltip content="View service history"><ServiceHistory /></Tooltip>
          <Tooltip content="Scan equipment QR code"><EquipmentScanner /></Tooltip>
          <Tooltip content="Open troubleshooting wizard"><TroubleshootingWizard /></Tooltip>
          <Tooltip content="Upload photo for diagnosis"><PhotoDiagnosis /></Tooltip>
          <Tooltip content="Estimate repair costs"><CostEstimator /></Tooltip>
        </div>

        <nav className="button-container">
          <Tooltip content="View favorites">
            <Link
              to="/favorites"
              className="nav-button flex items-center justify-center gap-2"
            >
              <Star size={20} />
              My Favorites
            </Link>
          </Tooltip>

          {devices.map((d) => {
            const name = `${d.brand?.name || "Unknown Brand"} — ${d.name}`;
            const slug = generateRouteSlug(d.brand?.name || "", d.name);
            return (
              <Tooltip key={d.id} content={`Open ${name} page`}>
                <Link to={`/device/${slug}`} className="nav-button">
                  {name}
                </Link>
              </Tooltip>
            );
          })}

          {isAdmin && (
            <Tooltip content="Open admin dashboard">
              <Link
                to="/admin"
                className="nav-button flex items-center justify-center gap-2 bg-primary/10 border-primary"
              >
                <Shield size={20} />
                Admin Dashboard
              </Link>
            </Tooltip>
          )}
        </nav>
      </main>
    </div>
  );
};

export default Index;
